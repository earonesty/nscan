import { SimplePool, Event } from 'nostr-tools';
import "websocket-polyfill";


export class MapD<K, V> extends Map<K, V> {
  default: () => any;
  
  get(key: any) {
    if (!this.has(key)) {
      this.set(key, this.default());
    }
    return super.get(key) as V;
  }

  constructor(def_func: ()=>V) {
    super();
    this.default = def_func;
  }
}


export type ChannelInfo = {
  msg: any;
  ev: Event | null;
  up: Event[];
  cnt: 0;
};


export type ChannelMap = Map<string, ChannelInfo>

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function scan1(relays: string[], pool: SimplePool, days: number, msg_cnt:number): Promise<ChannelMap> {
  return new Promise(async (res) => {
    const known_channels: MapD<string, ChannelInfo> = new MapD(() => ({ ev: null, up: [], cnt: 0, msg: [] }));
    const since = ~~(Date.now() / 1000) - (86400 * days)

    const lst = await pool.list(
      relays,
      [
        {
          kinds: [40, 41, 42],
          since: since
        }
      ]
    );


    const sub = pool.sub(
      relays,
      [
        {
          kinds: [40, 41, 42],
          since: since
        }
      ]
    );

    sub.on('event', (ev: Event) => {
      switch (ev.kind) {
        case 40: handle_create(ev);
        case 41: handle_update(ev);
        case 42: handle_message(ev);
      }
    });

    sub.on('eose', () => {
      sub.unsub()
      res(known_channels);
    });

    function handle_create(ev: Event) {
      known_channels.get(ev.id).ev = ev;
    }

    function handle_update(ev: Event) {
      const tag_e = ev.tags.find(t => t[0] == "e");
      if (!tag_e) return
      known_channels.get(tag_e[1]).up.push(ev);
    }

    function handle_message(ev: Event) {
      const tag_e = ev.tags.find(t => t[0] == "e");
      if (!tag_e) return
      const m = known_channels.get(tag_e[1]);
      m.cnt += 1
      if (m.msg,length < msg_cnt) {
        m.msg.push(ev);
      }
    }
  });
}

export function scan2(relays: string[], pool: SimplePool, ids: string[]): Promise<Event[]> {
  return pool.list(
    relays,
    [
      {
        ids: ids
      }
    ]
  );
}

export function needCreates(channels: ChannelMap): string[] {
  const need_creates: string[] = [];
  for (const [id, info] of channels.entries()) {
    if (!info.ev) {
      need_creates.push(id);
    }
  }
  return need_creates;
}

export function bestChannels(channels: ChannelMap, top: number): ChannelMap {
  let lst = [...channels.entries()];

  lst.sort((a, b) => {
    return b[1].cnt - a[1].cnt;
  });
  lst = lst.slice(0, top);
  lst = lst.filter(([id, inf]) => inf.cnt > 0);
  return new Map(lst);
}


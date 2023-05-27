#!/usr/bin/env node

import { Command } from 'commander'
const program = new Command()

import { SimplePool, Event } from 'nostr-tools';

import * as fs from 'fs';
import { ChannelMap, scan1, scan2 } from './scan';
import { bestChannels, needCreates } from './scan';

const DEFAULT_RELAYS = [
    'wss://relay1.nostrchat.io',
    'wss://relay2.nostrchat.io',
    'wss://relay.damus.io',
    'wss://relay.snort.social',
    'wss://nos.lol',
]

const DEFAULT_TOP = 50
const DEFAULT_DAYS = 1
const DEFAULT_MSGS = 20

program
  .option('-c, --config <file>', 'Specify a config file', "./nscan.json")
  .parse(process.argv);

const opts = program.opts()
let cfg: {days?: number, top?: number, msgs?: number, relays?: string[]}
try {
  const cfg_dat = fs.readFileSync(opts.config, {"encoding": 'utf-8'});
  cfg = JSON.parse(cfg_dat)
} catch (e) {
  console.log(`# no ${opts.config} file, using defaults`)
  cfg = {}
}

export const days = cfg.days??DEFAULT_DAYS
export const top = cfg.top??DEFAULT_TOP
export const msg_cnt = cfg.msgs??DEFAULT_MSGS
const relays = cfg.relays??DEFAULT_RELAYS

async function main() {
    const pool = new SimplePool()

    console.log(`# collecting ${days} days of info`)

    let channels: ChannelMap = await scan1(relays, pool, days, msg_cnt)
    channels = bestChannels(channels, top);

    const need_creates: string[] = needCreates(channels);

    console.log(`# collecting missing ${need_creates.length} create ids`)

    for (const ev of await scan2(relays, pool, need_creates)) {
      channels.get(ev.id)!.ev = ev
    }

    pool.close(relays)
    console.log(channels)
}

main()



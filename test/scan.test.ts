import { SimplePool } from 'nostr-tools';
import { scan1, scan2, bestChannels, needCreates } from '../src/scan';
import 'websocket-polyfill'

test('simple scan', async () => {
  const pool = new SimplePool()
  const relays = ["wss://nos.lol"]
  await pool.ensureRelay(relays[0])
  let chn = await scan1(relays, pool, 0.5, 5)
  expect([...chn.values()].length).toBeGreaterThan(0)
  console.log(chn)
  chn = bestChannels(chn, 10);
  expect([...chn.values()].length).toBeGreaterThan(0)
  console.log(chn)
  const need = needCreates(chn);
  expect(need.length).toBeGreaterThan(0)
  console.log(need)
  const evs = await scan2(relays, pool, need)
  expect(evs.length).toBeGreaterThan(0)

  pool.close(relays)
});


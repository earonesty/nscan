#!/usr/bin/env node

import { Command } from 'commander'
const program = new Command()
import * as fs from 'fs';
import { scanChannels, Config } from './scan';

const DEFAULT_RELAYS = [
    'wss://relay1.nostrchat.io',
    'wss://relay2.nostrchat.io',
    'wss://relay.damus.io',
    'wss://relay.snort.social',
    'wss://nos.lol',
]


const DEFAULT_CFG: Config = {
  top: 50,
  days: 1,
  msgs: 20,
  out: "top.json",
  relays: DEFAULT_RELAYS,
};

program
  .option('-c, --config <file>', 'Specify a config file', "./nscan.json")
  .parse(process.argv);

const opts = program.opts()
const cfg = DEFAULT_CFG

try {
  const cfg_dat = fs.readFileSync(opts.config, {"encoding": 'utf-8'});
  Object.assign(cfg, JSON.parse(cfg_dat))
} catch (e) {
  console.log(`# no ${opts.config} file, using defaults`)
}

async function main() {
    const channels = await scanChannels(cfg)
    console.log(`writing to ${cfg.out}`)
    fs.writeFileSync(cfg.out, JSON.stringify(channels), {encoding: "utf-8"})
}

main()



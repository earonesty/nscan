# nscan

Scan for nostr chat channel activity

Usage:
   nscan [-c config]


Config:

- `top` (number): Specifies the top # of channels to report.
- `days` (number): Specifies the number of days to look back.
- `msgs` (number): Specifies the number of sample messages to accumulate.
- `minlen` (number): Specifies the minimum len to count as a nice sample message.
- `out` (string): Specifies the output file name (default `top.json`).
- `relays` (string[]): Specifies an array of relay names.


Import:

```ts

import scanChannels from 'nscan'

await scanChannels(... config ...)
```

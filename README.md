# nscan

Scan for nostr chat channel activity.

Usage:
   nscan [-c config]


Config:

- `top` (number): Specifies the top # of channels to report. (default 50)
- `days` (number): Specifies the number of days to look back. (default 1)
- `msgs` (number): Specifies the number of sample messages to accumulate. (default 20)
- `minlen` (number): Specifies the minimum len to count as a nice sample message. (default 0)
- `out` (string): Specifies the output file name (default `top.json`).
- `relays` (string[]): Specifies an array of relay names.

Default cfg name is "nscan.json"

Import:

```ts

import scanChannels from 'nscan'

await scanChannels(... config ...)
```

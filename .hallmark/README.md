# .hallmark/ — Build log & waivers

## waivers.jsonl

One JSON object per line. Supported fields:

| Field | Required | Description |
|---|---|---|
| `id` | yes | Gate id, e.g. `A9` |
| `reason` | yes | Written justification (never waive silently) |
| `file` | no | Substring match on file path (legacy) |
| `glob` | no | Glob pattern with `*` and `**` (preferred) |
| `line` | no | Specific line number; omit to match all lines in file |
| `expires` | no | ISO date `YYYY-MM-DD`; waiver inactive after this date |
| `scope` | deprecated | Legacy field; maps to any file with a deprecation warning |

If neither `file` nor `glob` is specified, the waiver matches any file.

## log.json

JSON array of build/resolution entries. Each entry:

```json
{
  "slug": "site",
  "event": "bootstrap | build | resolve | drift-report",
  "status": "draft | approved | built | drifted",
  "spec": "docs/designs/<slug>/spec.md",
  "files": ["index.html", "assets/css/style.css"],
  "waivers": ["A9", "A10"],
  "timestamp": "ISO 8601",
  "reviewer": "who said ship"
}
```

Append new entries; never edit or delete old ones (audit trail).

## Expiration policy

Waivers expire on their `expires` date. Expired waivers cause the scanner to report the underlying finding as a hard fail, forcing a re-evaluation. Default expiry: 1 year from creation.
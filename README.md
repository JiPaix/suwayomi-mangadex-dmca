# suwayomi-mangadex-dmca

CLI tool to check MangaDex titles in your Suwayomi library that match takedown (DMCA) entries from a shared Google Sheet.

---

## Usage

### With `npx` (Node.js)

```bash
npx suwayomi-mangadex-dmca "http://127.0.0.1:4567"
```

### With `bunx`

```bash
bunx suwayomi-mangadex-dmca "http://127.0.0.1:4567"
```

If your Suwayomi server requires authentication, use:

```bash
npx suwayomi-mangadex-dmca "http://username:password@127.0.0.1:4567"
```

---

### With `deno`

```bash
deno run -A https://deno.land/x/suwayomi_mangadex_dmca/main.ts "http://127.0.0.1:4567"
```

---

## Output

The script prints a table of matching entries with:

* Manga title
* Category
* Status
* Direct Suwayomi URL

---

## Example

```bash
$ npx suwayomi-mangadex-dmca "http://127.0.0.1:4567"
┌─────────┬─────────────────────────────┬───────────┬────────────┬────────────────────────────────────────┐
│ (index) │ title                       │ category  │ status     │ url                                    │
├─────────┼─────────────────────────────┼───────────┼────────────┼────────────────────────────────────────┤
│ 0       │ "Some Manga Title"          │ "Reading" │ "ONGOING"  │ "http://127.0.0.1:4567/12345"          │
└─────────┴─────────────────────────────┴───────────┴────────────┴────────────────────────────────────────┘
```

---

## License

MIT

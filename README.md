# suwayomi-mangadex-dmca

CLI utility to identify MangaDex titles in your Suwayomi library affected by takedowns — known as [The MangaDex Massacre](https://docs.google.com/spreadsheets/d/1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0).

It compares your library against a community-maintained Google Sheet to flag entries that are either removed from the sheet (STRIKED) or have over 10% missing chapters (SUSPICIOUS), then outputs both a console table and a CSV file (`mangadex.csv`).

---

## 📦 Installation & Usage

### Run via `npx` (Node.js)

```bash
npx suwayomi-mangadex-dmca "http://127.0.0.1:4567"
```

### Run via `bunx`

```bash
bunx suwayomi-mangadex-dmca "http://127.0.0.1:4567"
```

### Run via `deno`

```bash
deno run --allow-net --allow-write index.ts "http://127.0.0.1:4567"
```

> **Note:**
>
> * `--allow-net` is required to fetch data from your Suwayomi server and Google Sheets.
> * `--allow-write` is required to generate the `mangadex.csv` file.

---

## 🔐 Authentication

If your Suwayomi instance requires basic auth, include credentials in the URL:

```bash
npx suwayomi-mangadex-dmca "http://username:password@127.0.0.1:4567"
```

Same applies for `bunx` or `deno run` usage.

---

## 📊 Output

This tool produces two outputs:

1. **Console Table**

   * **Title**: Manga title in your library
   * **Categories**: Associated categories (if any)
   * **Status**: Manga status (e.g. ONGOING, COMPLETED)
   * **Type**: `STRIKED` if present in Mangadex Massacre sheet, or `SUSPICIOUS` if >10% chapters missing
   * **% Of missing chapters**: Percentage of chapters missing
   * **URL**: Direct link to the manga on your Suwayomi web UI

2. **CSV File** (`mangadex.csv`)

   * Same columns as above, exported to the current directory.

---

## 🧪 Example Output

```bash
$ npx suwayomi-mangadex-dmca "http://127.0.0.1:4567"
┌─────────┬─────────────────────────────┬──────────────────┬────────────┬───────────────┬─────────────────────────┬────────────────────────────────────────┐
│ (index) │ Title                       │ Categories       │ Status     │ Type          │ % Of missing chapters  │ URL                                     │
├─────────┼─────────────────────────────┼──────────────────┼────────────┼───────────────┼─────────────────────────┼────────────────────────────────────────┤
│ 0       │ "Striked Manga Title"       │ ["Drama"]        │ "COMPLETED"│ STRIKED       │ 100.00                  │ "http://127.0.0.1:4567/manga/11111"    │
│ 1       │ "Suspicious Manga Title"    │ ["Action"]       │ "ONGOING"  │ SUSPICIOUS    │ 41.20                   │ "http://127.0.0.1:4567/manga/22222"    │
└─────────┴─────────────────────────────┴──────────────────┴────────────┴───────────────┴─────────────────────────┴────────────────────────────────────────┘
Data exported to /path/to/mangadex.csv
```

---

## 📄 License

MIT

---

## 👤 Maintainer

[jipaix](https://github.com/jipaix) — contributions and issues welcome!

# suwayomi-mangadex-dmca

Web & CLI utility for identifying manga entries in your Suwayomi library that are either missing chapters or have been removed due to takedowns.

It uses a community-maintained Google Sheet — [**“The MangaDex Massacre”**](https://docs.google.com/spreadsheets/d/1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0) — which lists entries under DMCA notices.

Entries are flagged in two categories:

* **DMCA**: entries that are part of the DMCA list.
* **SUSPICIOUS**: entries that miss more than 10% of their chapters.

---

## 🌐 Web Interface (Recommended)

No installation needed—open your browser for a full GUI experience:

[https://jipaix.github.io/suwayomi-mangadex-dmca/](https://jipaix.github.io/suwayomi-mangadex-dmca/)

* Interactive GUI for selecting your Suwayomi instance
* Displays all results in a sortable table
* Supports **any** manga source configured in Suwayomi (not just MangaDex)
* Export the table as CSV for further analysis

---

## 📦 CLI Installation & Usage

A lightweight terminal client focused solely on MangaDex libraries:

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

If authentication is required, embed credentials in the URL:

```bash
npx suwayomi-mangadex-dmca "http://username:password@127.0.0.1:4567"
```

---

## 📊 Output

Both interfaces produce:

1. **Results Table**

   * **Title**: Manga title in your library
   * **Categories**: Associated categories
   * **Reading status**: ONGOING, COMPLETED, etc.
   * **Detection type**: `DMCA` or `SUSPICIOUS`
   * **Missing chaps (%)**: Percentage of chapters missing
   * **URL**: Link to the manga on your Suwayomi UI

2. **CSV File** (`mangadex.csv`)

   * Same columns as above, downloadable from web or saved locally by the CLI.

---

## 🧪 Example CLI Output

```bash
$ npx suwayomi-mangadex-dmca "http://127.0.0.1:4567"
┌─────────┬─────────────────────────────┬──────────────────┬──────────────────┬────────────────┬─────────────────────────┬────────────────────────────────────────┐
│ (index) │ Title                       │ Categories       │ Reading status   │ Detection type │ Missing chaps (%)       │ URL                                    │
├─────────┼─────────────────────────────┼──────────────────┼──────────────────┼────────────────┼─────────────────────────┼────────────────────────────────────────┤
│ 0       │ "DMCA-Listed Manga"         │ ["Drama"]        │ "COMPLETED"      │ "DMCA"         │ 100.00                  │ "http://127.0.0.1:4567/manga/11111"    │
│ 1       │ "Manga >10% Missing chaps"  │ ["Action"]       │ "ONGOING"        │ "SUSPICIOUS"   │ 41.20                   │ "http://127.0.0.1:4567/manga/22222"    │
└─────────┴─────────────────────────────┴──────────────────┴──────────────────┴────────────────┴─────────────────────────┴────────────────────────────────────────┘
Data exported to /path/to/mangadex.csv
```

---

## 📄 License

MIT

---

## 👤 Maintainer

[jipaix](https://github.com/jipaix) — contributions and issues welcome!

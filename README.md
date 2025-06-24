# suwayomi-mangadex-dmca

CLI & Web utility to identify MangaDex titles in your Suwayomi library affected by takedowns — known as [The MangaDex Massacre](https://docs.google.com/spreadsheets/d/1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0).

It compares your library against a community-maintained Google Sheet to flag entries that are either removed from the sheet (STRIKED) or have over 10% missing chapters (SUSPICIOUS). You can run it via a **graphical web interface** or a **command-line client**, producing both an on-screen table and a CSV report.

---

## 🌐 Web Interface (Recommended)

No installation needed—just open your browser:

[https://jipaix.github.io/suwayomi-mangadex-dmca/](https://jipaix.github.io/suwayomi-mangadex-dmca/)

* Interactive GUI for selecting your Suwayomi instance
* Instant visual results and CSV download

---

## 📦 CLI Installation & Usage

If you prefer a terminal-based workflow, install and run the CLI:

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

If your Suwayomi instance requires basic auth, include credentials in the URL:

```bash
npx suwayomi-mangadex-dmca "http://username:password@127.0.0.1:4567"
```

---

## 📊 Output

Both the web client and CLI produce:

1. **Results Table**

   * **Title**: Manga title in your library
   * **Categories**: Associated categories
   * **Reading status**: ONGOING, COMPLETED, etc.
   * **Detection type**: `STRIKED` or `SUSPICIOUS`
   * **Missing chaps (%)**: Percentage of chapters missing
   * **URL**: Link to the manga on your Suwayomi UI

2. **CSV File** (`mangadex.csv`)

   * Same columns as above, downloadable directly from the web UI or saved locally by the CLI.

---

## 🧪 Example CLI Output

```bash
$ npx suwayomi-mangadex-dmca "http://127.0.0.1:4567"
┌─────────┬─────────────────────────────┬──────────────────┬──────────────────┬────────────────┬─────────────────────────┬────────────────────────────────────────┐
│ (index) │ Title                       │ Categories       │ Reading status   │ Detection type │ Missing chaps (%)       │ URL                                    │
├─────────┼─────────────────────────────┼──────────────────┼──────────────────┼────────────────┼─────────────────────────┼────────────────────────────────────────┤
│ 0       │ "Striked Manga"             │ ["Drama"]        │ "COMPLETED"      │ "STRIKED"      │ 100.00                  │ "http://127.0.0.1:4567/manga/11111"    │
│ 1       │ "Manga w/ missing chaps"    │ ["Action"]       │ "ONGOING"        │ "SUSPICIOUS"   │ 41.20                   │ "http://127.0.0.1:4567/manga/22222"    │
└─────────┴─────────────────────────────┴──────────────────┴──────────────────┴────────────────┴─────────────────────────┴────────────────────────────────────────┘
Data exported to /path/to/mangadex.csv
```

---

## 📄 License

MIT

---

## 👤 Maintainer

[jipaix](https://github.com/jipaix) — contributions and issues welcome!

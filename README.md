# suwayomi-mangadex-dmca

CLI utility to identify MangaDex titles in your Suwayomi library affected by takedowns — known as [The Mangadex Massacre](https://docs.google.com/spreadsheets/d/1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0).

It compares your library against a community-maintained Google Sheet and prints a list of flagged titles.

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
deno run -A npm:suwayomi-mangadex-dmca "http://127.0.0.1:4567"
```

---

## 🔐 Authentication

If your Suwayomi instance requires basic auth, pass it in the URL:

```bash
npx suwayomi-mangadex-dmca "http://username:password@127.0.0.1:4567"
```

Same applies to `bunx` or `deno run` usage.

---

## 📊 Output

Displays a formatted table of MangaDex titles found in your Suwayomi library:

* **Title**: Manga title in your library
* **Category**: Associated Suwayomi category
* **Status**: Manga status (e.g. ONGOING, COMPLETED)
* **URL**: Direct link to manga entry in your Suwayomi web UI

---

## 🧪 Example Output

```bash
$ npx suwayomi-mangadex-dmca "http://127.0.0.1:4567"
┌─────────┬─────────────────────────────┬───────────┬────────────┬────────────────────────────────────────┐
│ (index) │ title                       │ category  │ status     │ url                                    │
├─────────┼─────────────────────────────┼───────────┼────────────┼────────────────────────────────────────┤
│ 0       │ "Some Manga Title"          │ "Reading" │ "ONGOING"  │ "http://127.0.0.1:4567/12345"          │
└─────────┴─────────────────────────────┴───────────┴────────────┴────────────────────────────────────────┘
```

---

## 📄 License

MIT

---

## 👤 Maintainer

[jipaix](https://github.com/jipaix) — Contributions and issues welcome!

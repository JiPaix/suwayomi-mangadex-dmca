import { ERROR, printError, Table, toCSV, truncateString } from "./utils";
import { Suwayuomi } from "./suwayomi";
import { Gdoc } from "./gdoc";
import { writeFileSync } from "node:fs";
let TEMPURL = process.execArgv[0]
let SUWAYOMI: URL;

if (!TEMPURL) {
  console.error(ERROR);
  process.exit(1)
} else {
  try {
    const url = new URL(TEMPURL);
    url.search = "";
    url.pathname = "/";
    url.hash = "";
    SUWAYOMI = url;
  } catch (e) {
    printError(e);
    process.exit(1);
  }
}

const GRAPHQL_URL = new URL(SUWAYOMI.toString());
GRAPHQL_URL.pathname = "/api/graphql";
const SHEET_ID = "1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0";
const GID = "0";
const CSV_URL = new URL(
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&id=${SHEET_ID}&gid=${GID}`,
);

async function main() {
  const suwayomi = new Suwayuomi(GRAPHQL_URL);
  const gdoc = new Gdoc(CSV_URL);

  const gSheet = await gdoc.do()
    .catch((e) => {
      printError(e, { text: "Google Sheet", position: 0 });
      process.exit(1);
    });

  const local = await suwayomi.do()
    .catch((e) => {
      printError(e, { text: "Suwayomi Instance", position: 0 });
      process.exit(1);
    });

  try {
    const match = local
      .map((v) => {
        let type: Table[0]["Detection type"] = "NONE";

        if (gSheet.some((x) => v.realUrl.includes(x.uuid))) type = "DMCA";
        else if (v.missingPercent > 0.1) type = "SUSPICIOUS";

        return {
          "Title": v.title,
          "Categories": v.categories,
          "Reading status": v.status,
          "Detection type": type,
          "Missing chaps (%)": Number((v.missingPercent * 100).toFixed(1)),
          "URL": `${SUWAYOMI.origin}/manga/${v.id}`,
        };
      })
      .filter((v) => v["Detection type"] !== "NONE") as Table<true>;

    const table = match.sort((a, b) => {
      const typePriority = (type: string) => {
        if (type === "DMCA") return 0;
        if (type === "SUSPICIOUS") return 1;
        return 2;
      };

      const typeDiff = typePriority(a["Detection type"]) -
        typePriority(b["Detection type"]);
      if (typeDiff !== 0) return typeDiff;

      return b["Missing chaps (%)"] - a["Missing chaps (%)"];
    }).map((v) => ({
      ...v,
      "Missing chaps (%)": v["Detection type"] === "DMCA"
        ? 100
        : v["Missing chaps (%)"],
      Title: truncateString(v.Title, 50),
    }));

    console.table(table);

    const csv = toCSV(match);
    const path = new URL("./mangadex.csv", import.meta.url);
    
    writeFileSync(path, csv, { encoding: 'utf-8' });
    console.log(`Data exported to ${path.toString()}`);
  } catch (e) {
    printError(e);
    process.exit(1);
  }
}

main();

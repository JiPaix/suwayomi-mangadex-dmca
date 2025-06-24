import { ERROR, printError, Table, toCSV, truncateString } from "./utils.ts";
import { Suwayuomi } from "./suwayomi.ts";
import { Gdoc } from "./gdoc.ts";

let TEMPURL = Deno.args[0];
let SUWAYOMI: URL;

if (!TEMPURL) {
  console.error(ERROR);
  Deno.exit(1);
} else {
  try {
    const url = new URL(TEMPURL);
    url.search = "";
    url.pathname = "/";
    url.hash = "";
    SUWAYOMI = url;
  } catch (e) {
    printError(e);
    Deno.exit(1);
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
      Deno.exit(1);
    });

  const local = await suwayomi.do()
    .catch((e) => {
      printError(e, { text: "Suwayomi Instance", position: 0 });
      Deno.exit(1);
    });

  try {
  const match:Table = local
    .map((v) => {
      let type = "NONE";

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
    .filter((v) => v['Detection type'] !== "NONE");

  console.table(match.map(v => ({...v, Title: truncateString(v.Title, 50)})));

  const csv = toCSV(match);
  const path = new URL("./mangadex.csv", import.meta.url);
  Deno.writeTextFileSync(path, csv);
  console.log(`Data exported to ${Deno.realPathSync(path)}`);
  } catch(e) {
    printError(e)
    Deno.exit(1);
  }

}

main();


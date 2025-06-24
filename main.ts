import { parse, stringify } from "jsr:@std/csv";

let TEMPURL = Deno.args[0];
let SUWAYOMI: URL

const ERROR = `Usage: node index.js "<SUWAYOMI_URL>"

If your Suwayomi server requires basic authentication, include it in the URL:
  e.g. http://username:password@127.0.0.1:4567`;

function printError(e: unknown, additionalMessage?: { text: string, position: 0 | 1 }) {
  let message = "";
  if(!e) return;
  else if(e instanceof Error) message = e.message;
  else if(typeof e === "string") message = e;
  else return;

  if(!message.length) return;

  if(!additionalMessage) message = message; // lol
  else if(additionalMessage?.position === 0) message = `${additionalMessage.text}: ${message}`;
  else if(additionalMessage?.position === 1) message = `${message}: ${additionalMessage.text}`
  
  console.error(`${message}
____
${ERROR}`);

};

if (!TEMPURL) {
  console.error(ERROR);
  Deno.exit(1);
}
else {
  try {
    const url = new URL(TEMPURL)
    url.search = ""
    url.pathname = "/"
    url.hash = ""
    SUWAYOMI = url
  } catch(e) {
    printError(e)
    Deno.exit(1);
  }
}

const GRAPHQL_URL = new URL(SUWAYOMI.toString());
GRAPHQL_URL.pathname = "/api/graphql"
const SHEET_ID = "1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0";
const GID = "0";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&id=${SHEET_ID}&gid=${GID}`;

// FETCH AND PARSE SUWAYOMI
type GqlResponse<T> = {errors?: any, data?: T}
type MangaFetch = {id:number, title: string, source: string, realUrl: string, categories: string[] | null, status: string, missingPercent: number }
type MangaEntry = {id: number, status: string, title: string, source: {displayName: string}, realUrl: string, chapters: { totalCount: number },  categories: {nodes: {name: string}[]}}

async function fetchGraphQL<T = any>(payload: any): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json() as GqlResponse<T>;

  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error("GraphQL query failed");
  }

  if (!json.data) {
    console.error("GraphQL response missing `data`:", json);
    throw new Error("Invalid GraphQL response: no `data` field");
  }

  return json.data;
}
function countMissingChapters(chapters: number[]): number {
  // Floor all values to their integer part and collect unique whole numbers
  const allFlooredChapters = new Set(chapters.map(ch => Math.floor(ch)));

  const maxChapter = Math.max(...Array.from(allFlooredChapters));
  let missingCount = 0;

  for (let i = 1; i <= maxChapter; i++) {
    if (!allFlooredChapters.has(i)) {
      missingCount++;
    }
  }

  return missingCount;
}
async function fetchChaptersNumber(mangaId: number) {
  const data = await fetchGraphQL({
    operationName: "GET_CHAPTERS_MANGA",
    variables: {order: [{by: "SOURCE_ORDER", byType: "DESC"}]},
    query: `query GET_CHAPTERS_MANGA {
      chapters(condition: {mangaId: ${mangaId}}) {
        nodes {
          chapterNumber
        }
      }
    }`
  })
  return data.chapters.nodes.map((v: {chapterNumber: number}) => v.chapterNumber)
}

async function fetchAllMangas(): Promise<MangaFetch[]> {
  const data = await fetchGraphQL({
    operationName: "GET_MANGAS",
    variables: { order: [{ by: "ORDER" }] },
    query: `query GET_MANGAS {
      mangas(condition: {inLibrary: true, sourceId: "2499283573021220255"}) {
        nodes {
          id
          title
          source {
            displayName
          }
          chapters {
            totalCount
          }
          status
          realUrl
          categories {
            nodes {
              name
            }
          }
        }
      }
    }`
  });

  return Promise.all<MangaFetch[]>(data.mangas.nodes.map(async (v: MangaEntry) => {
    const missing = countMissingChapters(await fetchChaptersNumber(v.id))
    const total = v.chapters.totalCount
    const perc = missing / (total+missing)

    return {
    id: v.id,
    title: v.title,
    source: v.source.displayName,
    realUrl: v.realUrl,
    categories: v.categories.nodes.length ? v.categories.nodes.map((n:{name: string}) => n.name) : null,
    status: v.status,
    missingPercent: perc
  }

  }))

}

// FETCH AND PARSE GDOC
type Entry = {
  title: string;
  originalTitle: string;
  uuid: string;
}

async function fetchTitles(): Promise<Entry[]> {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error("Failed to fetch CSV");

  const csvText = await res.text();

  const records: string[][] = parse(csvText);

  const sliced = records.slice(2); // start from A3
  const data: Entry[] = [];

  for (const row of sliced) {
    const [title, originalTitle, uuid] = row;

    if (title && originalTitle && uuid) {
      data.push({ title, originalTitle, uuid });
    }
  }

  return data;
}

type Result = {title: string, categories: string[], status: string, type: string, missing: number, url: string}

async function main() {
  const gSheet = await fetchTitles().catch((e) => {
    printError(e, {text: "Google Sheet", position: 0})
    Deno.exit(1);
  });
  const local = await fetchAllMangas().catch(e => {
    printError(e, {text: "Suwayomi Instance", position: 0})
    Deno.exit(1);
  });


  const results:Result[] = []

  local.forEach(v => {
    if(gSheet.some(x => v.realUrl.includes(x.uuid))) {
      results.push({title: v.title, categories: v.categories || [], status: v.status, type: "STRIKED", missing: Number((v.missingPercent*100).toFixed(2)), url: `${SUWAYOMI.origin}/manga/${v.id}`})
    } else if (v.missingPercent > 0.1) {
      results.push({title: v.title, categories: v.categories || [], status: v.status, type: "SUSPICIOUS", missing: Number((v.missingPercent*100).toFixed(2)), url: `${SUWAYOMI.origin}/manga/${v.id}`})
    }
  })

  console.table(toPretty(results));
  const path = new URL('./mangadex.csv', import.meta.url);
  Deno.writeTextFileSync(path, toCSV(toPretty(results)));
  console.log(`Data exported to ${Deno.realPathSync(path)}`)
}

function toPretty(results: Result[]) {
  return results.map(v => ({
    "Title": v.title,
    "Categories": v.categories,
    "Status": v.status,
    "Type": v.type,
    "% Of missing chapters": v.missing,
    "URL": v.url
  }))
}

function toCSV(results: ReturnType<typeof toPretty>) {
  return stringify([
    Object.keys(results[0]),
    ...results.map(item => [
      item.Title,
      item.Categories,
      item.Status,
      item.Type,
      item["% Of missing chapters"],
      item.URL
    ])
  ])
}

main();
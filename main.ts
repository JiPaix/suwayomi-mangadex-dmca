import { parse } from "jsr:@std/csv";

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
type MangaEntry = { id: number, title: string, source: { displayName: string }, status: string, realUrl: string, category: string }

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

async function fetchAllCategories(): Promise<{catId: number, catName: string}[]> {
  const data = await fetchGraphQL({
    operationName: "GET_CATEGORIES_LIBRARY",
    variables: { order: [{ by: "ORDER" }] },
    query: `query GET_CATEGORIES_LIBRARY($order: [CategoryOrderInput!]) {
      categories(order: $order) {
        nodes { id name }
      }
    }`
  });

  return data.categories.nodes.map((c: any) => ({catId: c.id, catName: c.name}));
}

async function fetchAllMangasForCategory(categoryId: number): Promise<MangaEntry[]> {
  const data = await fetchGraphQL({
    operationName: "GET_CATEGORY_MANGAS",
    variables: { id: categoryId },
    query: `query GET_CATEGORY_MANGAS($id: Int!) {
      category(id: $id) {
        mangas {
          nodes {
            id title
            source {
              displayName
            }
            status
            realUrl
          }
        }
      }
    }`,
  });

  return data.category.mangas.nodes;
}

async function getAllLibraryMangas(): Promise<MangaEntry[]> {
  const categories = await fetchAllCategories();
  const results: MangaEntry[] = [];

  for (const category of categories) {
    const mangas = await fetchAllMangasForCategory(category.catId);

    results.push(...mangas.map(m => {
      m.category = category.catName
      return m
    }));
  }
  return results;
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

async function main() {
  const gSheet = await fetchTitles().catch((e) => {
    printError(e, {text: "Google Sheet", position: 0})
    Deno.exit(1);
  });
  const local = await getAllLibraryMangas().catch(e => {
    printError(e, {text: "Suwayomi Instance", position: 0})
    Deno.exit(1);
  });

  const striked = local.filter(v => 
    v.source.displayName === "MangaDex (EN)" &&
    gSheet.some(x => v.realUrl.includes(x.uuid))
  ).map(v => ({title: v.title, category: v.category, status: v.status, url: `${SUWAYOMI.origin}/${v.id}`}))

  console.table(striked);
}

main();
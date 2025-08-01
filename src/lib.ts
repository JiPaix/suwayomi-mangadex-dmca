import { Entry, Gdoc } from "./gdoc.ts";
import { MangaFetch, Suwayuomi } from "./suwayomi.ts";
import type { Table } from "./utils.ts";

function err({ error, hmr }: { error?: unknown; hmr: string }) {
  let err: string | null = null;
  if (error instanceof Error) err = error.message;
  if (typeof error === "string") err = error;
  return {
    success: false as false,
    error: hmr,
    originalError: err,
  };
}

function success<T>(data: T) {
  return {
    success: true as true,
    data,
  };
}

async function main(
  { fullURL, sheetId, sheetGid }: {
    fullURL: string;
    sheetId: string;
    sheetGid: number;
  },
) {
  let url: URL;

  try {
    url = new URL(fullURL);
    url.search = "";
    const splitPath = url.pathname.split("/").filter(Boolean);
    url.pathname = splitPath.length > 0 ? splitPath[0] : "/";
    url.hash = "";
  } catch (error) {
    return err({ error, hmr: "Invalid SUWAYOMI URL" });
  }

  let graphql_url: URL;
  let csv_url: URL;

  try {
    graphql_url = new URL(url.toString());
    graphql_url.pathname = graphql_url.pathname === '/' ? '/api/graphql' : `${graphql_url.pathname}/api/graphql`;
    csv_url = new URL(
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}&gid=${sheetGid}`,
    );
  } catch (error) {
    return err({ error, hmr: "Invalid Sheet ID/GID" });
  }

  const suwayomi = new Suwayuomi(graphql_url);
  const gdoc = new Gdoc(csv_url);

  let gSheet: Entry[];

  try {
    gSheet = await gdoc.do();
  } catch (error) {
    return err({ error, hmr: "Could not retrieve google sheet's data" });
  }

  let local: MangaFetch[];

  try {
    local = await suwayomi.do();
  } catch (error) {
    return err({ error, hmr: "Could not retrieve Suwayomi instance's data" });
  }

  try {
    const res = local
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
          "URL": `${url.origin}/manga/${v.id}`,
        };
      })
      .filter((v) => v["Detection type"] !== "NONE") as Table<true>;
    return success(res);
  } catch (error) {
    return err({ error, hmr: "Failed to build the table" });
  }
}

export type { Table } from "./utils.ts";
export { main };

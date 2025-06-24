import { Table } from "./utils.ts";

export type GqlResponse<T> = { errors?: string[] | Error[] | string; data?: T };
export type GqlGetMangas = {
  mangas: {
    nodes: {
      id: number;
      title: string;
      chapters: { totalCount: number };
      source: { displayName: string };
      status: string;
      realUrl: string;
      categories: { nodes: { name: string }[] };
    }[];
  };
};
export type GqlGetChapters = {
  chapters: { nodes: { chapterNumber: number }[] };
};
export type MangaFetch = {
  id: number;
  title: Table[0]['Title'];
  source: string;
  realUrl: Table[0]['URL'];
  categories: Table[0]['Categories'];
  status: Table[0]['Reading status'];
  missingPercent: Table[0]['Missing chaps (%)'];
};

export class Suwayuomi {
  #GRAPHQL_URL: URL;
  constructor(GRAPHQL_URL: URL) {
    this.#GRAPHQL_URL = GRAPHQL_URL;
  }

  async #fetchGraphQL<P extends Record<string, unknown>, T = any>(
    payload: P,
  ): Promise<T> {
    try {
      const res = await fetch(this.#GRAPHQL_URL, {
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
    } catch (e) {
      throw e;
    }
  }

  async #getChapters(mangaId: number): Promise<number[]> {
    const query = {
      operationName: "GET_CHAPTERS_MANGA",
      variables: { order: [{ by: "SOURCE_ORDER", byType: "DESC" }] },
      query: `query GET_CHAPTERS_MANGA {
        chapters(condition: {mangaId: ${mangaId}}) {
          nodes {
            chapterNumber
          }
        }
      }`,
    };
    try {
      const data = await this.#fetchGraphQL<typeof query, GqlGetChapters>(
        query,
      );
      return data.chapters.nodes.map((v: { chapterNumber: number }) =>
        v.chapterNumber
      );
    } catch (e) {
      throw e;
    }
  }

  async #getMangas(): Promise<GqlGetMangas["mangas"]["nodes"]> {
    const query = {
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
      }`,
    };
    try {
      const data = await this.#fetchGraphQL<typeof query, GqlGetMangas>(query);
      return data.mangas.nodes;
    } catch (e) {
      throw e;
    }
  }

  async do(): Promise<MangaFetch[]> {
    try {
      const mangas = await this.#getMangas();
      const results: MangaFetch[] = [];
      for (const manga of mangas) {
        const chapters = await this.#getChapters(manga.id);
        const missing = countMissingChapters(chapters);
        const percentage = missing / (manga.chapters.totalCount + missing);
        results.push({
          id: manga.id,
          title: manga.title,
          source: manga.source.displayName,
          realUrl: manga.realUrl,
          categories: manga.categories.nodes.length
            ? manga.categories.nodes.map((n: { name: string }) => n.name)
            : undefined,
          status: manga.status,
          missingPercent: percentage,
        });
      }
      return results;
    } catch (e) {
      throw e;
    }
  }
}

function countMissingChapters(chapters: number[]): number {
  // Floor all values to their integer part and collect unique whole numbers
  const allFlooredChapters = new Set(chapters.map((ch) => Math.floor(ch)));

  const maxChapter = Math.max(...Array.from(allFlooredChapters));
  let missingCount = 0;

  for (let i = 1; i <= maxChapter; i++) {
    if (!allFlooredChapters.has(i)) {
      missingCount++;
    }
  }

  return missingCount;
}

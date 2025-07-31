import { main } from "./lib.ts";

Deno.test("testing lib", async () => {
  const data = await main({
    fullURL: "http://localhost:4567",
    sheetGid: 0,
    sheetId: "1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0",
  });

  if (!data.success) {
    console.error(data.error);
    throw data.originalError;
  }
});

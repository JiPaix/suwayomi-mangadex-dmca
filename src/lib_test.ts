import { main } from "./lib.ts";
import "jsr:@std/dotenv/load";

const settings = {
  protocol: Deno.env.get('INSTANCE_PROTOCOL') ?? 'http',
  hostname: Deno.env.get('INSTANCE_HOSTNAME') ?? 'localhost',
  port: Deno.env.get('INSTANCE_PORT') ?? "4567",
  id: Deno.env.get('SHEET_ID') ?? "1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0",
  gid: parseInt(Deno.env.get('SHEET_GID') ?? "0")
}

for (const key of Object.keys(settings)) {
  const val = settings[key as keyof typeof settings]
  if(typeof val === 'undefined') throw `Failed to fetch env. "${key}=${val}"` 
}


const fullURL = `${settings.protocol}://${settings.hostname}:${settings.port}`

Deno.test("Library testing", { sanitizeResources: false }, async (t) => {
  
  await t.step("success", async () => {
    const data = await main({
      fullURL,
      sheetGid: settings.gid,
      sheetId: settings.id!
    });
    if(!data.success) throw data.originalError
  });

  await t.step("bad url", async () => {
    const data = await main({
      fullURL: `${fullURL}/failure`,
      sheetGid: settings.gid,
      sheetId: settings.id!
    });
    if(data.success) throw "url with incorrect pathname should not work"
  });

  await t.step("bad id", async () => {
    const data = await main({
      fullURL,
      sheetGid: settings.gid,
      sheetId: '123'
    });
    if(data.success) throw "an incorrect sheetId should not work"
  });

  await t.step("bad gid", async () => {
    const data = await main({
      fullURL,
      sheetGid: 12,
      sheetId: settings.id!
    });
    if(data.success) throw "an incorrect gid should not work"
  });

})



import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of using the describe api
 * ```
 * npx tsx example/describe.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws: true,
  });
  await client.Connect();
  const msg = await client.Describe(
    "https://cdn.discordapp.com/attachments/1107965981839605792/1119977411631652914/Soga_a_cool_cat_blue_ears_yellow_hat_02afd1ed-17eb-4a61-9101-7a99b105e4cc.png"
  );
  // const fileinfo = await client.MJApi.UploadImage('https://img.ohdat.io/midjourney-image/1b74cab8-70c9-474e-bfbb-093e9a3cfd5c/0_1.png')
  // console.log(fileinfo)
  // const msg = await client.Describe(fileinfo)

  console.log({ msg });
  client.Close();
}
main().catch((err) => {
  console.log("finished");
  console.error(err);
  // process.exit(1)
});

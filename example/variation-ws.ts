import 'dotenv/config'
import { Midjourney } from '../src'
/**
 *
 * a simple example of how to use the Variation with ws command
 * ```
 * npx tsx example/variation-ws.ts
 * ```
 */
async function main() {
	const client = new Midjourney({
		ServerId: <string>process.env.SERVER_ID,
		ChannelId: <string>process.env.CHANNEL_ID,
		SalaiToken: <string>process.env.SALAI_TOKEN,
		Debug: true,
		Ws: true,
	})
	await client.init()
	// const msg: any = await client.Imagine('a dog, blue ears, and a red nose', (url, process) => {
	// 	console.log('process', url, process)
	// })
	// console.log({ msg })
	// if (!msg) {
	// 	console.log('no message')
	// 	return
	// }
	const msg2 = await client.Variation('**a dog, blue ears, and a red nose --seed 4026285321 --v 5.1** - <@1080737253673938964> (relaxed, stealth)', 2, '1113472569924915210', "dd1e550c-1e51-4128-9b2f-24cfd01e5a51", (uri: string) => {
		console.log('loading', uri)
	})
	console.log({ msg2 })
	// const msg3 = await client.Variation(<string>msg.content, 3, <string>msg.id, <string>msg.hash, (uri: string) => {
	// 	console.log('loading', uri)
	// })
	// console.log({ msg3 })
}
main().catch((err) => {
	console.error(err)
	process.exit(1)
})

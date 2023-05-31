import 'dotenv/config'
import { Midjourney } from '../src'
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/imagine.ts
 * ```
 */
async function main() {
	const client = new Midjourney({
		ServerId: <string>process.env.SERVER_ID,
		ChannelId: <string>process.env.CHANNEL_ID,
		SalaiToken: <string>process.env.SALAI_TOKEN,
		Debug: true,
		SessionId: process.env.SALAI_TOKEN,
	})
	await client.init()
	const msg = await client.Command('relax')
	console.log('msg', msg)
}
main().catch((err) => {
	console.error(err)
	process.exit(1)
})

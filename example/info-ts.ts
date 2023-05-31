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
	//'**Subscription**:               Pro (Active yearly, renews next on <t:1715321361>)\n**Job Mode**:                   Fast\n**Visibility Mode**:            Stealth\n**Fast Time Remaining**:        29.57/30.0 hours (98.58%)\n**Lifetime Usage**:             102 images (1.77 hours)\n**Relaxed Usage**:              19 images (0.29 hours)\n\n**Queued Jobs (fast)**:         0\n**Queued Jobs (relax)**:        0\n**Running Jobs**:               None'
	const msg = await client.Command("info")
	console.log('msg', msg)
}
main().catch((err) => {
	console.error(err)
	process.exit(1)
})

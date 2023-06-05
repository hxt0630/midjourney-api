import 'dotenv/config'
import { Midjourney } from '../src'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import 'isomorphic-fetch'
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
	// const filepath = ''
	// const file = fs.statSync(filepath)
	// const filename = path.basename(filepath)
	// const info = await client.attachments(filename, file.size)
	// console.log('info', JSON.stringify(info))
	// const uploadUrl = info.attachments?.[0]?.upload_url || ''
	// const uploadName = info.attachments?.[0]?.upload_filename || ''
	// const uploadId = info.attachments?.[0]?.id || ''
	// let readStream = fs.readFileSync(filepath)

	// const response = await fetch(uploadUrl, {
	// 	method: 'PUT',
	// 	body: Readable.from(readStream),
	// })
	// console.log(response.status)
	// const des = await client.Describe([{ id: uploadId, filename, uploaded_filename: uploadName }])
	const des = await client.Describe([
		{
			id: "0",
			filename: 'WX20230522-1737462x.png',
			uploaded_filename: '9f04beb4-98dd-4c77-915c-1dd9f1c3fe97/WX20230522-1737462x.png',
		},
	])
	console.log('des', JSON.stringify(des))
}
main().catch((err) => {
	console.error(err)
	process.exit(1)
})

import 'dotenv/config'
import { Midjourney } from '../src'
import { nextNonce, random, sleep } from '../src/utls'

/**
 *
 * a simple example of using the imagine api with ws
 * ```
 * npx tsx example/imagine-ws-m.ts
 * ```
 */
async function main() {
	const client = new Midjourney({
		ServerId: <string>process.env.SERVER_ID,
		ChannelId: <string>process.env.CHANNEL_ID,
		SalaiToken: <string>process.env.SALAI_TOKEN,
		HuggingFaceToken: <string>process.env.HUGGINGFACE_TOKEN,
		Debug: true,
		Ws: true,
	})
	await client.init()
	// const animals = ['a box of candy','a candy store','a candy bar','a rink with a floor of ice for ice hockey or ice skating','the frozen part of a body of water','A ruminant', 'A annelid', 'A arthropod', 'A echinoderm', 'A vertebrate', 'A chordate', 'A parasitic animal', 'A cold-blooded animal', 'A amphibian', 'A primate', 'A oviparous animal', 'A rodent', 'A mollusk', 'A crustacean', 'A protozoa']
	const animals = ['A parasitic animal']
	console.log('prompt', animals.length)
	for (let a of animals) {
		client
			.Imagine(a, (uri, progress, id) => {
				console.log('proccess', a, uri, progress, id)
			})
			.then(function (msg) {
				console.log('complete', a, msg)
			})
			.catch((err) => {
				console.log('error', a, err.message)
			})
		await sleep(3000)
	}
}
main().then(() => {
	console.log('finished')
	// process.exit(0);
})

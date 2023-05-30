import PQueue from 'p-queue'

class ConcurrentQueue {
	private limit: any

	constructor(concurrency: number) {
		this.limit = new PQueue({ concurrency })
	}
	public getWaiting(): number {
		return this.limit.size
	}
	public getPending(): number {
		return this.limit.pending
	}
	public async addTask<T>(task: () => Promise<T>): Promise<T> {
		return await this.limit.add(async () => {
			const result = await task()
			return result
		})
	}
}
export function CreateQueue<T>(concurrency: number) {
	return new ConcurrentQueue(concurrency)
}

// Usage example:
// async function test(num: number) {
// 	const queue = new ConcurrentQueue(num)

// 	for (let i = 0; i < 10; i++) {
// 		console.log(i, 'Task')
// 		queue.addTask(
// 			() =>
// 				new Promise<number>((resolve, reject) => {
// 					setTimeout(() => {
// 						console.log('Task done:', i)
// 						resolve(i * 2)
// 					}, 3000)
// 				})
// 		)
// 	}
// 	setInterval(() => {
// 		console.log('Pending', queue.getPending())
// 		console.log('Waiting', queue.getWaiting())
// 	}, 1000)
// }
// test(3)

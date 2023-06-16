import { DefaultMidjourneyConfig, LoadingHandler, MidjourneyConfig, MidjourneyConfigParam } from './interfaces'

import { MidjourneyMessage } from './midjourney.message'
import { CreateQueue } from './queue'
import { nextNonce, random, sleep } from './utls'
import { WsMessage } from './ws.message'
export class Midjourney extends MidjourneyMessage {
	private ApiQueue: any
	public config: MidjourneyConfig
	private wsClient?: WsMessage
	constructor(defaults: MidjourneyConfigParam) {
		const { ServerId, SalaiToken, ChannelId, Ws } = defaults
		if (!ServerId || !SalaiToken || !ChannelId) {
			throw new Error('ServerId, ChannelId and SalaiToken are required')
		}
		super(defaults)
		this.config = {
			...DefaultMidjourneyConfig,
			...defaults,
		}
		this.ApiQueue = CreateQueue(this.config.Concurrent || 1)
	}
	async init() {
		if (this.wsClient) return this
		return new Promise<Midjourney>((resolve) => {
			this.wsClient = new WsMessage(this.config)
			this.wsClient.once('ready', () => {
				resolve(this)
			})
		})
	}

	protected async safeIteractions(payload: any) {
		return this.ApiQueue.addTask(
			() =>
				new Promise<number>((resolve) => {
					this.interactions(payload, (res) => {
						resolve(res)
					})
				})
		)
	}

	protected async interactions(payload: any, callback?: (result: number) => void) {
		try {
			const headers = {
				'Content-Type': 'application/json',
				Authorization: this.config.SalaiToken,
			}
			const response = await fetch('https://discord.com/api/v9/interactions', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: headers,
			})
			callback && callback(response.status)
			if (response.status >= 400) {
				this.log('error config', { config: this.config })
			}
			return response.status
		} catch (error) {
			console.log(error)
			callback && callback(500)
		}
	}
	//TODO: Imagine command
	async Imagine(prompt: string, loading?: LoadingHandler) {
		if (!prompt.includes('--seed')) {
			const speed = random(1000, 4294967295)
			prompt = `${prompt} --seed ${speed}`
		}

		const nonce = nextNonce()
		const httpStatus = await this.ImagineApi(prompt, nonce)
		if (httpStatus !== 204) {
			throw new Error(`ImagineApi failed with status ${httpStatus}`)
		}
		console.log(`Imagine start`, prompt, 'nonce', nonce)
		if (!loading) return nonce
		if (this.wsClient) {
			return await this.wsClient.waitMessage(nonce, loading)
		} else {
			this.log(`await generate image`)
			const msg = await this.WaitMessage(prompt, loading)
			this.log(`image generated`, prompt, msg?.uri)
			return msg
		}
	}
	async ImagineApi(prompt: string, nonce: string = nextNonce()) {
		const payload = {
			type: 2,
			application_id: '936929561302675456',
			guild_id: this.config.ServerId,
			channel_id: this.config.ChannelId,
			session_id: this.config.SessionId,
			data: {
				version: '1118961510123847772',
				id: '938956540159881230',
				name: 'imagine',
				type: 1,
				options: [
					{
						type: 3,
						name: 'prompt',
						value: prompt,
					},
				],
				application_command: {
					id: '938956540159881230',
					application_id: '936929561302675456',
					version: '1118961510123847772',
					default_permission: true,
					default_member_permissions: null,
					type: 1,
					nsfw: false,
					name: 'imagine',
					description: 'Create images with Midjourney',
					dm_permission: true,
					options: [
						{
							type: 3,
							name: 'prompt',
							description: 'The prompt to imagine',
							required: true,
						},
					],
				},
				attachments: [],
			},
			nonce,
		}
		return this.safeIteractions(payload)
	}
	//TODO: Variation command
	async Variation(content: string, index: number, msgId: string, msgHash: string, loading?: LoadingHandler) {
		// index is 1-4
		if (index < 1 || index > 4) {
			throw new Error(`Variation index must be between 1 and 4, got ${index}`)
		}
		const nonce = nextNonce()
		const httpStatus = await this.VariationApi(index, msgId, msgHash, nonce)
		if (httpStatus !== 204) {
			throw new Error(`VariationApi failed with status ${httpStatus}`)
		}
		if (!loading) return nonce
		if (this.wsClient) {
			return await this.wsClient.waitMessage(nonce, loading)
		} else {
			return await this.WaitOptionMessage(content, `Variations`, loading)
		}
	}
	async VariationApi(index: number, messageId: string, messageHash: string, nonce?: string) {
		const payload = {
			type: 3,
			guild_id: this.config.ServerId,
			channel_id: this.config.ChannelId,
			message_flags: 0,
			message_id: messageId,
			application_id: '936929561302675456',
			session_id: this.config.SessionId,
			data: {
				component_type: 2,
				custom_id: `MJ::JOB::variation::${index}::${messageHash}`,
			},
			nonce,
		}
		return this.safeIteractions(payload)
	}
	//TODO: Upscale command
	async Upscale(content: string, index: number, msgId: string, msgHash: string, loading?: LoadingHandler) {
		// index is 1-4
		if (index < 1 || index > 4) {
			throw new Error(`Upscale index must be between 1 and 4, got ${index}`)
		}
		const nonce = nextNonce()
		const httpStatus = await this.UpscaleApi(index, msgId, msgHash, nonce)
		if (httpStatus !== 204) {
			throw new Error(`UpscaleApi failed with status ${httpStatus}`)
		}
		if (!loading) return nonce
		this.log(`await generate image`)
		if (this.wsClient) {
			return await this.wsClient.waitMessage(nonce, loading)
		}
		return await this.WaitUpscaledMessage(content, index, loading)
	}

	async UpscaleApi(index: number, messageId: string, messageHash: string, nonce?: string) {
		const payload = {
			type: 3,
			guild_id: this.config.ServerId,
			channel_id: this.config.ChannelId,
			message_flags: 0,
			message_id: messageId,
			application_id: '936929561302675456',
			session_id: this.config.SessionId,
			data: {
				component_type: 2,
				custom_id: `MJ::JOB::upsample::${index}::${messageHash}`,
			},
			nonce,
		}
		return this.safeIteractions(payload)
	}
	async UpscaleByCustomID(messageId: string, customId: string) {
		const payload = {
			type: 3,
			guild_id: this.config.ServerId,
			channel_id: this.config.ChannelId,
			message_flags: 0,
			message_id: messageId,
			application_id: '936929561302675456',
			session_id: this.config.SessionId,
			data: {
				component_type: 2,
				custom_id: customId,
			},
		}
		return this.safeIteractions(payload)
	}
	//TODO: Info command
	async Command(command: 'info' | 'fast' | 'relax') {
		const nonce = nextNonce()
		const httpStatus = await this[`${command}Api`](nonce)
		if (httpStatus !== 204) {
			throw new Error(`${command}Api failed with status ${httpStatus}`)
		}
		this.log(`await ${command}Api`)
		if (this.wsClient) {
			return await this.wsClient.waitMessage(nonce)
		}
		// return await this.WaitUpscaledMessage()
	}
	async infoApi(nonce: string = nextNonce()) {
		const payload = {
			type: 2,
			application_id: '936929561302675456',
			guild_id: this.config.ServerId,
			channel_id: this.config.ChannelId,
			session_id: this.config.SessionId,
			data: {
				version: '1118961510123847776',
				id: '972289487818334209',
				name: 'info',
				type: 1,
				options: [],
				application_command: {
					id: '972289487818334209',
					application_id: '936929561302675456',
					version: '1118961510123847776',
					default_permission: true,
					default_member_permissions: null,
					type: 1,
					nsfw: false,
					name: 'info',
					description: 'View information about your profile.',
					dm_permission: true,
				},
				attachments: [],
			},
			nonce,
		}
		return this.safeIteractions(payload)
	}
	async fastApi(nonce: string = nextNonce()) {
		const payload = {
			type: 2,
			application_id: '936929561302675456',
			guild_id: this.config.ServerId,
			channel_id: this.config.ChannelId,
			session_id: this.config.SessionId,
			data: {
				version: '987795926183731231',
				id: '972289487818334212',
				name: 'fast',
				type: 1,
				options: [],
				application_command: {
					id: '972289487818334212',
					application_id: '936929561302675456',
					version: '987795926183731231',
					default_member_permissions: null,
					type: 1,
					nsfw: false,
					name: 'fast',
					description: 'Switch to fast mode',
					dm_permission: true,
					contexts: null,
				},
				attachments: [],
			},
			nonce,
		}
		return this.safeIteractions(payload)
	}
	async relaxApi(nonce: string = nextNonce()) {
		const payload = {
			type: 2,
			application_id: '936929561302675456',
			guild_id: this.config.ServerId,
			channel_id: this.config.ChannelId,
			session_id: this.config.SessionId,
			data: {
				version: '987795926183731232',
				id: '972289487818334213',
				name: 'relax',
				type: 1,
				options: [],
				application_command: {
					id: '972289487818334213',
					application_id: '936929561302675456',
					version: '987795926183731232',
					default_member_permissions: null,
					type: 1,
					nsfw: false,
					name: 'relax',
					description: 'Switch to relax mode',
					dm_permission: true,
					contexts: null,
				},
				attachments: [],
			},
			nonce,
		}
		return this.safeIteractions(payload)
	}
	//TODO: describe command
	async Describe(attachments: { id: string; filename: string; uploaded_filename: string }[]) {
		const nonce = nextNonce()
		const httpStatus = await this.describeApi(nonce, attachments)
		if (httpStatus !== 204) {
			throw new Error(`describeApi failed with status ${httpStatus}`)
		}
		this.log(`await Describe`)
		if (this.wsClient) {
			return await this.wsClient.waitMessage(nonce)
		}
		// return await this.WaitUpscaledMessage()
	}
	async describeApi(nonce: string = nextNonce(), attachments: { id: string; filename: string; uploaded_filename: string }[]) {
		const payload = {
			type: 2,
			application_id: '936929561302675456',
			guild_id: this.config.ServerId,
			channel_id: this.config.ChannelId,
			session_id: this.config.SessionId,
			data: {
				version: '1092492867185950853',
				id: '1092492867185950852',
				name: 'describe',
				type: 1,
				options: [
					{
						type: 11,
						name: 'image',
						value: 0,
					},
				],
				application_command: {
					id: '1092492867185950852',
					application_id: '936929561302675456',
					version: '1092492867185950853',
					default_member_permissions: null,
					type: 1,
					nsfw: false,
					name: 'describe',
					description: 'Writes a prompt based on your image.',
					dm_permission: true,
					contexts: null,
					options: [
						{
							type: 11,
							name: 'image',
							description: 'The image to describe',
							required: true,
						},
					],
				},
				attachments,
			},
			nonce,
		}
		return this.safeIteractions(payload)
	}
	async attachments(filename: string, size: number) {
		const payload = { files: [{ filename, file_size: size, id: '1' }] }
		const headers = {
			'Content-Type': 'application/json',
			Authorization: this.config.SalaiToken,
		}
		const response = await fetch(`https://discord.com/api/v9/channels/${this.config.ChannelId}/attachments`, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: headers,
		})
		return response.json()
	}
	//TODO:Create Message
	async message(message: any) {
		const payload = {
			...message,
			nonce: nextNonce(),
			channel_id: this.config.ChannelId,
		}
		const headers = {
			'Content-Type': 'application/json',
			Authorization: this.config.SalaiToken,
		}
		const response = await fetch(`https://discord.com/api/v9/channels/${this.config.ChannelId}/messages`, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: headers,
		})
		return response.json()
	}
}

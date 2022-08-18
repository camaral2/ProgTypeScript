import * as r from 'redis'

const redis: typeof r = 1 === 1 ? require('redis') : require('redis-mock')

class CacheTit {
    private static _instance: CacheTit

    private _initialConnection: boolean
    private _client?: r.RedisClientType

    private constructor() {
        this._initialConnection = true
    }

    public static getInstance(): CacheTit {
        if (!CacheTit._instance) {
            CacheTit._instance = new CacheTit()
        }

        return CacheTit._instance
    }

    public open(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._client = redis.createClient({
                url: 'redis://redis-16388.c276.us-east-1-2.ec2.cloud.redislabs.com:16388',
                password: 'PEyRGGGpiN0YmkPhRQt8RFGlK20RHnnY'
            })

            const client = this._client!

            client.on('connect', (tes) => {
                //console.log('tes:', tes)
                //console.info('Redis: connected')
            })
            client.on('ready', (tes1) => {
                //console.log('tes1:', tes1)

                if (this._initialConnection) {
                    this._initialConnection = false
                    resolve()
                }
                //console.info('Redis: ready')
            })
            client.on('reconnecting', () => {
                //console.info('Redis: reconnecting')
            })
            client.on('end', () => {
                //console.info('Redis: end')
            })
            client.on('disconnected', () => {
                //console.error('Redis: disconnected')
            })
            client.on('error', function (err) {
                //console.error(`Redis: error: ${err}`)
            })

            client.connect()

        })
    }

    public setProp(key: string, value: string): Promise<void> {
        return new Promise(async (resolve) => {
            await this._client!.set(key, value)
            resolve()
        })
    }

    public getProp(key: string): Promise<string | undefined> {
        return new Promise(async (resolve) => {
            
            const result = await this._client!.get(key)
            resolve(result ? result : undefined)
        })
    }

    public close(): Promise<void> {
        return new Promise(async (resolve) => {
            await this._client!.quit()
            resolve()
        })
    }
}

export default CacheTit.getInstance()
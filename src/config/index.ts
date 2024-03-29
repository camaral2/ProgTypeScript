import dotenvExtended from 'dotenv-extended'
import dotenvParseVariables from 'dotenv-parse-variables'
import { parse } from 'path'
 
const env = dotenvExtended.load({
  path: process.env.ENV_FILE,
  defaults: './config/.env.defaults',
  schema: './config/.env.schema',
  includeProcessEnv: true,
  silent: false,
  errorOnMissing: true,
  errorOnExtra: true
})

const parsedEnv = dotenvParseVariables(env)
 
// Define log levels type (silent + Winston default npm)
type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'

interface Config {
  mongo: {
    url: string,
    useCreateIndex: boolean,
    autoIndex: boolean
  },
  morganLogger: boolean
  morganBodyLogger: boolean
  exmplDevLogger: boolean
  loggerLevel: LogLevel 
  coerceTypes: boolean
  privateKeyFile: string
  privateKeyPassPhrase: string
  publicKeyFile: string
  localCacheTtl: number
  redis:{
    url: string,
    pwd: string
  }
}

const config: Config = {
  mongo: {
    url: parsedEnv.MONGO_URL as string,
    useCreateIndex: parsedEnv.MONGO_CREATE_INDEX as boolean,
    autoIndex: parsedEnv.MONGO_AUTO_INDEX as boolean
  },
  morganLogger: parsedEnv.MORGAN_LOGGER as boolean,
  morganBodyLogger: parsedEnv.MORGAN_BODY_LOGGER as boolean,
  exmplDevLogger: parsedEnv.EXMPL_DEV_LOGGER as boolean,
  loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel,
  coerceTypes: parsedEnv.COERCE_TYPES as boolean,
  privateKeyFile: parsedEnv.PRIVATE_KEY_FILE as string,
  privateKeyPassPhrase: parsedEnv.PRIVATE_KEY_PASSPHRASE as string,
  publicKeyFile: parsedEnv.PUBLIC_KEY_FILE as string,
  localCacheTtl: parsedEnv.LOCAL_CACHE_TTL as number,
  redis: {
    url: parsedEnv.REDIS_URL as string,
    pwd: parsedEnv.REDIS_PWD as string
  }
}

export default config
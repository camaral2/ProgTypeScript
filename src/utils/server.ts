import express from 'express'
import { Express } from 'express-serve-static-core'
import * as OpenApiValidator from 'express-openapi-validator'
import { connector, summarise } from 'swagger-routes-express'
import YAML from 'yamljs'
import * as api from '@exmpl/api/controllers'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import morganBody from 'morgan-body'
import swaggerUi from 'swagger-ui-express'
import { expressDevLogger } from '@exmpl/utils/express_dev_logger'
import config from '@exmpl/config'
import logger from '@exmpl/utils/logger'


export async function createServer(): Promise<Express> {
    const server = express()

    const yamlFile = './config/openapi.yml'
    const apiDefYaml = YAML.load(yamlFile)
    const apiSum = summarise(apiDefYaml)

    logger.info(apiSum)

    const valOption = {
        coerceTypes: config.coerceTypes,
        apiSpec: yamlFile,
        validateRequests: true,
        validateResponses: true
    }

    server.use(bodyParser.json())

    /* istanbul ignore next */
    if (config.morganLogger) {
        server.use(morgan(':method :url :status :response-time ms - :res[content-length]'))
    }

    /* istanbul ignore next */
    if (config.morganBodyLogger) {
        morganBody(server)
    }

    /* istanbul ignore next */
    if (config.exmplDevLogger) {
        server.use(expressDevLogger)
    }

    server.use(OpenApiValidator.middleware(valOption))

    //Validator custom
    server.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(err.status).json({
            error: {
                type: 'request_validation',
                message: err.message,
                errors: err.errors
            }
        })
    })


    //const openApiDocument = jsYaml.safeLoad(
    //    fs.readFileSync('spec/petstore.yaml', 'utf-8'),
    //)

    const options = { explorer: true }

    server.use('/api-docs', swaggerUi.serve)
    server.get('/api-docs', swaggerUi.setup(apiDefYaml,
        options))

    const con = connector(api, apiDefYaml, {
        onCreateRoute: (method: string, descriptor: any[]) => {
            descriptor.shift()
            logger.verbose(`${method} - ${descriptor.map((d: any) => d.name).join(', ')}`)
        },
        security: {
            bearerAuth: api.auth
        }
    })

    con(server)

    return server
}
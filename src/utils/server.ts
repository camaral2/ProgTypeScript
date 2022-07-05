import express from 'express'
import { Express} from 'express-serve-static-core'
import * as OpenApiValidator from 'express-openapi-validator'
import {connector, summarise} from 'swagger-routes-express'
import YAML from 'yamljs'
import * as api from '../api/controllers'

import swaggerUi from 'swagger-ui-express'

export async function createServer():Promise<Express> {
    const server = express()

    const yamlFile = './config/openapi.yml'
    const apiDefYaml = YAML.load(yamlFile)
    const apiSum = summarise(apiDefYaml)
    
    console.info(apiSum)

    const valOption = {
        coerceTypes: true,
        apiSpec: yamlFile,
        validateRequests: true,
        validateResponses: true
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

    const con = connector(api, apiDefYaml,{
        onCreateRoute: (method: string, descriptor: any[])=>{
            descriptor.shift()
            console.log(`${method} - ${descriptor.map((d: any) => d.name).join(', ')}`)
        },
        security: {
            bearerAuth: api.auth
        }
    })

    con(server)

    server.get('/', (req, res) => {
        res.send('Cristian: My application backend !!!')
    })
    
    return server
}
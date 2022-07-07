import { createServer } from "./utils/server";
import logger from '@exmpl/utils/logger'

createServer().then(server => {
    server.listen(3000, ()=> {
        logger.info('Listening on port 3000')
    })
})
.catch(err => {
    logger.error(`Atencion - Error: ${err}.`)
})
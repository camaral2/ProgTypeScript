import database from '@exmpl/utils/database'
import { createServer } from "@exmpl/utils/server";
import logger from '@exmpl/utils/logger'
import cacheExternarl from '@exmpl/utils/cache_external'

cacheExternarl.open()
  .then(() => database.open())
  .then(() => createServer())
  .then(server => {
    server.listen(3000, () => {
      logger.info(`Listening on http://localhost:3000`)

    })
  })
  .catch(err => {
    logger.error(`Error: ${err}`)
  })

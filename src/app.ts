import { createServer } from "./utils/server";

createServer().then(server => {
    server.listen(3000, ()=> {
        console.info('Listening on port 3000')
    })
})
.catch(err => {
    console.error(`Atencion - Error: ${err}.`)
})
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("@exmpl/utils/database"));
const server_1 = require("@exmpl/utils/server");
const logger_1 = __importDefault(require("@exmpl/utils/logger"));
const cache_external_1 = __importDefault(require("@exmpl/utils/cache_external"));
cache_external_1.default.open()
    .then(() => database_1.default.open())
    .then(() => (0, server_1.createServer)())
    .then(server => {
    server.listen(3000, () => {
        logger_1.default.info(`Listening on http://localhost:3000`);
    });
})
    .catch(err => {
    logger_1.default.error(`Error: ${err}`);
});

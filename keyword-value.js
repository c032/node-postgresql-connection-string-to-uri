"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordValueToUri = keywordValueToUri;
const parser_1 = require("./parser");
const connection_uri_object_1 = require("./connection-uri-object");
function keywordValueToUri(kvConnectionString) {
    if (kvConnectionString === "") {
        return "postgresql://";
    }
    const pairs = (0, parser_1.parseKeywordValueConnectionString)(kvConnectionString);
    const connectionStringUri = (0, connection_uri_object_1.pairsToConnectionString)(pairs);
    return connectionStringUri;
}

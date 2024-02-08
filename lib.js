"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordValueToUri = void 0;
const parser_1 = require("./parser");
function connectionUriObjectToString(uriObject) {
    let userspec = "";
    if (uriObject.userspec) {
        const { user, password } = uriObject.userspec;
        userspec += user;
        if (password) {
            userspec += `:${encodeURIComponent(password)}`;
        }
        userspec += "@";
    }
    let hostspec = "";
    if (uriObject.hostspec) {
        const { host, port } = uriObject.hostspec;
        if (host) {
            hostspec += host;
        }
        if (typeof port !== "undefined") {
            hostspec += `:${port}`;
        }
    }
    let dbname = "";
    if (typeof uriObject.dbname !== "undefined") {
        dbname += `/${encodeURIComponent(uriObject.dbname)}`;
    }
    let paramspec = "";
    if (uriObject.paramspec) {
        paramspec += "?";
        paramspec += uriObject.paramspec
            .map((item) => {
            const { name, value } = item;
            return `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        })
            .join("&");
    }
    return `postgresql://${userspec}${hostspec}${dbname}${paramspec}`;
}
function keywordValueToUri(kvConnectionString) {
    if (kvConnectionString === "") {
        return "postgresql://";
    }
    const pairs = (0, parser_1.parseKeywordValueConnectionString)(kvConnectionString);
    const uriObject = {};
    pairs.forEach((pair) => {
        const { key, value } = pair;
        switch (key) {
            case "host":
            case "hostaddr":
                uriObject.hostspec = {
                    ...(uriObject.hostspec || {}),
                    host: value,
                };
                break;
            case "port":
                if (!value.match(/^[0-9]+$/)) {
                    throw new Error("`port` is not a number.");
                }
                uriObject.hostspec = {
                    ...(uriObject.hostspec || {}),
                    port: parseInt(value, 10),
                };
                break;
            case "dbname":
                uriObject.dbname = value;
                break;
            case "user":
                uriObject.userspec = {
                    ...(uriObject.userspec || {}),
                    user: value,
                };
                break;
            case "password":
                if (!uriObject.userspec) {
                    uriObject.userspec = {
                        user: "",
                    };
                }
                uriObject.userspec.password = value;
                break;
            default:
                if (!uriObject.paramspec) {
                    uriObject.paramspec = [];
                }
                uriObject.paramspec.push({
                    name: key,
                    value,
                });
                break;
        }
    });
    const connectionStringUri = connectionUriObjectToString(uriObject);
    return connectionStringUri;
}
exports.keywordValueToUri = keywordValueToUri;

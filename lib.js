"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kvConnectionStringToUri = void 0;
function connectionURIObjectToString(uriObject) {
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
const REGEXP_KEY_CHAR = /[a-z_]/;
function isValidKeyChar(c) {
    return REGEXP_KEY_CHAR.test(c);
}
function readKey(input) {
    let key = "";
    for (let i = 0; i < input.length; i++) {
        const c = input[i];
        if (typeof c === "undefined") {
            break;
        }
        if (isValidKeyChar(c)) {
            key += c;
            continue;
        }
        const remaining = input.substring(key.length);
        return [key, remaining];
    }
    throw new Error("Invalid key.");
}
function consumeSeparator(input) {
    if (input.startsWith("=")) {
        return input.substring(1);
    }
    if (input.startsWith(" = ")) {
        return input.substring(" = ".length);
    }
    throw new Error("Invalid separator.");
}
function readValueQuoted(input) {
    if (!input.startsWith("'")) {
        throw new Error("Expected single quote.");
    }
    let escape = false;
    let value = "";
    let remaining = input.substring(1);
    for (let i = 0; i < remaining.length; i++) {
        const c = remaining[i];
        if (escape) {
            escape = false;
            // Only support escaping `'` and `\`.
            if (c !== "\\" && c !== "'") {
                throw new Error("Value tried to escape a character that was neither a single quotation mark nor a backslash.");
            }
            value += c;
            continue;
        }
        if (c === "\\") {
            escape = true;
            continue;
        }
        if (c === "'") {
            remaining = remaining.substring(value.length + 1);
            if (remaining.startsWith(" ")) {
                remaining = remaining.substring(1);
            }
            return [value, remaining];
        }
        value += c;
    }
    throw new Error("Unquoted value.");
}
function readValueUnquoted(input) {
    const parts = input.split(" ");
    const value = parts[0];
    if (typeof value === "undefined") {
        throw new Error("Invalid value.");
    }
    const remaining = parts.slice(1).join(" ");
    return [value, remaining];
}
function readValue(input) {
    if (input.startsWith("'")) {
        return readValueQuoted(input);
    }
    return readValueUnquoted(input);
}
function parseKvConnectionString(kvConnectionString) {
    const pairs = [];
    let remaining = kvConnectionString;
    let prevLength = -1;
    do {
        prevLength = remaining.length;
        let key;
        let value;
        [key, remaining] = readKey(remaining);
        remaining = consumeSeparator(remaining);
        [value, remaining] = readValue(remaining);
        const pair = {
            key,
            value,
        };
        pairs.push(pair);
    } while (remaining.length < prevLength && remaining !== "");
    return pairs;
}
function kvConnectionStringToUri(kvConnectionString) {
    if (kvConnectionString === "") {
        return "postgresql://";
    }
    const pairs = parseKvConnectionString(kvConnectionString);
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
    const connectionStringUri = connectionURIObjectToString(uriObject);
    return connectionStringUri;
}
exports.kvConnectionStringToUri = kvConnectionStringToUri;

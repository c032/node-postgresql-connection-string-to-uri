interface ConnectionURIObject {
  userspec?: {
    user: string;
    password?: string;
  };
  hostspec?: {
    host?: string;
    port?: number;
  };
  dbname?: string;
  paramspec?: {
    name: string;
    value: string;
  }[];
}

function connectionURIObjectToString(uriObject: ConnectionURIObject): string {
  let userspec: string = "";
  if (uriObject.userspec) {
    const { user, password } = uriObject.userspec;
    userspec += user;
    if (password) {
      userspec += `:${encodeURIComponent(password)}`;
    }

    userspec += "@";
  }

  let hostspec: string = "";
  if (uriObject.hostspec) {
    const { host, port } = uriObject.hostspec;
    if (host) {
      hostspec += host;
    }
    if (typeof port !== "undefined") {
      hostspec += `:${port}`;
    }
  }

  let dbname: string = "";
  if (typeof uriObject.dbname !== "undefined") {
    dbname += `/${encodeURIComponent(uriObject.dbname)}`;
  }

  let paramspec: string = "";
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

interface KeyValuePair {
  key: string;
  value: string;
}

const REGEXP_KEY_CHAR = /[a-z_]/;

function isValidKeyChar(c: string): boolean {
  return REGEXP_KEY_CHAR.test(c);
}

function readKey(input: string): [string, string] {
  let key: string = "";
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

function consumeSeparator(input: string): string {
  if (input.startsWith("=")) {
    return input.substring(1);
  }
  if (input.startsWith(" = ")) {
    return input.substring(" = ".length);
  }

  throw new Error("Invalid separator.");
}

function readValueQuoted(input: string): [string, string] {
  if (!input.startsWith("'")) {
    throw new Error("Expected single quote.");
  }

  let escape: boolean = false;

  let value: string = "";
  let remaining = input.substring(1);
  for (let i = 0; i < remaining.length; i++) {
    const c = remaining[i];

    if (escape) {
      escape = false;

      // Only support escaping `'` and `\`.
      if (c !== "\\" && c !== "'") {
        throw new Error(
          "Value tried to escape a character that was neither a single quotation mark nor a backslash.",
        );
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

function readValueUnquoted(input: string): [string, string] {
  const parts = input.split(" ");

  const value = parts[0];
  if (typeof value === "undefined") {
    throw new Error("Invalid value.");
  }

  const remaining = parts.slice(1).join(" ");
  return [value, remaining];
}

function readValue(input: string): [string, string] {
  if (input.startsWith("'")) {
    return readValueQuoted(input);
  }
  return readValueUnquoted(input);
}

function parseKvConnectionString(kvConnectionString: string): KeyValuePair[] {
  const pairs: KeyValuePair[] = [];

  let remaining: string = kvConnectionString;
  let prevLength: number = -1;

  do {
    prevLength = remaining.length;

    let key: string;
    let value: string;

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

export function kvConnectionStringToUri(kvConnectionString: string): string {
  if (kvConnectionString === "") {
    return "postgresql://";
  }

  const pairs = parseKvConnectionString(kvConnectionString);

  const uriObject: ConnectionURIObject = {};
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

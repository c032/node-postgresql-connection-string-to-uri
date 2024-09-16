# node-postgresql-keyword-value-to-uri

Convert PostgreSQL's keyword/value connection strings to URI connection
strings.

## Install

```sh
npm install \
  --ignore-scripts \
  --save \
  'github:c032/node-postgresql-keyword-value-to-uri#js'
```

## Example

```
import { keywordValueToUri } from "postgresql-keyword-value-to-uri";

const connectionString = keywordValueToUri(
	`host=postgresql user=user_name password='correct horse battery staple' dbname=database_name sslmode=disable`
);

// `connectionString` is "postgresql://user_name:correct%20horse%20battery%20staple@postgresql/database_name?sslmode=disable".
```

## F.A.Q.

### Why not send PR to [pg-connection-string](https://www.npmjs.com/package/pg-connection-string)?

See <https://github.com/brianc/node-postgres/issues/2125>.

## License

MPL 2.0.

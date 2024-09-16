import { parseKeywordValueConnectionString } from "./parser";
import { pairsToConnectionString } from "./connection-uri-object";

export function keywordValueToUri(kvConnectionString: string): string {
	if (kvConnectionString === "") {
		return "postgresql://";
	}

	const pairs = parseKeywordValueConnectionString(kvConnectionString);
	const connectionStringUri = pairsToConnectionString(pairs);

	return connectionStringUri;
}

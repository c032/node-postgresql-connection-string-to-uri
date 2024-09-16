"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = require("node:assert");
const node_test_1 = require("node:test");
const keyword_value_1 = require("./keyword-value");
const TEST_CASES = {
    "": "postgresql://",
    "dbname=database_name": "postgresql:///database_name",
    "host=localhost port=5432 dbname=mydb connect_timeout=10": "postgresql://localhost:5432/mydb?connect_timeout=10",
    "host=postgresql user=user_name password='correct horse battery staple' dbname=database_name sslmode=disable": "postgresql://user_name:correct%20horse%20battery%20staple@postgresql/database_name?sslmode=disable",
};
(0, node_test_1.describe)("keyword-value", () => {
    (0, node_test_1.describe)("keywordValueToUri", () => {
        for (const [input, expectedOutput] of Object.entries(TEST_CASES)) {
            (0, node_test_1.it)(`converts ${JSON.stringify(input)} as ${JSON.stringify(expectedOutput)}`, () => {
                const actualOutput = (0, keyword_value_1.keywordValueToUri)(input);
                node_assert_1.strict.equal(actualOutput, expectedOutput);
            });
        }
    });
});

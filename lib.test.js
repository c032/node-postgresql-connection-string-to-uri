"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = require("node:assert");
const node_test_1 = require("node:test");
const lib_1 = require("./lib");
const TEST_CASES = {
    "": "postgresql://",
    "dbname=database_name": "postgresql:///database_name",
    "host=localhost port=5432 dbname=mydb connect_timeout=10": "postgresql://localhost:5432/mydb?connect_timeout=10",
    "host=postgresql user=user_name password='correct horse battery staple' dbname=database_name sslmode=disable": "postgresql://user_name:correct%20horse%20battery%20staple@postgresql/database_name?sslmode=disable",
};
(0, node_test_1.describe)("lib", () => {
    (0, node_test_1.describe)("kvConnectionStringToUri", () => {
        Object.entries(TEST_CASES).forEach(([input, expectedOutput]) => {
            (0, node_test_1.it)(`converts ${JSON.stringify(input)} as ${JSON.stringify(expectedOutput)}`, () => {
                const actualOutput = (0, lib_1.kvConnectionStringToUri)(input);
                node_assert_1.strict.equal(actualOutput, expectedOutput);
            });
        });
    });
});

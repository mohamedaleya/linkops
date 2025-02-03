/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          jsx: "react",
        },
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(nanoid|next)/)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^nanoid$": "<rootDir>/src/__mocks__/nanoid.ts",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/e2e/**",
  ],
};

module.exports = config;

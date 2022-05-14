export default {
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }
}

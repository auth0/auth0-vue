const excludeFiles = [];

module.exports = {
  entryPoints: ['./src/index.ts'], // Changed from: includes: './src'
  out: './docs/',
  readme: './README.MD',
  exclude: [
    '**/__tests__/**/*',
    '**/cypress/**/*',
    '**/__mocks__/**/*',
    ...excludeFiles.map(f => `./src/${f}.ts`)
  ],
  excludeExternals: false,
  excludePrivate: true,
  hideGenerator: true,
  visibilityFilters: {
    protected: false,
    inherited: true,
    external: true
  }
};

module.exports = {
  'src/**/*.{js,ts}': ['prettier --write', 'eslint --max-warnings 0'],
  '**/*.{js,ts}?(x)': () => 'tsc',
};

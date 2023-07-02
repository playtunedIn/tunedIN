export default {
  'src/**/*.{css,html.js,jsx,json,less,md,scss,ts,tsx,yaml}': ['prettier --write'],
  'src/**/*.{css,less,scss}': ['stylelint --max-warnings 0'],
  'src/**/*.{js,jsx,ts,tsx}': ['eslint --max-warnings 0'],
  '**/*.{js,jsx,ts,tsx}?(x)': () => 'tsc --noEmit',
};

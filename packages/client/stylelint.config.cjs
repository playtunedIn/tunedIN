module.exports = {
  extends: [
    'stylelint-config-standard-scss', // configure for SCSS
    'stylelint-config-recess-order', // use the recess order for properties
    'stylelint-config-css-modules', // configure for CSS Modules methodology
  ],
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'no-invalid-position-at-import-rule': [true, { ignoreAtRules: ['use'] }],
    'property-no-vendor-prefix': [true, { ignoreProperties: ['background-clip'] }],
  },
};

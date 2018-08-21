This bundle of the [Joi](https://github.com/hapijs/joi) library and its dependencies was generated with the following Webpack build configuration (`webpack.config.js`), which can be executed from the root of the Joi repo:

```
const path = require('path');

module.exports = exports = {
  target: 'node',
  entry: './lib/index.js',
  mode: 'production',
  optimization: {
    minimize: false
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'joi.bundle.js',
    libraryTarget: 'commonjs2'
  }
};
```

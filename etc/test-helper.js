// DEPRECATION NOTICE: This module has been deprecated in favour of src/test-helper.js

var deprecate = require('util').deprecate;
var testHelper = require('../src/test-helper.js');

module.exports = exports = testHelper;

var deprecationMessage = 'The etc/test-helper.js module has been deprecated. Use src/test-helper.js instead.';

exports.initSyncFunction = deprecate(testHelper.initSyncFunction, deprecationMessage);
exports.initDocumentDefinitions = deprecate(testHelper.initDocumentDefinitions, deprecationMessage);
exports.init = deprecate(testHelper.initSyncFunction, deprecationMessage);

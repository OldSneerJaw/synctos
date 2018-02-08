// DEPRECATION NOTICE: This module has been deprecated in favour of src/testing/test-helper.js

var deprecate = require('util').deprecate;
var testHelper = require('../src/testing/test-helper.js');

module.exports = exports = testHelper;

var deprecationMessage = 'The etc/test-helper.js module has been deprecated. Use src/testing/test-helper.js instead.';

exports.initSyncFunction = deprecate(testHelper.initSyncFunction, deprecationMessage);
exports.initDocumentDefinitions = deprecate(testHelper.initDocumentDefinitions, deprecationMessage);
exports.init = deprecate(testHelper.initSyncFunction, deprecationMessage);
exports.validationErrorFormatter = require('./validation-error-message-formatter.js');

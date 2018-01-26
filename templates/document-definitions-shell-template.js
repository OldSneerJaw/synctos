function makeDocumentDefinitionsShell(require) {
  var _ = require('../lib/underscore/underscore-min.js');
  var simple = require('../lib/simple-mock/index.js');

  var doc = { };
  var oldDoc = { };
  var typeIdValidator = { type: 'string' };
  var simpleTypeFilter = simple.stub();
  var isDocumentMissingOrDeleted = simple.stub();
  var isValueNullOrUndefined = simple.stub();
  var getEffectiveOldDoc = simple.stub();
  var requireAccess = simple.stub();
  var requireRole = simple.stub();
  var requireUser = simple.stub();
  var channel = simple.stub();
  var access = simple.stub();
  var role = simple.stub();

  var customActionStub = simple.stub();

  return {
    _: _,
    doc: doc,
    oldDoc: oldDoc,
    typeIdValidator: typeIdValidator,
    simpleTypeFilter: simpleTypeFilter,
    isDocumentMissingOrDeleted: isDocumentMissingOrDeleted,
    isValueNullOrUndefined: isValueNullOrUndefined,
    getEffectiveOldDoc: getEffectiveOldDoc,
    requireAccess: requireAccess,
    requireRole: requireRole,
    requireUser: requireUser,
    channel: channel,
    access: access,
    role: role,
    customActionStub: customActionStub,
    documentDefinitions: %DOC_DEFINITIONS_PLACEHOLDER%
  };
}

function makeValidationEnvironment(_, simple) {
  const doc = { };
  const oldDoc = { };
  const typeIdValidator = { type: 'string' };
  const simpleTypeFilter = simple.stub();
  const isDocumentMissingOrDeleted = simple.stub();
  const isValueNullOrUndefined = simple.stub();
  const jsonStringify = simple.stub();
  const requireAccess = simple.stub();
  const requireRole = simple.stub();
  const requireUser = simple.stub();
  const channel = simple.stub();
  const access = simple.stub();
  const role = simple.stub();

  const customActionStub = simple.stub();

  return {
    _: _,
    doc: doc,
    oldDoc: oldDoc,
    typeIdValidator: typeIdValidator,
    simpleTypeFilter: simpleTypeFilter,
    isDocumentMissingOrDeleted: isDocumentMissingOrDeleted,
    isValueNullOrUndefined: isValueNullOrUndefined,
    jsonStringify: jsonStringify,
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

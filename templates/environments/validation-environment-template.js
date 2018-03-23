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

  return {
    _,
    doc,
    oldDoc,
    typeIdValidator,
    simpleTypeFilter,
    isDocumentMissingOrDeleted,
    isValueNullOrUndefined,
    jsonStringify,
    requireAccess,
    requireRole,
    requireUser,
    channel,
    access,
    role,
    documentDefinitions: %DOC_DEFINITIONS_PLACEHOLDER%
  };
}

function makeValidationEnvironment(_, simpleMock) {
  const doc = { };
  const oldDoc = { };
  const typeIdValidator = { type: 'string' };
  const simpleTypeFilter = simpleMock.stub();
  const isDocumentMissingOrDeleted = simpleMock.stub();
  const isValueNullOrUndefined = simpleMock.stub();
  const jsonStringify = simpleMock.stub();
  const requireAccess = simpleMock.stub();
  const requireAdmin = simpleMock.stub();
  const requireRole = simpleMock.stub();
  const requireUser = simpleMock.stub();
  const channel = simpleMock.stub();
  const access = simpleMock.stub();
  const role = simpleMock.stub();
  const expiry = simpleMock.stub();

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
    requireAdmin,
    requireRole,
    requireUser,
    channel,
    access,
    role,
    expiry,
    documentDefinitions: $DOC_DEFINITIONS_PLACEHOLDER$
  };
}

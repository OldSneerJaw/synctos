function makeTestEnvironment(_, simpleMock) {
  const JSON = {
    parse: global.JSON.parse,
    stringify: global.JSON.stringify
  };
  const requireAccess = simpleMock.stub();
  const requireRole = simpleMock.stub();
  const requireUser = simpleMock.stub();
  const channel = simpleMock.stub();
  const access = simpleMock.stub();
  const role = simpleMock.stub();
  const expiry = simpleMock.stub();

  return {
    _,
    JSON,
    requireAccess,
    requireRole,
    requireUser,
    channel,
    access,
    role,
    expiry,
    syncFunction: $SYNC_FUNC_PLACEHOLDER$
  };
}

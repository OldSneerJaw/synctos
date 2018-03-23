function makeTestEnvironment(_, simple) {
  const JSON = {
    parse: global.JSON.parse,
    stringify: global.JSON.stringify
  };
  const requireAccess = simple.stub();
  const requireRole = simple.stub();
  const requireUser = simple.stub();
  const channel = simple.stub();
  const access = simple.stub();
  const role = simple.stub();

  return {
    _,
    JSON,
    requireAccess,
    requireRole,
    requireUser,
    channel,
    access,
    role,
    syncFunction: %SYNC_FUNC_PLACEHOLDER%
  };
}

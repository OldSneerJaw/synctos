function makeTestEnvironment(_, simple) {
  const requireAccess = simple.stub();
  const requireRole = simple.stub();
  const requireUser = simple.stub();
  const channel = simple.stub();
  const access = simple.stub();
  const role = simple.stub();

  const customActionStub = simple.stub();

  return {
    _: _,
    requireAccess: requireAccess,
    requireRole: requireRole,
    requireUser: requireUser,
    channel: channel,
    access: access,
    role: role,
    customActionStub: customActionStub,
    syncFunction: %SYNC_FUNC_PLACEHOLDER%
  };
}

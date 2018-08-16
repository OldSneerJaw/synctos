const sampleSpecHelperMaker = require('./helpers/sample-spec-helper-maker');
const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Sample business notification doc definition', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-sample-sync-function.js');
  const errorFormatter = testFixture.validationErrorFormatter;
  const sampleSpecHelper = sampleSpecHelperMaker.init(testFixture);

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  const expectedDocType = 'notification';
  const expectedBasePrivilege = 'NOTIFICATIONS';

  function getExpectedAccessAssignments(doc, docId) {
    return [
      {
        expectedChannels: [ `${docId}-VIEW` ],
        expectedUsers: doc ? doc.users : null,
        expectedRoles: doc ? doc.groups : null
      }
    ];
  }

  function verifyNotificationCreated(businessId, doc) {
    testFixture.verifyDocumentCreated(
      doc,
      sampleSpecHelper.getExpectedAuthorization('notification-add'),
      getExpectedAccessAssignments(doc, doc._id));
  }

  function verifyNotificationReplaced(businessId, doc, oldDoc) {
    testFixture.verifyDocumentReplaced(
      doc,
      oldDoc,
      sampleSpecHelper.getExpectedAuthorization([ `${businessId}-CHANGE_${expectedBasePrivilege}` ]),
      getExpectedAccessAssignments(doc, doc._id));
  }

  function verifyNotificationDeleted(businessId, oldDoc) {
    testFixture.verifyDocumentDeleted(
      oldDoc,
      sampleSpecHelper.getExpectedAuthorization([ `${businessId}-REMOVE_${expectedBasePrivilege}` ]));
  }

  function verifyNotificationNotCreated(businessId, doc, expectedErrorMessages) {
    testFixture.verifyDocumentNotCreated(
      doc,
      expectedDocType,
      expectedErrorMessages,
      sampleSpecHelper.getExpectedAuthorization('notification-add'));
  }

  function verifyNotificationNotReplaced(businessId, doc, oldDoc, expectedErrorMessages) {
    testFixture.verifyDocumentNotReplaced(
      doc,
      oldDoc,
      expectedDocType,
      expectedErrorMessages,
      sampleSpecHelper.getExpectedAuthorization([ `${businessId}-CHANGE_${expectedBasePrivilege}` ]));
  }

  it('successfully creates a valid notification document', () => {
    const doc = {
      _id: 'biz.63.notification.5',
      eventId: '082979cf-6990-44a6-bb62-9b9517c3052b',
      sender: 'test-service',
      type: 'invoice-payments',
      subject: 'pay up!',
      message: 'you best pay up now, or else...',
      createdAt: '2016-02-29T17:13:43.666Z',
      actions: [ 'http://foobar.baz', 'http://bazbar.foo' ],
      users: [ 'foobar', 'baz' ]
    };

    verifyNotificationCreated(63, doc);
  });

  it('cannot create a notification document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.13.notification.5',
      eventId: 'not-a-uuid',
      type: true ,
      subject: '', // missing sender, empty subject
      'whatsthis?': 'something I dont recognize!', // unrecognized property
      createdAt: '2016-02-29T25:13:43.666Z', // invalid hour
      firstReadAt: '201-07-14T21:21:21.212-08:00', // invalid year
      actions: [ { url: 24 }, null ] // integer url, non-existent label
    };

    verifyNotificationNotCreated(
      13,
      doc,
      [
        errorFormatter.requiredValueViolation('sender'),
        errorFormatter.typeConstraintViolation('type', 'string'),
        errorFormatter.mustNotBeEmptyViolation('subject'),
        errorFormatter.requiredValueViolation('message'),
        errorFormatter.datetimeFormatInvalid('createdAt'),
        errorFormatter.typeConstraintViolation('actions[0].url', 'string'),
        errorFormatter.requiredValueViolation('actions[0].label'),
        errorFormatter.requiredValueViolation('actions[1]'),
        errorFormatter.unsupportedProperty('whatsthis?'),
        errorFormatter.datetimeFormatInvalid('firstReadAt'),
        errorFormatter.uuidFormatInvalid('eventId')
      ]);
  });

  it('successfully replaces a valid notification document', () => {
    const doc = {
      _id: 'biz.7.notification.3',
      eventId: '1d856cd8-a0db-473c-9ea0-20b3113e2571',
      type: 'invoice-payments',
      sender: 'test-service',
      subject: 'a different subject',
      message: 'last warning!',
      createdAt: '2016-02-29T17:13:43.666Z',
      firstReadAt: '2016-07-14T21:21:21.212-08:00',
      actions: [ { url: 'http://foobar.baz/lastwarning', label: 'pay up here'} ],
      groups: [ 'my-group1', 'my-group2' ]
    };
    const oldDoc = {
      _id: 'biz.7.notification.3',
      eventId: '1d856cd8-a0db-473c-9ea0-20b3113e2571',
      type: 'invoice-payments',
      sender: 'test-service',
      subject: 'a different subject',
      message: 'last warning!',
      createdAt: '2016-02-29T17:13:43.666Z',
      actions: [ { 'url': 'http://foobar.baz/lastwarning', 'label': 'pay up here'} ],
      groups: [ 'my-group1', 'my-group2' ]
    };

    verifyNotificationReplaced(7, doc, oldDoc);
  });

  it('cannot replace a notification document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.10.notification.3',
      eventId: '692d8c84-8ff2-358-b806-edbf4c3c5813',
      sender: '', // missing type, empty sender
      message: '', // missing subject, empty message
      createdAt: '2016-04-29T17:13:43.666Z', // changed createdAt
      firstReadAt: '2016-07-14T21:24:16.997-08:00',
      actions: [ { label: ''} ]
    };
    const oldDoc = { // valid oldDoc
      _id: 'biz.10.notification.3',
      eventId: '692d8c84-8ff2-358-b806-edbf4c3c5813',
      type: 'invoice-payments',
      sender: 'test-service',
      subject: 'a different subject',
      message: 'last warning!',
      createdAt: '2016-02-29T17:13:43.666Z',
      firstReadAt: '2016-07-14T21:21:21.212-08:00',
      actions: [ { url: 'http://foobar.baz/lastwarning', label: 'pay up here'} ]
    };

    verifyNotificationNotReplaced(
      10,
      doc,
      oldDoc,
      [
        errorFormatter.immutableItemViolation('sender'),
        errorFormatter.mustNotBeEmptyViolation('sender'),
        errorFormatter.immutableItemViolation('type'),
        errorFormatter.requiredValueViolation('type'),
        errorFormatter.immutableItemViolation('subject'),
        errorFormatter.requiredValueViolation('subject'),
        errorFormatter.immutableItemViolation('message'),
        errorFormatter.mustNotBeEmptyViolation('message'),
        errorFormatter.immutableItemViolation('createdAt'),
        errorFormatter.immutableItemViolation('actions'),
        errorFormatter.requiredValueViolation('actions[0].url'),
        errorFormatter.mustNotBeEmptyViolation('actions[0].label'),
        errorFormatter.immutableItemViolation('firstReadAt'),
        errorFormatter.uuidFormatInvalid('eventId')
      ]);
  });

  it('successfully deletes a valid notification document', () => {
    const oldDoc = {
      _id: 'biz.71.notification.5',
      eventId: '56be8a52-f050-4d72-b4cb-c4f6eb2ca3ed',
      type: 'invoice-payments',
      sender: 'test-service',
      subject: 'pay up!',
      message: 'you best pay up now, or else...',
      createdAt: '2016-02-29T17:13:43.666Z',
      actions: [ { url: 'http://foobar.baz', label: 'pay up here'} ]
    };

    verifyNotificationDeleted(71, oldDoc);
  });
});

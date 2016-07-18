var testHelper = require('../etc/test-helper.js');

var serviceChannel = 'SERVICE';

describe('The sample-sync-doc-definitions sync function', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/test-sample-sync-function.js');
  });

  describe('business config doc definition', function() {
    function verifyBusinessConfigCreated(businessId, doc) {
      testHelper.verifyDocumentCreated(doc, [ serviceChannel, businessId + '-CHANGE_BUSINESS' ]);
    }

    function verifyBusinessConfigReplaced(businessId, doc, oldDoc) {
      testHelper.verifyDocumentReplaced(doc, oldDoc, [ serviceChannel, businessId + '-CHANGE_BUSINESS' ]);
    }

    function verifyBusinessConfigDeleted(businessId, oldDoc) {
      testHelper.verifyDocumentDeleted(oldDoc, [ serviceChannel, businessId + '-REMOVE_BUSINESS' ]);
    }

    function verifyBusinessConfigRejected(businessId, doc, oldDoc, expectedErrorMessages) {
      testHelper.verifyDocumentNotReplaced(doc, oldDoc, 'business', expectedErrorMessages, [ serviceChannel, businessId + '-CHANGE_BUSINESS' ]);
    }

    it('successfully creates a valid business document', function() {
      var doc = {
        _id: 'biz.2',
        _attachments: {
          'logo.gIf': {
            content_type: 'image/gif',
            length: 2097152
          }
        },
        businessLogoAttachment: 'logo.gIf',
        defaultInvoiceTemplate: {
          templateId: 'salmon'
        }
      };

      verifyBusinessConfigCreated(2, doc);
    });

    it('cannot create a business document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.5',
        businessLogoAttachment: 15,
        defaultInvoiceTemplate: { templateId: '', 'some-unrecognized-property': 'baz' },
        paymentProcessors: 0,
        'unrecognized-property1': 'foo'
      };

      verifyBusinessConfigRejected(
        5,
        doc,
        undefined,
        [
          'item "paymentProcessors" must be an array',
          'attachment reference "businessLogoAttachment" must be a string',
          'item "defaultInvoiceTemplate.templateId" must not be empty',
          'property "defaultInvoiceTemplate.some-unrecognized-property" is not supported',
          'property "unrecognized-property1" is not supported'
        ]);
    });

    it('successfully replaces a valid business document', function() {
      var doc = { _id: 'biz.8', paymentProcessors: [ 'foo', 'bar' ], businessLogoAttachment: 'foobar.png' };
      var oldDoc = { _id: 'biz.8' };

      verifyBusinessConfigReplaced(8, doc, oldDoc);
    });

    it('cannot replace a business document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.551',
        _attachments: {
          'bogus.mp3': {
            content_type: 'text/plain',
            length: 2097153
          }
        },
        businessLogoAttachment: 'bogus.mp3',
        defaultInvoiceTemplate: { templateId: 6 },
        paymentProcessors: [ 'foo', 8 ],
        'unrecognized-property2': 'bar'
      };
      var oldDoc = { _id: 'biz.551' };

      verifyBusinessConfigRejected(
        551,
        doc,
        oldDoc,
        [
          'attachment reference "businessLogoAttachment" must have a supported file extension (png,gif,jpg,jpeg)',
          'attachment reference "businessLogoAttachment" must have a supported content type (image/png,image/gif,image/jpeg)',
          'attachment reference "businessLogoAttachment" must not be larger than 2097152 bytes',
          'item "defaultInvoiceTemplate.templateId" must be a string',
          'item "paymentProcessors[1]" must be a string',
          'property "unrecognized-property2" is not supported'
        ]);
    });

    it('successfully deletes a valid business document', function() {
      var oldDoc = { _id: 'biz.11' };

      verifyBusinessConfigDeleted(11, oldDoc);
    });
  });

  describe('invoice payment processing attempt doc definition', function() {
    function verifyPaymentAttemptWritten(businessId, doc, oldDoc) {
      testHelper.verifyDocumentAccepted(doc, oldDoc, serviceChannel);
    }

    function verifyPaymentAttemptNotWritten(businessId, doc, oldDoc, expectedErrorMessages) {
      testHelper.verifyDocumentRejected(doc, oldDoc, 'paymentAttempt', expectedErrorMessages, serviceChannel);
    }

    it('successfully creates a valid payment processing attempt document', function() {
      var doc = {
        _id: 'paymentAttempt.foo-bar',
        _attachments: { },
        businessId: 20,
        invoiceRecordId: 10,
        paymentRequisitionId: 'my-payment-requisition',
        paymentAttemptSpreedlyToken: 'my-spreedly-token',
        date: '2016-02-29',
        internalPaymentRecordId: 30,
        gatewayTransactionId: 'my-gateway-transaction',
        gatewayMessage: 'my-gateway-message',
        totalAmountPaid: 72838,
        totalAmountPaidFormatted: '$728.38'
      };

      verifyPaymentAttemptWritten(20, doc);
    });

    it('cannot create a payment processing attempt document when the properties are invalid', function() {
      var doc = {
        _id: 'paymentAttempt.foo-bar',
        businessId: 'my-business',
        paymentRequisitionId: '',
        paymentAttemptSpreedlyToken: '',
        date: '2016-00-30', // The month is invalid
        internalPaymentRecordId: 0,
        gatewayTransactionId: '',
        gatewayMessage: 17,
        totalAmountPaid: 'invalid',
        totalAmountPaidFormatted: 999,
        unsupportedProperty: 'foobar'
      };

      verifyPaymentAttemptNotWritten(
        'my-business',
        doc,
        undefined,
        [
          'item "businessId" must be an integer',
          'required item "invoiceRecordId" is missing',
          'item "paymentRequisitionId" must not be empty',
          'item "paymentAttemptSpreedlyToken" must not be empty',
          'item "date" must be an ISO 8601 date string with optional time and time zone components',
          'item "internalPaymentRecordId" must not be less than 1',
          'item "gatewayTransactionId" must not be empty',
          'item "gatewayMessage" must be a string',
          'item "totalAmountPaid" must be an integer',
          'item "totalAmountPaidFormatted" must be a string',
          'property "unsupportedProperty" is not supported'
        ]);
    });

    it('cannot replace a payment processing attempt document because it is immutable', function() {
      var doc = {
        _id: 'paymentAttempt.foo-bar',
        businessId: 0,
        invoiceRecordId: 0,
        gatewayTransactionId: 7,
        gatewayMessage: true,
        totalAmountPaid: 0,
        totalAmountPaidFormatted: '',
        unsupportedProperty: 'foobar'
      };
      var oldDoc = {
        _id: 'paymentAttempt.foo-bar',
        businessId: 23,
        invoiceRecordId: 79,
        paymentRequisitionId: 'my-payment-req',
        paymentAttemptSpreedlyToken: 'my-spreedly-token',
        date: '2016-06-29'
      };

      verifyPaymentAttemptNotWritten(
        23,
        doc,
        oldDoc,
        [
          'documents of this type cannot be replaced or deleted',
          'item "businessId" must not be less than 1',
          'item "invoiceRecordId" must not be less than 1',
          'required item "paymentRequisitionId" is missing',
          'required item "paymentAttemptSpreedlyToken" is missing',
          'required item "date" is missing',
          'item "gatewayTransactionId" must be a string',
          'item "gatewayMessage" must be a string',
          'item "totalAmountPaid" must not be less than 1',
          'item "totalAmountPaidFormatted" must not be empty',
          'property "unsupportedProperty" is not supported'
        ]);
    });

    it('cannot deletes a valid payment processing attempt document because it is immutable', function() {
      var doc = { _id: 'paymentAttempt.foo-bar', _deleted: true };
      var oldDoc = { _id: 'paymentAttempt.foo-bar', businessId: 20 };

      verifyPaymentAttemptNotWritten(20, doc, oldDoc, [ 'documents of this type cannot be replaced or deleted' ]);
    });
  });

  describe('payment processor definition doc definition', function() {
    var expectedDocType = 'paymentProcessorDefinition';
    var expectedBasePrivilege = 'CUSTOMER_PAYMENT_PROCESSORS';

    it('successfully creates a valid payment processor document', function() {
      var doc = {
        _id: 'biz.3.paymentProcessor.2',
        provider: 'foo',
        spreedlyGatewayToken: 'bar',
        accountId: 555,
        displayName: 'Foo Bar',
        supportedCurrencyCodes: [ 'CAD', 'USD' ]
      };

      verifyDocumentCreated(expectedBasePrivilege, 3, doc);
    });

    it('cannot create a payment processor document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.1.paymentProcessor.2',
        provider: '',
        spreedlyGatewayToken: '',
        accountId: 0,
        displayName: 7,
        supportedCurrencyCodes: '',
        'unrecognized-property3': 'foo'
      };

      verifyDocumentNotCreated(
        expectedBasePrivilege,
        1,
        doc,
        expectedDocType,
        [
          'item "provider" must not be empty',
          'item "spreedlyGatewayToken" must not be empty',
          'item "accountId" must not be less than 1',
          'item "displayName" must be a string',
          'item "supportedCurrencyCodes" must be an array',
          'property "unrecognized-property3" is not supported'
        ]);
    });

    it('successfully replaces a valid payment processor document', function() {
      var doc = {
        _id: 'biz.5.paymentProcessor.2',
        provider: 'foobar',
        spreedlyGatewayToken: 'barfoo',
        accountId: 1
      };
      var oldDoc = { _id: 'biz.5.paymentProcessor.2', provider: 'bar' };

      verifyDocumentReplaced(expectedBasePrivilege, 5, doc, oldDoc);
    });

    it('cannot replace a payment processor document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.2.paymentProcessor.2',
        accountId: 555.9,
        displayName: [ ],
        supportedCurrencyCodes: [ '666', 'CAD' ],
        'unrecognized-property4': 'bar'
      };
      var oldDoc = { _id: 'biz.2.paymentProcessor.2', provider: 'foo' };

      verifyDocumentNotReplaced(
        expectedBasePrivilege,
        2,
        doc,
        oldDoc,
        expectedDocType,
        [
          'item "supportedCurrencyCodes[0]" must conform to expected format /^[A-Z]{3}$/',
          'item "accountId" must be an integer',
          'item "displayName" must be a string',
          'required item "provider" is missing',
          'required item "spreedlyGatewayToken" is missing',
          'property "unrecognized-property4" is not supported'
        ]);
    });

    it('successfully deletes a payment processor document', function() {
      var oldDoc = { _id: 'biz.8.paymentProcessor.2' };

      verifyDocumentDeleted(expectedBasePrivilege, 8, oldDoc);
    });
  });

  describe('payment requisitions reference doc definition', function() {
    var expectedDocType = 'paymentRequisitionsReference';
    var expectedBasePrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

    it('successfully creates a valid payment requisitions reference document', function() {
      var doc = { _id: 'biz.92.invoice.15.paymentRequisitions', paymentProcessorId: 'foo', paymentRequisitionIds: [ 'req1', 'req2' ] };

      verifyDocumentCreated(expectedBasePrivilege, 92, doc);
    });

    it('cannot create a payment requisitions reference document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.18.invoice.7.paymentRequisitions',
        paymentRequisitionIds: [ ],
        'unrecognized-property5': 'foo',
        paymentAttemptIds: 79
      };

      verifyDocumentNotCreated(
        expectedBasePrivilege,
        18,
        doc,
        expectedDocType,
        [
          'required item "paymentProcessorId" is missing',
          'item "paymentRequisitionIds" must not be empty',
          'item "paymentAttemptIds" must be an array',
          'property "unrecognized-property5" is not supported'
        ]);
    });

    it('successfully replaces a valid payment requisitions reference document', function() {
      var doc = { _id: 'biz.3612.invoice.222.paymentRequisitions', paymentProcessorId: 'bar', paymentRequisitionIds: [ 'req2' ] };
      var oldDoc = { _id: 'biz.3612.invoice.222.paymentRequisitions', paymentProcessorId: 'foo', paymentRequisitionIds: [ 'req1' ] };

      verifyDocumentReplaced(expectedBasePrivilege, 3612, doc, oldDoc);
    });

    it('cannot replace a payment requisitions reference document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.666.invoice.3.paymentRequisitions',
        paymentProcessorId: '',
        paymentRequisitionIds: [ 'foo', 15 ],
        'unrecognized-property6': 'bar',
        paymentAttemptIds: [ 73, 'bar' ]
      };
      var oldDoc = { _id: 'biz.666.invoice.3.paymentRequisitions', paymentProcessorId: 'foo', paymentRequisitionIds: [ 'req1' ] };

      verifyDocumentNotReplaced(
        expectedBasePrivilege,
        666,
        doc,
        oldDoc,
        expectedDocType,
        [
          'item "paymentProcessorId" must not be empty',
          'item "paymentRequisitionIds[1]" must be a string',
          'item "paymentAttemptIds[0]" must be a string',
          'property "unrecognized-property6" is not supported'
        ]);
    });

    it('successfully deletes a payment requisitions reference document', function() {
      var oldDoc = { _id: 'biz.987.invoice.2.paymentRequisitions' };

      verifyDocumentDeleted(expectedBasePrivilege, 987, oldDoc);
    });
  });

  describe('invoice payment requisition doc definition', function() {
    var expectedDocType = 'paymentRequisition';
    var expectedBasePrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

    it('successfully creates a valid payment requisition document', function() {
      var doc = {
        _id: 'paymentRequisition.foo-bar',
        invoiceRecordId: 10,
        businessId: 20,
        issuedAt: '2016-02-29T17:13:43.666Z',
        issuedByUserId: 42,
        invoiceRecipients: 'foo@bar.baz'
      };

      verifyDocumentCreated(expectedBasePrivilege, 20, doc);
    });

    it('cannot create a payment requisition document when the properties are invalid', function() {
      var doc = {
        _id: 'paymentRequisition.foo-bar',
        invoiceRecordId: 0,
        businessId: '6',
        issuedAt: '2016-13-29T17:13:43.666Z', // The month is invalid
        issuedByUserId: 0,
        invoiceRecipients: [ 'foo@bar.baz' ],
        'unrecognized-property7': 'foo'
      };

      verifyDocumentNotCreated(
        expectedBasePrivilege,
        6,
        doc,
        expectedDocType,
        [
          'item "businessId" must be an integer',
          'item "invoiceRecordId" must not be less than 1',
          'item "issuedAt" must be an ISO 8601 date string with optional time and time zone components',
          'item "issuedByUserId" must not be less than 1',
          'item "invoiceRecipients" must be a string',
          'property "unrecognized-property7" is not supported'
        ]);
    });

    it('successfully replaces a valid payment requisition document', function() {
      var doc = { _id: 'paymentRequisition.foo-bar', invoiceRecordId: 90, businessId: 21 };
      var oldDoc = {
        _id: 'paymentRequisition.foo-bar',
        invoiceRecordId: 90,
        businessId: 21,
        issuedByUserId: null
      };

      verifyDocumentReplaced(expectedBasePrivilege, 21, doc, oldDoc);
    });

    it('cannot replace a payment requisition document when the properties are invalid', function() {
      var doc = {
        _id: 'paymentRequisition.foo-bar',
        invoiceRecordId: '7',
        businessId: 0,
        issuedAt: '2016-02-29T25:13:43.666Z', // The hour is invalid
        issuedByUserId: '42',
        invoiceRecipients: 15,
        'unrecognized-property8': 'bar'
      };
      var oldDoc = { _id: 'paymentRequisition.foo-bar', invoiceRecordId: 10, businessId: 20 };

      verifyDocumentNotReplaced(
        expectedBasePrivilege,
        20,
        doc,
        oldDoc,
        expectedDocType,
        [
          'cannot change "businessId" property',
          'item "businessId" must not be less than 1',
          'value of item "invoiceRecordId" may not be modified',
          'item "invoiceRecordId" must be an integer',
          'value of item "issuedAt" may not be modified',
          'item "issuedAt" must be an ISO 8601 date string with optional time and time zone components',
          'value of item "issuedByUserId" may not be modified',
          'item "issuedByUserId" must be an integer',
          'value of item "invoiceRecipients" may not be modified',
          'item "invoiceRecipients" must be a string',
          'property "unrecognized-property8" is not supported'
        ]);
    });

    it('successfully deletes a payment requisition document', function() {
      var oldDoc = { _id: 'paymentRequisition.foo-bar', invoiceRecordId: 10, businessId: 17 };

      verifyDocumentDeleted(expectedBasePrivilege, 17, oldDoc);
    });
  });

  describe('business notification doc definition', function() {
    var expectedDocType = 'notification';
    var expectedBasePrivilege = 'NOTIFICATIONS';

    function verifyNotificationCreated(businessId, doc) {
      testHelper.verifyDocumentCreated(doc, serviceChannel);
    }

    function verifyNotificationReplaced(businessId, doc, oldDoc) {
      testHelper.verifyDocumentReplaced(doc, oldDoc, [ serviceChannel, businessId + '-CHANGE_' + expectedBasePrivilege ]);
    }

    function verifyNotificationDeleted(businessId, oldDoc) {
      testHelper.verifyDocumentDeleted(oldDoc, [ serviceChannel, businessId + '-REMOVE_' + expectedBasePrivilege ]);
    }

    function verifyNotificationNotCreated(businessId, doc, expectedErrorMessages) {
      testHelper.verifyDocumentNotCreated(doc, expectedDocType, expectedErrorMessages, serviceChannel);
    }

    function verifyNotificationNotReplaced(businessId, doc, oldDoc, expectedErrorMessages) {
      testHelper.verifyDocumentNotReplaced(
        doc,
        oldDoc,
        expectedDocType,
        expectedErrorMessages,
        [ serviceChannel, businessId + '-CHANGE_' + expectedBasePrivilege ]);
    }

    it('successfully creates a valid notification document', function() {
      var doc = {
        _id: 'biz.63.notification.5',
        sender: 'test-service',
        type: 'invoice-payments',
        subject: 'pay up!',
        message: 'you best pay up now, or else...',
        createdAt: '2016-02-29T17:13:43.666Z',
        actions: [ { url: 'http://foobar.baz', label: 'pay up here'} ]
      };

      verifyNotificationCreated(63, doc);
    });

    it('cannot create a notification document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.13.notification.5',
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
          'required item "sender" is missing',
          'item "type" must be a string',
          'item "subject" must not be empty',
          'required item "message" is missing',
          'item "createdAt" must be an ISO 8601 date string with optional time and time zone components',
          'item "actions[0].url" must be a string',
          'required item "actions[0].label" is missing',
          'required item "actions[1]" is missing',
          'property "whatsthis?" is not supported',
          'item "firstReadAt" must be an ISO 8601 date string with optional time and time zone components'
        ]);
    });

    it('successfully replaces a valid notification document', function() {
      var doc = {
        _id: 'biz.7.notification.3',
        type: 'invoice-payments',
        sender: 'test-service',
        subject: 'a different subject',
        message: 'last warning!',
        createdAt: '2016-02-29T17:13:43.666Z',
        firstReadAt: '2016-07-14T21:21:21.212-08:00',
        actions: [ { url: 'http://foobar.baz/lastwarning', label: 'pay up here'} ]
      };
      var oldDoc = {
        _id: 'biz.7.notification.3',
        type: 'invoice-payments',
        sender: 'test-service',
        subject: 'a different subject',
        message: 'last warning!',
        createdAt: '2016-02-29T17:13:43.666Z',
        actions: [ { 'url': 'http://foobar.baz/lastwarning', 'label': 'pay up here'} ]
      };

      verifyNotificationReplaced(7, doc, oldDoc);
    });

    it('cannot replace a notification document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.10.notification.3',
        sender: '', // missing type, empty sender
        message: '', // missing subject, empty message
        createdAt: '2016-04-29T17:13:43.666Z', // changed createdAt
        firstReadAt: '2016-07-14T21:24:16.997-08:00',
        actions: [ { label: ''} ]
      };
      var oldDoc = { // valid oldDoc
        _id: 'biz.10.notification.3',
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
          'value of item "sender" may not be modified',
          'item "sender" must not be empty',
          'value of item "type" may not be modified',
          'required item "type" is missing',
          'value of item "subject" may not be modified',
          'required item "subject" is missing',
          'value of item "message" may not be modified',
          'item "message" must not be empty',
          'value of item "createdAt" may not be modified',
          'value of item "actions" may not be modified',
          'required item "actions[0].url" is missing',
          'item "actions[0].label" must not be empty',
          'value of item "firstReadAt" may not be modified'
        ]);
    });

    it('successfully deletes a valid notification document', function() {
      var oldDoc = {
        _id: 'biz.71.notification.5',
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

  describe('business notifications reference doc definition', function() {
    var expectedDocType = 'notificationsReference';
    var expectedBasePrivilege = 'NOTIFICATIONS';

    it('successfully creates a valid notifications reference document', function() {
      var doc = {
        _id: 'biz.4.notifications',
        allNotificationIds: [ 'X', 'Y', 'Z' ],
        unreadNotificationIds: [ 'X', 'Z' ]
      };

      verifyDocumentCreated(expectedBasePrivilege, 4, doc);
    });

    it('cannot create a notifications reference document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.123.notifications',
        allNotificationIds: [ 23, 'Y', 'Z' ],
        unreadNotificationIds: [ 'Z', '' ]
      };

      verifyDocumentNotCreated(
        expectedBasePrivilege,
        123,
        doc,
        expectedDocType,
        [ 'item "allNotificationIds[0]" must be a string', 'item "unreadNotificationIds[1]" must not be empty' ]);
    });

    it('successfully replaces a valid notifications reference document', function() {
      var doc = {
        _id: 'biz.44.notifications',
        allNotificationIds: [ 'X', 'Y', 'Z', 'A' ],
        unreadNotificationIds: [ 'X', 'Z', 'A' ]
      };
      var oldDoc = {
        _id: 'biz.44.notifications',
        allNotificationIds: [ 'X', 'Y', 'Z' ],
        unreadNotificationIds: [ 'X', 'Z' ]
      };

      verifyDocumentReplaced(expectedBasePrivilege, 44, doc, oldDoc);
    });

    it('cannot replace a notifications reference document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.29.notifications',
        allNotificationIds: [ 'X', 'Y', 'Z', '' ],
        unreadNotificationIds: [ 'X', 'Z', 5 ]
      };
      var oldDoc = {
        _id: 'biz.29.notifications',
        allNotificationIds: [ 'X', 'Y', 'Z' ],
        unreadNotificationIds: [ 'X', 'Z' ]
      };

      verifyDocumentNotReplaced(
        expectedBasePrivilege,
        29,
        doc,
        oldDoc,
        expectedDocType,
        [ 'item "allNotificationIds[3]" must not be empty', 'item "unreadNotificationIds[2]" must be a string' ]);
    });

    it('successfully deletes a notifications reference document', function() {
      var oldDoc = {
        _id: 'biz.369.notifications',
        allNotificationIds: [ 'X', 'Y', 'Z' ],
        unreadNotificationIds: [ 'X', 'Z' ]
      };

      verifyDocumentDeleted(expectedBasePrivilege, 369, oldDoc);
    });
  });

  describe('business notifications config doc definition', function() {
    var expectedDocType = 'notificationsConfig';
    var expectedBasePrivilege = 'NOTIFICATIONS_CONFIG';

    it('successfully creates a valid notifications config document', function() {
      var doc = {
        _id: 'biz.1248.notificationsConfig',
        notificationTypes: {
          invoicePayments: {
            enabledTransports: [
              { transportId: 'ET1' },
              { transportId: 'ET2' }
            ]
          }
        }
      };

      verifyDocumentCreated(expectedBasePrivilege, 1248, doc);
    });

    it('cannot create a notifications config document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.72.notificationsConfig',
        notificationTypes: {
          invoicePayments: {
            enabledTransports: [
              { 'invalid-property': 'blah' },
              { transportId: '' }
            ]
          },
          'Invalid-Type': {
            enabledTransports: [ ]
          },
          '' : null
        },
        unknownprop: 23
      };

      verifyDocumentNotCreated(
        expectedBasePrivilege,
        72,
        doc,
        expectedDocType,
        [
          'property "notificationTypes[invoicePayments].enabledTransports[0].invalid-property" is not supported',
          'required item "notificationTypes[invoicePayments].enabledTransports[0].transportId" is missing',
          'item "notificationTypes[invoicePayments].enabledTransports[1].transportId" must not be empty',
          'hashtable key "notificationTypes[Invalid-Type]" does not conform to expected format /^[a-zA-Z]+$/',
          'empty hashtable key in item "notificationTypes" is not allowed',
          'hashtable key "notificationTypes[]" does not conform to expected format /^[a-zA-Z]+$/',
          'required item "notificationTypes[]" is missing',
          'property "unknownprop" is not supported'
        ]);
    });

    it('successfully replaces a valid notifications config document', function() {
      var doc = {
        _id: 'biz.191.notificationsConfig',
        notificationTypes: {
          invoicePayments: {
            enabledTransports: [
              { transportId: 'ET1' },
              { transportId: 'ET2' },
              { transportId: 'ET4' }
            ]
          }
        }
      };
      var oldDoc = {
        _id: 'biz.191.notificationsConfig',
        notificationTypes: {
          invoicePayments: {
            enabledTransports: [ ]
          }
        }
      };

      verifyDocumentReplaced(expectedBasePrivilege, 191, doc, oldDoc);
    });

    it('cannot replace a notifications config document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.37.notificationsConfig',
        notificationTypes: {
          invoicePayments: {
            enabledTransports: [
              { transportId: 'ET1' },
              { transportId: 'ET2', 'invalid-property': 73 },
              { transportId: 34 },
              null
            ]
          },
          foobar: null
        }
      };
      var oldDoc = {
        _id: 'biz.37.notificationsConfig',
        notificationTypes: { }
      };

      verifyDocumentNotReplaced(
        expectedBasePrivilege,
        37,
        doc,
        oldDoc,
        expectedDocType,
        [
          'property "notificationTypes[invoicePayments].enabledTransports[1].invalid-property" is not supported',
          'item "notificationTypes[invoicePayments].enabledTransports[2].transportId" must be a string',
          'required item "notificationTypes[invoicePayments].enabledTransports[3]" is missing',
          'required item "notificationTypes[foobar]" is missing'
        ]);
    });

    it('successfully deletes a notifications config document', function() {
      var oldDoc = {
        _id: 'biz.333.notificationsConfig',
        notificationTypes: {
          invoicePayments: {
            enabledTransports: [ 'ET1', 'ET2' ],
            disabledTransports: [ 'ET3' ]
          }
        }
      };

      verifyDocumentDeleted(expectedBasePrivilege, 333, oldDoc);
    });
  });

  describe('business notification transport doc definition', function() {
    var expectedDocType = 'notificationTransport';
    var expectedBasePrivilege = 'NOTIFICATIONS_CONFIG';

    it('successfully creates a valid notification transport document', function() {
      var doc = {
        _id: 'biz.82.notificationTransport.ABC',
        type: 'email',
        recipient: 'foo.bar@example.com'
      };

      verifyDocumentCreated(expectedBasePrivilege, 82, doc);
    });

    it('cannot create a notification transport document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.75.notificationTransport.ABC',
        recipient: ''
      };

      verifyDocumentNotCreated(
        expectedBasePrivilege,
        75,
        doc,
        expectedDocType,
        [ 'required item "type" is missing', 'item "recipient" must not be empty' ]);
    });

    it('successfully replaces a valid notification transport document', function() {
      var doc = {
        _id: 'biz.38.notificationTransport.ABC',
        type: 'email',
        recipient: 'different.foo.bar@example.com'
      };
      var oldDoc = {
        _id: 'biz.38.notificationTransport.ABC',
        type: 'email',
        recipient: 'foo.bar@example.com'
      };

      verifyDocumentReplaced(expectedBasePrivilege, 38, doc, oldDoc);
    });

    it('cannot replace a notification transport document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.73.notificationTransport.ABC',
        type: 23,
      };
      var oldDoc = {
        _id: 'biz.73.notificationTransport.ABC',
        type: 'email',
        recipient: 'foo.bar@example.com'
      };

      verifyDocumentNotReplaced(
        expectedBasePrivilege,
        73,
        doc,
        oldDoc,
        expectedDocType,
        [ 'item "type" must be a string', 'required item "recipient" is missing' ]);
    });

    it('successfully deletes a notification transport document', function() {
      var oldDoc = {
        _id: 'biz.14.notificationTransport.ABC',
        type: 'email',
        recipient: 'different.foo.bar@example.com'
      };

      verifyDocumentDeleted(expectedBasePrivilege, 14, oldDoc);
    });
  });

  describe('notification transport processing summary doc definition', function() {
    function verifyProcessingSummaryWritten(doc, oldDoc) {
      testHelper.verifyDocumentAccepted(doc, oldDoc, serviceChannel);
    }

    function verifyProcessingSummaryNotWritten(doc, oldDoc, expectedErrorMessages) {
      testHelper.verifyDocumentRejected(doc, oldDoc, 'notificationTransportProcessingSummary', expectedErrorMessages, serviceChannel);
    }

    it('successfully creates a valid notification transport processing summary document', function() {
      var doc = {
        _id: 'biz.901.notification.ABC.processedTransport.XYZ',
        nonce: 'my-nonce',
        processedAt: '2016-06-04T21:02:19.013Z',
        processedBy: 'foobar',
        sentAt: '2016-06-04T21:02:55.013Z'
      };

      verifyProcessingSummaryWritten(doc);
    });

    it('cannot create a notification transport processing summary document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.109.notification.ABC.processedTransport.XYZ',
        processedBy: [ ],
        sentAt: '2016-06-04T21:02:55.9999Z'  // too many digits in the millisecond segment
      };

      verifyProcessingSummaryNotWritten(
        doc,
        undefined,
        [
          'required item "nonce" is missing',
          'item "processedBy" must be a string',
          'required item "processedAt" is missing',
          'item "sentAt" must be an ISO 8601 date string with optional time and time zone components'
        ]);
    });

    it('successfully replaces a valid notification transport processing summary document', function() {
      var doc = {
        _id: 'biz.119.notification.ABC.processedTransport.XYZ',
        nonce: 'my-nonce',
        processedAt: '2016-06-04T21:02:19.013Z'
      };
      var oldDoc = {
        _id: 'biz.119.notification.ABC.processedTransport.XYZ',
        nonce: 'my-nonce',
        processedBy: null,
        processedAt: '2016-06-04T21:02:19.013Z'
      };

      verifyProcessingSummaryWritten(doc, oldDoc);
    });

    it('cannot replace a notification transport processing summary document when the properties are invalid', function() {
      var doc = {
        _id: 'biz.275.notification.ABC.processedTransport.XYZ',
        nonce: 471,
        processedAt: '2016-06-04T09:27:07.514Z',
        sentAt: ''
      };
      var oldDoc = {
        _id: 'biz.275.notification.ABC.processedTransport.XYZ',
        processedBy: 'foobar',
        processedAt: '2016-06-03T21:02:19.013Z',
        sentAt: '2016-07-15'
      };

      verifyProcessingSummaryNotWritten(
        doc,
        oldDoc,
        [
          'value of item "nonce" may not be modified',
          'item "nonce" must be a string',
          'value of item "processedBy" may not be modified',
          'value of item "processedAt" may not be modified',
          'item "sentAt" must be an ISO 8601 date string with optional time and time zone components',
          'value of item "sentAt" may not be modified'
        ]);
    });

    it('successfully deletes a valid notification transport processing summary document', function() {
      var doc = { _id: 'biz.317.notification.ABC.processedTransport.XYZ', _deleted: true };
      var oldDoc = {
        _id: 'biz.317.notification.ABC.processedTransport.XYZ',
        processedBy: 'foobar',
        processedAt: '2016-06-04T21:02:19.013Z'
      };

      verifyProcessingSummaryWritten(doc, oldDoc);
    });
  });
});

function verifyDocumentCreated(basePrivilegeName, businessId, doc) {
  testHelper.verifyDocumentCreated(doc, [ serviceChannel, businessId + '-ADD_' + basePrivilegeName ]);
}

function verifyDocumentReplaced(basePrivilegeName, businessId, doc, oldDoc) {
  testHelper.verifyDocumentReplaced(doc, oldDoc, [ serviceChannel, businessId + '-CHANGE_' + basePrivilegeName ]);
}

function verifyDocumentDeleted(basePrivilegeName, businessId, oldDoc) {
  testHelper.verifyDocumentDeleted(oldDoc, [ serviceChannel, businessId + '-REMOVE_' + basePrivilegeName ]);
}

function verifyDocumentNotCreated(basePrivilegeName, businessId, doc, expectedDocType, expectedErrorMessages) {
  testHelper.verifyDocumentNotCreated(
    doc,
    expectedDocType,
    expectedErrorMessages,
    [ serviceChannel, businessId + '-ADD_' + basePrivilegeName ]);
}

function verifyDocumentNotReplaced(basePrivilegeName, businessId, doc, oldDoc, expectedDocType, expectedErrorMessages) {
  testHelper.verifyDocumentNotReplaced(
    doc,
    oldDoc,
    expectedDocType,
    expectedErrorMessages,
    [ serviceChannel, businessId + '-CHANGE_' + basePrivilegeName ]);
}

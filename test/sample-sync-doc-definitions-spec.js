var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');

// Load the contents of the sync function file into a global variable called syncFunction
eval('var syncFunction = ' + fs.readFileSync('build/test-sample-sync-function.js').toString());

var serviceChannel = 'SERVICE';

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var channel;

describe('The sample-sync-doc-definitions sync function', function() {
  beforeEach(function() {
    requireAccess = simple.stub();
    channel = simple.stub();
  });

  describe('general cases', function() {
    it('cannot create a document with an unrecognized ID format', function() {
      var doc = { '_id': 'biz.1.invalid.2' };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Unknown document type' });
      });
    });

    it('cannot replace a document with an unrecognized ID format', function() {
      var doc = { '_id': 'biz.1.invalid.2', 'foo': 'bar' };
      var oldDoc = { '_id': 'biz.1.invalid.2' };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Unknown document type' });
      });
    });

    it('cannot delete a document with an unrecognized ID format', function() {
      var doc = { '_id': 'biz.1.invalid.2', '_deleted': true };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Unknown document type' });
      });
    });

    it('cannot create a document for a user without permission', function() {
      var doc = { '_id': 'biz.1', 'defaultInvoiceTemplate': { 'templateId': 'teapot' } };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(expectedError);
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.eql([ '1-CHANGE_BUSINESS', serviceChannel ]);
    });

    it('cannot replace a document for a user without permission', function() {
      var doc = { '_id': 'biz.1', 'businessLogoAttachment': 'logo.jpg' };
      var oldDoc = { '_id': 'biz.1' };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.eql([ '1-CHANGE_BUSINESS', serviceChannel ]);
    });

    it('cannot delete a document for a user without permission', function() {
      var doc = { '_id': 'biz.9', '_deleted': true };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(expectedError);
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.eql([ '9-REMOVE_BUSINESS', serviceChannel ]);
    });

    it('cannot specify whitelisted properties below the top level of the document', function() {
      var doc = {
        '_id': 'biz.417',
        'defaultInvoiceTemplate': {
          'templateId': 'teapot',
          '_id': 'my-id',
          '_rev': 'my-rev',
          '_deleted': true,
          '_revisions': [ ],
          '_attachments': { }
        }
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid business document: property "defaultInvoiceTemplate._id" is not supported; property "defaultInvoiceTemplate._rev" is not supported; property "defaultInvoiceTemplate._deleted" is not supported; property "defaultInvoiceTemplate._revisions" is not supported; property "defaultInvoiceTemplate._attachments" is not supported' });
      });
    });

    it('cannot include attachments in documents that do not explicitly allow them', function() {
      var doc = {
        '_id': 'biz.1248.notificationsConfig',
        'notificationTypes': { },
        '_attachments': {
          'foo.pdf': {
            'content_type': 'application/pdf',
            'length': 2097152
          }
        }
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notificationsConfig document: document type does not support attachments' });
      });
    });
  });

  describe('business config doc definition', function() {
    function verifyBusinessCreated(businessId) {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.have.length(2);
      expect(requireAccess.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

      expect(channel.callCount).to.equal(1);
      expect(channel.calls[0].arg).to.have.length(4);
      expect(channel.calls[0].arg).to.contain(businessId + '-VIEW');
      expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(serviceChannel);
    }

    function verifyBusinessReplaced(businessId) {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.have.length(2);
      expect(requireAccess.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

      expect(channel.callCount).to.equal(1);
      expect(channel.calls[0].arg).to.have.length(4);
      expect(channel.calls[0].arg).to.contain(businessId + '-VIEW');
      expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(serviceChannel);
    }

    function verifyBusinessDeleted(businessId) {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.have.length(2);
      expect(requireAccess.calls[0].arg).to.contain(businessId + '-REMOVE_BUSINESS');
      expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

      expect(channel.callCount).to.equal(1);
      expect(channel.calls[0].arg).to.have.length(4);
      expect(channel.calls[0].arg).to.contain(businessId + '-VIEW');
      expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(serviceChannel);
    }

    function verifyBusinessNotCreated(businessId) {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.have.length(2);
      expect(requireAccess.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

      expect(channel.callCount).to.equal(0);
    }

    function verifyBusinessNotReplaced(businessId) {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.have.length(2);
      expect(requireAccess.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

      expect(channel.callCount).to.equal(0);
    }

    function verifyBusinessNotDeleted(businessId) {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.have.length(2);
      expect(requireAccess.calls[0].arg).to.contain(businessId + '-REMOVE_BUSINESS');
      expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

      expect(channel.callCount).to.equal(0);
    }

    it('successfully creates a valid business document', function() {
      var doc = {
        '_id': 'biz.2',
        '_attachments': {
          'logo.gIf': {
            'content_type': 'image/gif',
            'length': 2097152
          }
        },
        'businessLogoAttachment': 'logo.gIf',
        'defaultInvoiceTemplate': {
          'templateId': 'salmon'
        }
      };

      syncFunction(doc, null);

      verifyBusinessCreated(2);
    });

    it('cannot create a business document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.5',
        'businessLogoAttachment': 15,
        'defaultInvoiceTemplate': { 'templateId': '', 'some-unrecognized-property': 'baz' },
        'paymentProcessors': 0,
        'unrecognized-property1': 'foo'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid business document: attachment reference "businessLogoAttachment" must be a string; item "defaultInvoiceTemplate.templateId" must not be empty; property "defaultInvoiceTemplate.some-unrecognized-property" is not supported; item "paymentProcessors" must be an array; property "unrecognized-property1" is not supported' });
      });
      verifyBusinessNotCreated(5);
    });

    it('successfully replaces a valid business document', function() {
      var doc = { '_id': 'biz.8', 'paymentProcessors': [ 'foo', 'bar' ], 'businessLogoAttachment': 'foobar.png' };
      var oldDoc = { '_id': 'biz.8' };

      syncFunction(doc, oldDoc);

      verifyBusinessReplaced(8);
    });

    it('cannot replace a business document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.551',
        '_attachments': {
          'bogus.mp3': {
            'content_type': 'text/plain',
            'length': 2097153
          }
        },
        'businessLogoAttachment': 'bogus.mp3',
        'defaultInvoiceTemplate': { 'templateId': 6 },
        'paymentProcessors': [ 'foo', 8 ],
        'unrecognized-property2': 'bar'
      };
      var oldDoc = { '_id': 'biz.551' };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid business document: attachment reference "businessLogoAttachment" must have a supported file extension (png,gif,jpg,jpeg); attachment reference "businessLogoAttachment" must have a supported content type (image/png,image/gif,image/jpeg); attachment reference "businessLogoAttachment" must not be larger than 2097152 bytes; item "defaultInvoiceTemplate.templateId" must be a string; item "paymentProcessors[1]" must be a string; property "unrecognized-property2" is not supported' });
      });
      verifyBusinessNotReplaced(551);
    });

    it('successfully deletes a valid business document', function() {
      var doc = { '_id': 'biz.11', '_deleted': true };

      syncFunction(doc, null);

      verifyBusinessDeleted(11);
    });
  });

  describe('invoice payment processing result doc definition', function() {
    var expectedBasePrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

    it('successfully creates a valid payment processing result document', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        '_attachments': { },
        'businessId': 20,
        'invoiceRecordId': 10,
        'paymentRequisitionId': 'my-payment-requisition',
        'paymentAttemptSpreedlyToken': 'my-spreedly-token',
        'date': '2016-02-29',
        'internalPaymentRecordId': 30,
        'gatewayTransactionId': 'my-gateway-transaction',
        'gatewayMessage': 'my-gateway-message',
        'totalAmountPaid': 72838,
        'totalAmountPaidFormatted': '$728.38'
      };

      syncFunction(doc, null);

      verifyDocumentCreated(expectedBasePrivilege, 20);
    });

    it('cannot create a payment processing result document when the properties are invalid', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        'businessId': 'my-business',
        'invoiceRecordId': 0,
        'paymentRequisitionId': '',
        'paymentAttemptSpreedlyToken': '',
        'date': '2016-00-30', // The month is invalid
        'internalPaymentRecordId': 0,
        'gatewayTransactionId': '',
        'gatewayMessage': 17,
        'totalAmountPaid': 'invalid',
        'totalAmountPaidFormatted': 999,
        'unsupportedProperty': 'foobar'
      };

      expect(syncFunction).withArgs(doc, null).to.throwException(function(ex) {
        expect(ex).to.eql({
          forbidden: 'Invalid paymentAttempt document: item "businessId" must be an integer; item "invoiceRecordId" must not be less than 1; item "paymentRequisitionId" must not be empty; item "paymentAttemptSpreedlyToken" must not be empty; item "date" must be an ISO 8601 date string with no time or time zone components; item "internalPaymentRecordId" must not be less than 1; item "gatewayTransactionId" must not be empty; item "gatewayMessage" must be a string; item "totalAmountPaid" must be an integer; item "totalAmountPaidFormatted" must be a string; property "unsupportedProperty" is not supported'
        });
      });
      verifyDocumentNotCreated(expectedBasePrivilege, 'my-business');
    });

    it('successfully replaces a valid payment processing result document', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        'businessId': 22,
        'invoiceRecordId': 6,
        'paymentRequisitionId': 'my-payment-requisition2',
        'paymentAttemptSpreedlyToken': 'my-spreedly-token2',
        'date': '2016-12-31'
      };
      var oldDoc = { '_id': 'paymentAttempt.foo-bar', 'businessId': 22 };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(expectedBasePrivilege, 22);
    });

    it('cannot replace a payment processing result document when the properties are invalid', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        'businessId': 66,
        'gatewayTransactionId': 7,
        'gatewayMessage': true,
        'totalAmountPaid': 0,
        'totalAmountPaidFormatted': '',
        'unsupportedProperty': 'foobar'
      };
      var oldDoc = { '_id': 'paymentAttempt.foo-bar', 'businessId': 23 };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({
          forbidden: 'Invalid paymentAttempt document: cannot change "businessId" property; required item "invoiceRecordId" is missing; required item "paymentRequisitionId" is missing; required item "paymentAttemptSpreedlyToken" is missing; required item "date" is missing; item "gatewayTransactionId" must be a string; item "gatewayMessage" must be a string; item "totalAmountPaid" must not be less than 1; item "totalAmountPaidFormatted" must not be empty; property "unsupportedProperty" is not supported'
        });
      });
      verifyDocumentNotReplaced(expectedBasePrivilege, 23);
    });

    it('successfully deletes a valid payment processing result document', function() {
      var doc = { '_id': 'paymentAttempt.foo-bar', '_deleted': true };
      var oldDoc = { '_id': 'paymentAttempt.foo-bar', 'businessId': 20 };

      syncFunction(doc, oldDoc);

      verifyDocumentDeleted(expectedBasePrivilege, 20);
    });
  });

  describe('payment processor definition doc definition', function() {
    var paymentProcessorPrivilege = 'CUSTOMER_PAYMENT_PROCESSORS';

    it('successfully creates a valid payment processor document', function() {
      var doc = {
        '_id': 'biz.3.paymentProcessor.2',
        'provider': 'foo',
        'spreedlyGatewayToken': 'bar',
        'accountId': 555,
        'displayName': 'Foo Bar',
        'supportedCurrencyCodes': [ 'CAD', 'USD' ]
      };

      syncFunction(doc, null);

      verifyDocumentCreated(paymentProcessorPrivilege, 3);
    });

    it('cannot create a payment processor document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.1.paymentProcessor.2',
        'provider': '',
        'spreedlyGatewayToken': '',
        'accountId': 0,
        'displayName': 7,
        'supportedCurrencyCodes': '',
        'unrecognized-property3': 'foo'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid paymentProcessorDefinition document: item "provider" must not be empty; item "spreedlyGatewayToken" must not be empty; item "accountId" must not be less than 1; item "displayName" must be a string; item "supportedCurrencyCodes" must be an array; property "unrecognized-property3" is not supported' });
      });
      verifyDocumentNotCreated(paymentProcessorPrivilege, 1);
    });

    it('successfully replaces a valid payment processor document', function() {
      var doc = {
        '_id': 'biz.5.paymentProcessor.2',
        'provider': 'foobar',
        'spreedlyGatewayToken': 'barfoo',
        'accountId': 1
      };
      var oldDoc = { '_id': 'biz.5.paymentProcessor.2', 'provider': 'bar' };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(paymentProcessorPrivilege, 5);
    });

    it('cannot replace a payment processor document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.2.paymentProcessor.2',
        'accountId': 555.9,
        'displayName': [ ],
        'supportedCurrencyCodes': [ '666', 'CAD' ],
        'unrecognized-property4': 'bar'
      };
      var oldDoc = { '_id': 'biz.2.paymentProcessor.2', 'provider': 'foo' };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid paymentProcessorDefinition document: required item "provider" is missing; required item "spreedlyGatewayToken" is missing; item "accountId" must be an integer; item "displayName" must be a string; item "supportedCurrencyCodes[0]" must conform to expected format /^[A-Z]{3}$/; property "unrecognized-property4" is not supported' });
      });
      verifyDocumentNotReplaced(paymentProcessorPrivilege, 2);
    });

    it('successfully deletes a valid payment processor document', function() {
      var doc = { '_id': 'biz.8.paymentProcessor.2', '_deleted': true };

      syncFunction(doc, null);

      verifyDocumentDeleted(paymentProcessorPrivilege, 8);
    });
  });

  describe('payment requisitions reference doc definition', function() {
    var expectedBasePrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

    it('successfully creates a valid payment requisitions reference document', function() {
      var doc = { '_id': 'biz.92.invoice.15.paymentRequisitions', 'paymentProcessorId': 'foo', 'paymentRequisitionIds': [ 'req1', 'req2' ] };

      syncFunction(doc, null);

      verifyDocumentCreated(expectedBasePrivilege, 92);
    });

    it('cannot create a payment requisitions reference document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.18.invoice.7.paymentRequisitions',
        'paymentRequisitionIds': [ ],
        'unrecognized-property5': 'foo',
        'paymentAttemptIds': 79
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid paymentRequisitionsReference document: required item "paymentProcessorId" is missing; item "paymentRequisitionIds" must not be empty; item "paymentAttemptIds" must be an array; property "unrecognized-property5" is not supported' });
      });
      verifyDocumentNotCreated(expectedBasePrivilege, 18);
    });

    it('successfully replaces a valid payment requisitions reference document', function() {
      var doc = { '_id': 'biz.3612.invoice.222.paymentRequisitions', 'paymentProcessorId': 'bar', 'paymentRequisitionIds': [ 'req2' ] };
      var oldDoc = { '_id': 'biz.3612.invoice.222.paymentRequisitions', 'paymentProcessorId': 'foo', 'paymentRequisitionIds': [ 'req1' ] };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(expectedBasePrivilege, 3612);
    });

    it('cannot replace a payment requisitions reference document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.666.invoice.3.paymentRequisitions',
        'paymentProcessorId': '',
        'paymentRequisitionIds': [ 'foo', 15 ],
        'unrecognized-property6': 'bar',
        'paymentAttemptIds': [ 73, 'bar' ]
      };
      var oldDoc = { '_id': 'biz.666.invoice.3.paymentRequisitions', 'paymentProcessorId': 'foo', 'paymentRequisitionIds': [ 'req1' ] };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid paymentRequisitionsReference document: item "paymentProcessorId" must not be empty; item "paymentRequisitionIds[1]" must be a string; item "paymentAttemptIds[0]" must be a string; property "unrecognized-property6" is not supported' });
      });
      verifyDocumentNotReplaced(expectedBasePrivilege, 666);
    });

    it('successfully deletes a valid payment requisitions reference document', function() {
      var doc = { '_id': 'biz.987.invoice.2.paymentRequisitions', '_deleted': true };

      syncFunction(doc, null);

      verifyDocumentDeleted(expectedBasePrivilege, 987);
    });
  });

  describe('invoice payment requisition doc definition', function() {
    var paymentRequisitionPrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

    it('successfully creates a valid payment requisition document', function() {
      var doc = {
        '_id': 'paymentRequisition.foo-bar',
        'invoiceRecordId': 10,
        'businessId': 20,
        'issuedAt': '2016-02-29T17:13:43.666Z',
        'issuedByUserId': 42,
        'invoiceRecipients': 'foo@bar.baz'
      };

      syncFunction(doc, null);

      verifyDocumentCreated(paymentRequisitionPrivilege, 20);
    });

    it('cannot create a payment requisition document when the properties are invalid', function() {
      var doc = {
        '_id': 'paymentRequisition.foo-bar',
        'invoiceRecordId': 0,
        'businessId': '6',
        'issuedAt': '2016-13-29T17:13:43.666Z', // The month is invalid
        'issuedByUserId': 0,
        'invoiceRecipients': [ 'foo@bar.baz' ],
        'unrecognized-property7': 'foo'
      };

      expect(syncFunction).withArgs(doc, null).to.throwException(function(ex) {
        expect(ex).to.eql(
          {
            forbidden: 'Invalid paymentRequisition document: item "invoiceRecordId" must not be less than 1; item "businessId" must be an integer; item "issuedAt" must be an ISO 8601 date string with optional time and time zone components; item "issuedByUserId" must not be less than 1; item "invoiceRecipients" must be a string; property "unrecognized-property7" is not supported'
          });
      });
      verifyDocumentNotCreated(paymentRequisitionPrivilege, 6);
    });

    it('successfully replaces a valid payment requisition document', function() {
      var doc = { '_id': 'paymentRequisition.foo-bar', 'invoiceRecordId': 90, 'businessId': 21 };
      var oldDoc = {
        '_id': 'paymentRequisition.foo-bar',
        'invoiceRecordId': 10,
        'businessId': 21,
        'issuedAt': '2016-02-29T17:13:43.666Z',
        'issuedByUserId': 42,
        'invoiceRecipients': 'foo@bar.baz'
      };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(paymentRequisitionPrivilege, 21);
    });

    it('cannot replace a payment requisition document when the properties are invalid', function() {
      var doc = {
        '_id': 'paymentRequisition.foo-bar',
        'invoiceRecordId': '7',
        'businessId': 0,
        'issuedAt': '2016-02-29T25:13:43.666Z', // The hour is invalid
        'issuedByUserId': '42',
        'invoiceRecipients': 15,
        'unrecognized-property8': 'bar'
      };
      var oldDoc = { '_id': 'paymentRequisition.foo-bar', 'invoiceRecordId': 10, 'businessId': 20 };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql(
          {
            forbidden: 'Invalid paymentRequisition document: item "invoiceRecordId" must be an integer; cannot change "businessId" property; item "businessId" must not be less than 1; item "issuedAt" must be an ISO 8601 date string with optional time and time zone components; item "issuedByUserId" must be an integer; item "invoiceRecipients" must be a string; property "unrecognized-property8" is not supported'
          });
      });
      verifyDocumentNotReplaced(paymentRequisitionPrivilege, 20);
    });

    it('successfully deletes a valid payment requisition document', function() {
      var doc = { '_id': 'paymentRequisition.foo-bar', '_deleted': true };
      var oldDoc = { '_id': 'paymentRequisition.foo-bar', 'invoiceRecordId': 10, 'businessId': 17 };

      syncFunction(doc, oldDoc);

      verifyDocumentDeleted(paymentRequisitionPrivilege, 17);
    });
  });

  describe('business notification doc definition', function() {
    var notificationsPrivilege = 'NOTIFICATIONS';

    it('successfully creates a valid notification document', function() {
      var doc = {
        '_id': 'biz.63.notification.5',
        'sender': 'test-service',
        'type': 'invoice-payments',
        'subject': 'pay up!',
        'message': 'you best pay up now, or else...',
        'createdAt': '2016-02-29T17:13:43.666Z',
        'actions': [ { 'url': 'http://foobar.baz', 'label': 'pay up here'} ]
      };

      syncFunction(doc, null);

      verifyDocumentCreated(notificationsPrivilege, 63);
    });

    it('cannot create a notification document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.13.notification.5',
        'type': true ,
        'subject': '', // missing sender, empty subject
        'whatsthis?': 'something I dont recognize!', // unrecognized property
        'createdAt': '2016-02-29T25:13:43.666Z', // invalid hour
        'actions': [ { 'url': 24 } ] // integer url, non-existent label
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notification document: required item "sender" is missing; item "type" must be a string; item "subject" must not be empty; required item "message" is missing; item "createdAt" must be an ISO 8601 date string with optional time and time zone components; item "actions[0].url" must be a string; required item "actions[0].label" is missing; property "whatsthis?" is not supported' });
      });
      verifyDocumentNotCreated(notificationsPrivilege, 13);
    });

    it('successfully replaces a valid notification document', function() {
      var doc = {
        '_id': 'biz.7.notification.3',
        'type': 'invoice-payments',
        'sender': 'test-service',
        'subject': 'a different subject',
        'message': 'last warning!',
        'createdAt': '2016-02-29T17:13:43.666Z',
        'actions': [ { 'url': 'http://foobar.baz/lastwarning', 'label': 'pay up here'} ]
      };
      var oldDoc = {
        '_id': 'biz.7.notification.3',
        '_deleted': true
      };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(notificationsPrivilege, 7);
    });

    it('cannot replace a notification document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.10.notification.3',
        'sender': '', // missing type, empty sender
        'message': '', // missing subject, empty message
        'createdAt': '2016-04-29T17:13:43.666Z', // changed createdAt
        'actions': [ { 'label': ''} ]
      };
      var oldDoc = { // valid oldDoc
        '_id': 'biz.10.notification.3',
        'type': 'invoice-payments',
        'sender': 'test-service',
        'subject': 'a different subject',
        'message': 'last warning!',
        'createdAt': '2016-02-29T17:13:43.666Z',
        'actions': [ { 'url': 'http://foobar.baz/lastwarning', 'label': 'pay up here'} ]
      };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notification document: item "sender" must not be empty; required item "type" is missing; required item "subject" is missing; item "message" must not be empty; value of item "createdAt" may not be modified; required item "actions[0].url" is missing; item "actions[0].label" must not be empty' });
      });
      verifyDocumentNotReplaced(notificationsPrivilege, 10);
    });

    it('successfully deletes a valid notification document', function() {
      var doc = { '_id': 'biz.71.notification.5', '_deleted': true };
      var oldDoc = {
        '_id': 'biz.71.notification.5',
        'type': 'invoice-payments',
        'sender': 'test-service',
        'subject': 'pay up!',
        'message': 'you best pay up now, or else...',
        'createdAt': '2016-02-29T17:13:43.666Z',
        'actions': [ { 'url': 'http://foobar.baz', 'label': 'pay up here'} ]
      };

      syncFunction(doc, oldDoc);

      verifyDocumentDeleted(notificationsPrivilege, 71);
    });
  });

  describe('business notifications reference doc definition', function() {
    var notificationsRefPrivilege = 'NOTIFICATIONS';

    it('successfully creates a valid notifications reference document', function() {
      var doc = {
        '_id': 'biz.4.notifications',
        'allNotificationIds': [ 'X', 'Y', 'Z' ],
        'unreadNotificationIds': [ 'X', 'Z' ]
      };

      syncFunction(doc, null);

      verifyDocumentCreated(notificationsRefPrivilege, 4);
    });

    it('cannot create a notifications reference document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.123.notifications',
        'allNotificationIds': [ 23, 'Y', 'Z' ],
        'unreadNotificationIds': [ 'Z', '' ]
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notificationsReference document: item "allNotificationIds[0]" must be a string; item "unreadNotificationIds[1]" must not be empty' });
      });
      verifyDocumentNotCreated(notificationsRefPrivilege, 123);
    });

    it('successfully replaces a valid notifications reference document', function() {
      var doc = {
        '_id': 'biz.44.notifications',
        'allNotificationIds': [ 'X', 'Y', 'Z', 'A' ],
        'unreadNotificationIds': [ 'X', 'Z', 'A' ]
      };
      var oldDoc = {
        '_id': 'biz.44.notifications',
        'allNotificationIds': [ 'X', 'Y', 'Z' ],
        'unreadNotificationIds': [ 'X', 'Z' ]
      };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(notificationsRefPrivilege, 44);
    });

    it('cannot replace a notifications reference document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.29.notifications',
        'allNotificationIds': [ 'X', 'Y', 'Z', '' ],
        'unreadNotificationIds': [ 'X', 'Z', 5 ]
      };
      var oldDoc = {
        '_id': 'biz.29.notifications',
        'allNotificationIds': [ 'X', 'Y', 'Z' ],
        'unreadNotificationIds': [ 'X', 'Z' ]
      };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notificationsReference document: item "allNotificationIds[3]" must not be empty; item "unreadNotificationIds[2]" must be a string' });
      });
      verifyDocumentNotReplaced(notificationsRefPrivilege, 29);
    });

    it('successfully deletes a valid notifications reference document', function() {
      var doc = { '_id': 'biz.369.notifications', '_deleted': true };
      var oldDoc = {
        '_id': 'biz.369.notifications',
        'allNotificationIds': [ 'X', 'Y', 'Z' ],
        'unreadNotificationIds': [ 'X', 'Z' ]
      };

      syncFunction(doc, oldDoc);

      verifyDocumentDeleted(notificationsRefPrivilege, 369);
    });
  });

  describe('business notifications config doc definition', function() {
    var notificationsConfigPrivilege = 'NOTIFICATIONS_CONFIG';

    it('successfully creates a valid notifications config document', function() {
      var doc = {
        '_id': 'biz.1248.notificationsConfig',
        'notificationTypes': {
          'invoicePayments': {
            'enabledTransports': [
              { 'transportId': 'ET1' },
              { 'transportId': 'ET2' }
            ]
          }
        }
      };

      syncFunction(doc, null);

      verifyDocumentCreated(notificationsConfigPrivilege, 1248);
    });

    it('cannot create a notifications config document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.72.notificationsConfig',
        'notificationTypes': {
          'invoicePayments': {
            'enabledTransports': [
              { 'invalid-property': 'blah' },
              { 'transportId': '' }
            ]
          },
          'Invalid-Type': {
            'enabledTransports': [ ]
          },
          '' : null
        },
        'unknownprop': 23
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notificationsConfig document: required item "notificationTypes[invoicePayments].enabledTransports[0].transportId" is missing; property "notificationTypes[invoicePayments].enabledTransports[0].invalid-property" is not supported; item "notificationTypes[invoicePayments].enabledTransports[1].transportId" must not be empty; hashtable key "notificationTypes[Invalid-Type]" does not conform to expected format /^[a-zA-Z]+$/; empty hashtable key in item "notificationTypes" is not allowed; hashtable key "notificationTypes[]" does not conform to expected format /^[a-zA-Z]+$/; required item "notificationTypes[]" is missing; property "unknownprop" is not supported' });
      });
      verifyDocumentNotCreated(notificationsConfigPrivilege, 72);
    });

    it('successfully replaces a valid notifications config document', function() {
      var doc = {
        '_id': 'biz.191.notificationsConfig',
        'notificationTypes': {
          'invoicePayments': {
            'enabledTransports': [
              { 'transportId': 'ET1' },
              { 'transportId': 'ET2' },
              { 'transportId': 'ET4' }
            ]
          }
        }
      };
      var oldDoc = {
        '_id': 'biz.191.notificationsConfig',
        'notificationTypes': {
          'invoicePayments': {
            'enabledTransports': [ ]
          }
        }
      };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(notificationsConfigPrivilege, 191);
    });

    it('cannot replace a notifications config document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.37.notificationsConfig',
        'notificationTypes': {
          'invoicePayments': {
            'enabledTransports': [
              { 'transportId': 'ET1' },
              { 'transportId': 'ET2', 'invalid-property': 73 },
              { 'transportId': 34 },
              null
            ]
          },
          'foobar': null
        }
      };
      var oldDoc = {
        '_id': 'biz.37.notificationsConfig',
        'notificationTypes': { }
      };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notificationsConfig document: property "notificationTypes[invoicePayments].enabledTransports[1].invalid-property" is not supported; item "notificationTypes[invoicePayments].enabledTransports[2].transportId" must be a string; required item "notificationTypes[invoicePayments].enabledTransports[3]" is missing; required item "notificationTypes[foobar]" is missing' });
      });
      verifyDocumentNotReplaced(notificationsConfigPrivilege, 37);
    });

    it('successfully deletes a valid notifications config document', function() {
      var doc = { '_id': 'biz.333.notificationsConfig', '_deleted': true };
      var oldDoc = {
        '_id': 'biz.333.notificationsConfig',
        'invoice-payments': {
          'enabledTransports': [ 'ET1', 'ET2' ],
          'disabledTransports': [ 'ET3' ]
        }
      };

      syncFunction(doc, oldDoc);

      verifyDocumentDeleted(notificationsConfigPrivilege, 333);
    });
  });

  describe('business notification transport doc definition', function() {
    var notificationTransportPrivilege = 'NOTIFICATIONS_CONFIG';

    it('successfully creates a valid notification transport document', function() {
      var doc = {
        '_id': 'biz.82.notificationTransport.ABC',
        'type': 'email',
        'recipient': 'foo.bar@example.com'
      };

      syncFunction(doc, null);

      verifyDocumentCreated(notificationTransportPrivilege, 82);
    });

    it('cannot create a notification transport document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.75.notificationTransport.ABC',
        'recipient': ''
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notificationTransport document: required item "type" is missing; item "recipient" must not be empty' });
      });
      verifyDocumentNotCreated(notificationTransportPrivilege, 75);
    });

    it('successfully replaces a valid notification transport document', function() {
      var doc = {
        '_id': 'biz.38.notificationTransport.ABC',
        'type': 'email',
        'recipient': 'different.foo.bar@example.com'
      };
      var oldDoc = {
        '_id': 'biz.38.notificationTransport.ABC',
        'type': 'email',
        'recipient': 'foo.bar@example.com'
      };
      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(notificationTransportPrivilege, 38);
    });

    it('cannot replace a notification transport document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.73.notificationTransport.ABC',
        'type': 23,
      };
      var oldDoc = {
        '_id': 'biz.73.notificationTransport.ABC',
        'type': 'email',
        'recipient': 'foo.bar@example.com'
      };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notificationTransport document: item "type" must be a string; required item "recipient" is missing' });
      });
      verifyDocumentNotReplaced(notificationTransportPrivilege, 73);
    });

    it('successfully deletes a valid notification transport document', function() {
      var doc = { '_id': 'biz.14.notificationTransport.ABC', '_deleted': true };
      var oldDoc = {
        '_id': 'biz.14.notificationTransport.ABC',
        'type': 'email',
        'recipient': 'different.foo.bar@example.com'
      };

      syncFunction(doc, oldDoc);

      verifyDocumentDeleted(notificationTransportPrivilege, 14);
    });
  });

  describe('notification transport processing summary doc definition', function() {
    function verifyProcessingSummaryWritten() {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.equal(serviceChannel);

      expect(channel.callCount).to.equal(1);
      expect(channel.calls[0].arg).to.have.length(1);
      expect(channel.calls[0].arg).to.contain(serviceChannel);
    }

    function verifyProcessingSummaryNotWritten() {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.equal(serviceChannel);

      expect(channel.callCount).to.equal(0);
    }

    it('successfully creates a valid notification transport processing summary document', function() {
      var doc = {
        '_id': 'biz.901.notification.ABC.processedTransport.XYZ',
        'processedAt': '2016-06-04T21:02:19.013Z',
        'processedBy': 'foobar',
        'sentAt': '2016-06-04T21:02:55.013Z'
      };

      syncFunction(doc, null);

      verifyProcessingSummaryWritten();
    });

    it('cannot create a notification transport processing summary document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.109.notification.ABC.processedTransport.XYZ',
        'processedBy': [ ],
        'sentAt': '2016-06-04T21:02:55.9999Z'  // too many digits in the millisecond segment
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notificationTransportProcessingSummary document: item "processedBy" must be a string; required item "processedAt" is missing; item "sentAt" must be an ISO 8601 date string with optional time and time zone components' });
      });
      verifyProcessingSummaryNotWritten();
    });

    it('successfully replaces a valid notification transport processing summary document', function() {
      var doc = {
        '_id': 'biz.119.notification.ABC.processedTransport.XYZ',
        'processedAt': '2016-06-04T21:02:19.013Z'
      };
      var oldDoc = {
        '_id': 'biz.119.notification.ABC.processedTransport.XYZ',
        'processedBy': null,
        'processedAt': '2016-06-04T21:02:19.013Z'
      };
      syncFunction(doc, oldDoc);

      verifyProcessingSummaryWritten();
    });

    it('cannot replace a notification transport processing summary document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.275.notification.ABC.processedTransport.XYZ',
        'processedAt': '2016-06-04T09:27:07.514Z',
        'sentAt': ''
      };
      var oldDoc = {
        '_id': 'biz.275.notification.ABC.processedTransport.XYZ',
        'processedBy': 'foobar',
        'processedAt': '2016-06-03T21:02:19.013Z',
      };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid notificationTransportProcessingSummary document: value of item "processedBy" may not be modified; value of item "processedAt" may not be modified; item "sentAt" must be an ISO 8601 date string with optional time and time zone components' });
      });
      verifyProcessingSummaryNotWritten();
    });

    it('successfully deletes a valid notification transport processing summary document', function() {
      var doc = { '_id': 'biz.317.notification.ABC.processedTransport.XYZ', '_deleted': true };
      var oldDoc = {
        '_id': 'biz.317.notification.ABC.processedTransport.XYZ',
        'processedBy': 'foobar',
        'processedAt': '2016-06-04T21:02:19.013Z'
      };

      syncFunction(doc, oldDoc);

      verifyProcessingSummaryWritten();
    });
  });
});

function verifyDocumentCreated(basePrivilegeName, businessId) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.have.length(2);
  expect(requireAccess.calls[0].arg).to.contain(businessId + '-ADD_' + basePrivilegeName);
  expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

  expect(channel.callCount).to.equal(1);
  expect(channel.calls[0].arg).to.have.length(5);
  expect(channel.calls[0].arg).to.contain(businessId + '-VIEW_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-ADD_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(serviceChannel);
}

function verifyDocumentReplaced(basePrivilegeName, businessId) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.have.length(2);
  expect(requireAccess.calls[0].arg).to.contain(businessId + '-CHANGE_' + basePrivilegeName);
  expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

  expect(channel.callCount).to.equal(1);
  expect(channel.calls[0].arg).to.have.length(5);
  expect(channel.calls[0].arg).to.contain(businessId + '-VIEW_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-ADD_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(serviceChannel);
}

function verifyDocumentDeleted(basePrivilegeName, businessId) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.have.length(2);
  expect(requireAccess.calls[0].arg).to.contain(businessId + '-REMOVE_' + basePrivilegeName);
  expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

  expect(channel.callCount).to.equal(1);
  expect(channel.calls[0].arg).to.have.length(5);
  expect(channel.calls[0].arg).to.contain(businessId + '-VIEW_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-ADD_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(serviceChannel);
}

function verifyDocumentNotCreated(basePrivilegeName, businessId) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.have.length(2);
  expect(requireAccess.calls[0].arg).to.contain(businessId + '-ADD_' + basePrivilegeName);
  expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

  expect(channel.callCount).to.equal(0);
}

function verifyDocumentNotReplaced(basePrivilegeName, businessId) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.have.length(2);
  expect(requireAccess.calls[0].arg).to.contain(businessId + '-CHANGE_' + basePrivilegeName);
  expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

  expect(channel.callCount).to.equal(0);
}

function verifyDocumentNotDeleted(basePrivilegeName, businessId) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.have.length(2);
  expect(requireAccess.calls[0].arg).to.contain(businessId + '-REMOVE_' + basePrivilegeName);
  expect(requireAccess.calls[0].arg).to.contain(serviceChannel);

  expect(channel.callCount).to.equal(0);
}

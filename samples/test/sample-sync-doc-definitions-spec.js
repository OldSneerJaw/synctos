var expect = require('expect.js');
var simple = require('simple-mock');
var fs = require('fs');

// Load the contents of the sync function file into a global variable called syncFunction
eval('var syncFunction = ' + fs.readFileSync('target/sample-sync-function.js').toString());

var staffChannel = 'STAFF';

// Placeholders for stubbing built-in Sync Gateway support functions.
// More info: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
var requireAccess;
var channel;

describe('The business-sync function', function() {

  beforeEach(function() {
    requireAccess = simple.stub();
    channel = simple.stub();
  });

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


  describe('business config handler', function() {
    var verifyBusinessCreated = function(businessId) {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.have.length(2);
      expect(requireAccess.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(requireAccess.calls[0].arg).to.contain(staffChannel);

      expect(channel.callCount).to.equal(1);
      expect(channel.calls[0].arg).to.have.length(4);
      expect(channel.calls[0].arg).to.contain(businessId + '-VIEW');
      expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(staffChannel);
    };

    var verifyBusinessReplaced = function(businessId) {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.have.length(2);
      expect(requireAccess.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(requireAccess.calls[0].arg).to.contain(staffChannel);

      expect(channel.callCount).to.equal(1);
      expect(channel.calls[0].arg).to.have.length(4);
      expect(channel.calls[0].arg).to.contain(businessId + '-VIEW');
      expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(staffChannel);
    };

    var verifyBusinessDeleted = function(businessId) {
      expect(requireAccess.callCount).to.equal(1);
      expect(requireAccess.calls[0].arg).to.have.length(2);
      expect(requireAccess.calls[0].arg).to.contain(businessId + '-REMOVE_BUSINESS');
      expect(requireAccess.calls[0].arg).to.contain(staffChannel);

      expect(channel.callCount).to.equal(1);
      expect(channel.calls[0].arg).to.have.length(4);
      expect(channel.calls[0].arg).to.contain(businessId + '-VIEW');
      expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_BUSINESS');
      expect(channel.calls[0].arg).to.contain(staffChannel);
    };

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

    it('cannot create a document for a user without permission', function() {
      var doc = { '_id': 'biz.1', 'defaultInvoiceTemplate': { 'templateId': 'teapot' } };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '1-CHANGE_BUSINESS', staffChannel ]);
    });

    it('cannot create a business document with invalid properties', function() {
      var doc = {
        '_id': 'biz.5',
        'businessLogoAttachment': 'bogus.mp3',
        'defaultInvoiceTemplate': { 'templateId': '', 'some-unrecognized-property': 'baz' },
        'paymentProcessors': 0,
        'unrecognized-property1': 'foo'
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid business document: attachment property "businessLogoAttachment" must have a supported file extension (png,gif,jpg,jpeg); property "defaultInvoiceTemplate.templateId" must not be empty; property "defaultInvoiceTemplate.some-unrecognized-property" is not supported; property "paymentProcessors" must be an array; property "unrecognized-property1" is not supported' });
      });
    });

    it('successfully replaces a valid document', function() {
      var doc = { '_id': 'biz.5', 'paymentProcessors': [ 'foo', 'bar' ], 'businessLogoAttachment': 'foobar.png' };
      var oldDoc = { '_id': 'biz.5' };

      syncFunction(doc, oldDoc);

      verifyBusinessReplaced(5);
    });

    it('cannot replace a document for a user without permission', function() {
      var doc = { '_id': 'biz.1', 'businessLogoAttachment': 'logo.jpg' };
      var oldDoc = { '_id': 'biz.1' };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '1-CHANGE_BUSINESS', staffChannel ]);
    });

    it('cannot replace a business document with invalid properties', function() {
      var doc = {
        '_id': 'biz.5',
        '_attachments': {
          'bogus.png': {
            'content_type': 'text/plain',
            'length': 2097153
          }
        },
        'businessLogoAttachment': 'bogus.png',
        'defaultInvoiceTemplate': { 'templateId': 6 },
        'paymentProcessors': [ 'foo', 8 ],
        'unrecognized-property2': 'bar'
      };
      var oldDoc = { '_id': 'biz.5' };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid business document: attachment property "businessLogoAttachment" must have a supported content type (image/png,image/gif,image/jpeg); attachment property "businessLogoAttachment" must not be larger than 2097152 bytes; property "defaultInvoiceTemplate.templateId" must be a string; property "paymentProcessors[1]" must be a string; property "unrecognized-property2" is not supported' });
      });
    });

    it('successfully deletes a valid document', function() {
      var doc = { '_id': 'biz.8', '_deleted': true };

      syncFunction(doc, null);

      verifyBusinessDeleted(8);
    });

    it('cannot delete a document for a user without permission', function() {
      var doc = { '_id': 'biz.9', '_deleted': true };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '9-REMOVE_BUSINESS', staffChannel ]);
    });
  });

  describe('invoice payment processing result handler', function() {
    var expectedBasePrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

    it('successfully creates a valid document', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        'businessId': 20,
        'invoiceRecordId': 10,
        'paymentRequisitionId': 'my-payment-requisition',
        'paymentAttemptSpreedlyToken': 'my-spreedly-token',
        'date': '2016-02-29T17:13:43+10:30',
        'internalPaymentRecordId': 30,
        'gatewayTransactionId': 'my-gateway-transaction',
        'gatewayMessage': 'my-gateway-message',
        'totalAmountPaid': 72838,
        'totalAmountPaidFormatted': '$728.38'
      };

      syncFunction(doc, null);

      verifyDocumentCreated(expectedBasePrivilege, 20);
    });

    it('cannot create a document with invalid properties', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        'businessId': 'my-business',
        'invoiceRecordId': 0,
        'paymentRequisitionId': '',
        'paymentAttemptSpreedlyToken': '',
        'date': '2016-01-30T17:13:43.666-24:00', // The time zone is invalid
        'internalPaymentRecordId': 0,
        'gatewayTransactionId': '',
        'gatewayMessage': 17,
        'totalAmountPaid': 'invalid',
        'totalAmountPaidFormatted': 999,
        'unsupportedProperty': 'foobar'
      };

      expect(syncFunction).withArgs(doc, null).to.throwException(function(ex) {
        expect(ex).to.eql({
          forbidden: 'Invalid paymentAttempt document: malformed "businessId" property; property "invoiceRecordId" must not be less than 1; property "paymentRequisitionId" must not be empty; property "paymentAttemptSpreedlyToken" must not be empty; property "date" must be an ISO 8601 date string; property "internalPaymentRecordId" must not be less than 1; property "gatewayTransactionId" must not be empty; property "gatewayMessage" must be a string; property "totalAmountPaid" must be an integer; property "totalAmountPaidFormatted" must be a string; property "unsupportedProperty" is not supported'
        });
      });
    });

    it('cannot create a document for a user without permission', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        'businessId': 20,
        'invoiceRecordId': 10,
        'paymentRequisitionId': 'my-payment-requisition',
        'paymentAttemptSpreedlyToken': 'my-spreedly-token',
        'date': '2016-02-29T17:13:43+10:30'
      };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, null).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '20-ADD_' + expectedBasePrivilege, staffChannel ]);
    });

    it('successfully replaces a valid document', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        'businessId': 20,
        'invoiceRecordId': 6,
        'paymentRequisitionId': 'my-payment-requisition2',
        'paymentAttemptSpreedlyToken': 'my-spreedly-token2',
        'date': '2016-12-31T17:13:43.666-06:00'
      };
      var oldDoc = { '_id': 'paymentAttempt.foo-bar', 'businessId': 20 };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(expectedBasePrivilege, 20);
    });

    it('cannot replace a document when the properties are invalid', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        'businessId': 66,
        'gatewayTransactionId': 7,
        'gatewayMessage': true,
        'totalAmountPaid': 0,
        'totalAmountPaidFormatted': '',
        'unsupportedProperty': 'foobar'
      };
      var oldDoc = { '_id': 'paymentAttempt.foo-bar', 'businessId': 20 };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({
          forbidden: 'Invalid paymentAttempt document: cannot change "businessId" property; required property "invoiceRecordId" is missing; required property "paymentRequisitionId" is missing; required property "paymentAttemptSpreedlyToken" is missing; required property "date" is missing; property "gatewayTransactionId" must be a string; property "gatewayMessage" must be a string; property "totalAmountPaid" must not be less than 1; property "totalAmountPaidFormatted" must not be empty; property "unsupportedProperty" is not supported'
        });
      });
    });

    it('cannot replace a document for a user without permission', function() {
      var doc = {
        '_id': 'paymentAttempt.foo-bar',
        'businessId': 20,
        'invoiceRecordId': 10,
        'paymentRequisitionId': 'my-payment-requisition',
        'paymentAttemptSpreedlyToken': 'my-spreedly-token',
        'date': '2016-03-15T23:56:43Z'
      };
      var oldDoc = { '_id': 'paymentAttempt.foo-bar', 'businessId': 20 };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '20-CHANGE_' + expectedBasePrivilege, staffChannel ]);
    });

    it('successfully deletes a valid document', function() {
      var doc = { '_id': 'paymentAttempt.foo-bar', '_deleted': true };
      var oldDoc = { '_id': 'paymentAttempt.foo-bar', 'businessId': 20 };

      syncFunction(doc, oldDoc);

      verifyDocumentDeleted(expectedBasePrivilege, 20);
    });

    it('cannot delete a document for a user without permission', function() {
      var doc = { '_id': 'paymentAttempt.foo-bar', '_deleted': true };
      var oldDoc = { '_id': 'paymentAttempt.foo-bar', 'businessId': 20 };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '20-REMOVE_' + expectedBasePrivilege, staffChannel ]);
    });
  });

  describe('payment processor definition handler', function() {
    var paymentProcessorPrivilege = 'CUSTOMER_PAYMENT_PROCESSORS';

    it('successfully creates a valid document', function() {
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

    it('cannot create a document with invalid properties', function() {
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
        expect(ex).to.eql({ forbidden: 'Invalid paymentProcessorDefinition document: property "provider" must not be empty; property "spreedlyGatewayToken" must not be empty; property "accountId" must not be less than 1; property "displayName" must be a string; property "supportedCurrencyCodes" must be an array; property "unrecognized-property3" is not supported' });
      });
    });

    it('cannot create a document for a user without permission', function() {
      var doc = { '_id': 'biz.1.paymentProcessor.2', 'provider': 'foo', 'spreedlyGatewayToken': 'bar', 'accountId': 555 };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '1-ADD_' + paymentProcessorPrivilege, staffChannel ]);
    });

    it('successfully replaces a valid document', function() {
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

    it('cannot replace a document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.1.paymentProcessor.2',
        'accountId': 555.9,
        'displayName': [ ],
        'supportedCurrencyCodes': [ '666', 'CAD' ],
        'unrecognized-property4': 'bar'
      };
      var oldDoc = { '_id': 'biz.1.paymentProcessor.2', 'provider': 'foo' };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid paymentProcessorDefinition document: required property "provider" is missing; required property "spreedlyGatewayToken" is missing; property "accountId" must be an integer; property "displayName" must be a string; property "supportedCurrencyCodes[0]" must conform to expected format; property "unrecognized-property4" is not supported' });
      });
    });

    it('cannot replace a document for a user without permission', function() {
      var doc = {
        '_id': 'biz.1.paymentProcessor.2',
        'provider': 'foo',
        'spreedlyGatewayToken': 'bar',
        'accountId': 555,
        'displayName': 'Foo Bar',
        'supportedCurrencyCodes': [ 'CAD', 'USD' ]
      };
      var oldDoc = { '_id': 'biz.1.paymentProcessor.2', 'provider': 'bar' };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '1-CHANGE_' + paymentProcessorPrivilege, staffChannel ]);
    });

    it('successfully deletes a valid document', function() {
      var doc = { '_id': 'biz.8.paymentProcessor.2', '_deleted': true };

      syncFunction(doc, null);

      verifyDocumentDeleted(paymentProcessorPrivilege, 8);
    });

    it('cannot delete a document for a user without permission', function() {
      var doc = { '_id': 'biz.1.paymentProcessor.2', '_deleted': true };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '1-REMOVE_' + paymentProcessorPrivilege, staffChannel ]);
    });
  });

  describe('payment requisitions reference handler', function() {
    var expectedBasePrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

    it('successfully creates a valid document', function() {
      var doc = { '_id': 'biz.3.invoice.15.paymentRequisitions', 'paymentProcessorId': 'foo', 'paymentRequisitionIds': [ 'req1', 'req2' ] };

      syncFunction(doc, null);

      verifyDocumentCreated(expectedBasePrivilege, 3);
    });

    it('cannot create a document with invalid properties', function() {
      var doc = {
        '_id': 'biz.5.invoice.7.paymentRequisitions',
        'paymentRequisitionIds': [ ],
        'unrecognized-property5': 'foo',
        'paymentAttemptIds': 79
      };

      expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid paymentRequisitionsReference document: required property "paymentProcessorId" is missing; property "paymentRequisitionIds" must not be empty; property "paymentAttemptIds" must be an array; property "unrecognized-property5" is not supported' });
      });
    });

    it('cannot create a document for a user without permission', function() {
      var doc = { '_id': 'biz.92.invoice.63.paymentRequisitions', 'paymentProcessorId': 'foo', 'paymentRequisitionIds': [ 'req1' ] };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '92-ADD_' + expectedBasePrivilege, staffChannel ]);
    });

    it('successfully replaces a valid document', function() {
      var doc = { '_id': 'biz.3612.invoice.222.paymentRequisitions', 'paymentProcessorId': 'bar', 'paymentRequisitionIds': [ 'req2' ] };
      var oldDoc = { '_id': 'biz.3612.invoice.222.paymentRequisitions', 'paymentProcessorId': 'foo', 'paymentRequisitionIds': [ 'req1' ] };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(expectedBasePrivilege, 3612);
    });

    it('cannot replace a document when the properties are invalid', function() {
      var doc = {
        '_id': 'biz.666.invoice.3.paymentRequisitions',
        'paymentProcessorId': '',
        'paymentRequisitionIds': [ 'foo', 15 ],
        'unrecognized-property6': 'bar',
        'paymentAttemptIds': [ 73, 'bar' ]
      };
      var oldDoc = { '_id': 'biz.666.invoice.3.paymentRequisitions', 'paymentProcessorId': 'foo', 'paymentRequisitionIds': [ 'req1' ] };

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
        expect(ex).to.eql({ forbidden: 'Invalid paymentRequisitionsReference document: property "paymentProcessorId" must not be empty; property "paymentRequisitionIds[1]" must be a string; property "paymentAttemptIds[0]" must be a string; property "unrecognized-property6" is not supported' });
      });
    });

    it('cannot replace a document for a user without permission', function() {
      var doc = { '_id': 'biz.87.invoice.123.paymentRequisitions', 'paymentProcessorId': 'bar' };
      var oldDoc = { '_id': 'biz.87.invoice.123.paymentRequisitions', 'paymentProcessorId': 'foo' };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '87-CHANGE_' + expectedBasePrivilege, staffChannel ]);
    });

    it('successfully deletes a valid document', function() {
      var doc = { '_id': 'biz.1.invoice.2.paymentRequisitions', '_deleted': true };

      syncFunction(doc, null);

      verifyDocumentDeleted(expectedBasePrivilege, 1);
    });

    it('cannot delete a document for a user without permission', function() {
      var doc = { '_id': 'biz.3.invoice.2.paymentRequisitions', '_deleted': true };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '3-REMOVE_' + expectedBasePrivilege, staffChannel ]);
    });
  });

  describe('invoice payment requisition handler', function() {
    var paymentRequisitionPrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

    it('successfully creates a valid document', function() {
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

    it('cannot create a document with invalid properties', function() {
      var doc = {
        '_id': 'paymentRequisition.foo-bar',
        'invoiceRecordId': 0,
        'businessId': '5',
        'issuedAt': '2016-13-29T17:13:43.666Z', // The month is invalid
        'issuedByUserId': 0,
        'invoiceRecipients': [ 'foo@bar.baz' ],
        'unrecognized-property7': 'foo'
      };

      expect(syncFunction).withArgs(doc, null).to.throwException(function(ex) {
        expect(ex).to.eql(
          {
            forbidden: 'Invalid paymentRequisition document: property "invoiceRecordId" must not be less than 1; malformed "businessId" property; property "issuedAt" must be an ISO 8601 date string; property "issuedByUserId" must not be less than 1; property "invoiceRecipients" must be a string; property "unrecognized-property7" is not supported'
          });
      });
    });

    it('cannot create a document for a user without permission', function() {
      var doc = { '_id': 'paymentRequisition.foo-bar', 'invoiceRecordId': 10, 'businessId': 20 };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, null).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '20-ADD_' + paymentRequisitionPrivilege, staffChannel ]);
    });

    it('successfully replaces a valid document', function() {
      var doc = { '_id': 'paymentRequisition.foo-bar', 'invoiceRecordId': 90, 'businessId': 20 };
      var oldDoc = {
        '_id': 'paymentRequisition.foo-bar',
        'invoiceRecordId': 10,
        'businessId': 20,
        'issuedAt': '2016-02-29T17:13:43.666Z',
        'issuedByUserId': 42,
        'invoiceRecipients': 'foo@bar.baz'
      };

      syncFunction(doc, oldDoc);

      verifyDocumentReplaced(paymentRequisitionPrivilege, 20);
    });

    it('cannot replace a document when the properties are invalid', function() {
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
            forbidden: 'Invalid paymentRequisition document: property "invoiceRecordId" must be an integer; malformed "businessId" property; cannot change "businessId" property; property "issuedAt" must be an ISO 8601 date string; property "issuedByUserId" must be an integer; property "invoiceRecipients" must be a string; property "unrecognized-property8" is not supported'
          });
      });
    });

    it('cannot replace a document for a user without permission', function() {
      var doc = { '_id': 'paymentRequisition.foo-bar', 'invoiceRecordId': 5, 'businessId': 17 };
      var oldDoc = { '_id': 'paymentRequisition.foo-bar', 'invoiceRecordId': 10, 'businessId': 20 };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '20-CHANGE_' + paymentRequisitionPrivilege, staffChannel ]);
    });

    it('successfully deletes a valid document', function() {
      var doc = { '_id': 'paymentRequisition.foo-bar', '_deleted': true };
      var oldDoc = { '_id': 'paymentRequisition.foo-bar', 'invoiceRecordId': 10, 'businessId': 20 };

      syncFunction(doc, oldDoc);

      verifyDocumentDeleted(paymentRequisitionPrivilege, 20);
    });

    it('cannot delete a document for a user without permission', function() {
      var doc = { '_id': 'paymentRequisition.foo-bar', '_deleted': true };
      var oldDoc = { '_id': 'paymentRequisition.foo-bar', 'invoiceRecordId': 10, 'businessId': 20 };
      var expectedError = new Error();

      requireAccess = simple.stub().throwWith(expectedError);

      expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
      expect(requireAccess.calls[0].arg).to.eql([ '20-REMOVE_' + paymentRequisitionPrivilege, staffChannel ]);
    });
  });

  describe('business notification handler', function() {
      var notificationsPrivilege = 'NOTIFICATIONS';

      it('successfully creates a valid document', function() {
        var doc = {
          '_id': 'biz.3.notification.5',
          'sender': 'test-service',
          'subject': 'pay up!',
          'message': 'you best pay up now, or else...',
          'createdAt': '2016-02-29T17:13:43.666Z',
          'actions': [ { 'url': 'http://foobar.baz', 'label': 'pay up here'} ]
        };

        syncFunction(doc, null);

        verifyDocumentCreated(notificationsPrivilege, 3);
      });

      it('cannot create a document with invalid properties', function() {

        var doc = {
          '_id': 'biz.3.notification.5',
          'subject': '', // missing sender, empty subject
          'whatsthis?': 'something I dont recognize!', // unrecognized property
          'createdAt': '2016-02-29T25:13:43.666Z', // invalid hour
          'actions': [ { 'url': 24 } ] // integer url, non-existent label
        };

        expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
          expect(ex).to.eql({ forbidden: 'Invalid notification document: required property "sender" is missing; property "subject" must not be empty; required property "message" is missing; property "createdAt" must be an ISO 8601 date string; property "actions[0].url" must be a string; required property "actions[0].label" is missing; property "whatsthis?" is not supported' });
        });
      });

      it('cannot create a document for a user without permission', function() {
        var doc = {
          '_id': 'biz.3.notification.3',
          'sender': 'test-service',
          'subject': 'pay up!',
          'message': 'you best pay up now, or else...',
          'createdAt': '2016-02-29T17:13:43.666Z',
          'actions': [ { 'url': 'http://foobar.baz', 'label': 'pay up here'} ]
        };
        var expectedError = new Error();

        requireAccess = simple.stub().throwWith(expectedError);

        expect(syncFunction).withArgs(doc).to.throwException(expectedError);
        expect(requireAccess.calls[0].arg).to.eql([ '3-ADD_' + notificationsPrivilege, staffChannel ]);
      });

      it('successfully replaces a valid document', function() {
        var doc = {
          '_id': 'biz.3.notification.3',
          'sender': 'test-service',
          'subject': 'a different subject',
          'message': 'last warning!',
          'createdAt': '2016-02-29T17:13:43.666Z',
          'actions': [ { 'url': 'http://foobar.baz/lastwarning', 'label': 'pay up here'} ]
        };
        var oldDoc = {
          '_id': 'biz.3.notification.3',
          'sender': 'test-service',
          'subject': 'pay up!',
          'message': 'you best pay up now, or else...',
          'createdAt': '2016-02-29T17:13:43.666Z',
          'actions': [ { 'url': 'http://foobar.baz', 'label': 'pay up here'} ]
        };

        syncFunction(doc, oldDoc);

        verifyDocumentReplaced(notificationsPrivilege, 3);
      });

      it('cannot replace a document when the properties are invalid', function() {
        var doc = {
          '_id': 'biz.3.notification.3',
          'sender': '', // empty sender
          'message': '', // missing subject, empty message
          'createdAt': '2016-04-29T17:13:43.666Z', // changed createdAt
          'actions': [ { 'label': ''} ]
        };
        var oldDoc = { // valid oldDoc
          '_id': 'biz.3.notification.3',
          'sender': 'test-service',
          'subject': 'a different subject',
          'message': 'last warning!',
          'createdAt': '2016-02-29T17:13:43.666Z',
          'actions': [ { 'url': 'http://foobar.baz/lastwarning', 'label': 'pay up here'} ]
        };

        expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
          expect(ex).to.eql({ forbidden: 'Invalid notification document: property "sender" must not be empty; required property "subject" is missing; property "message" must not be empty; property "createdAt" may not be updated; required property "actions[0].url" is missing; property "actions[0].label" must not be empty' });
        });
      });

      it('cannot replace a document for a user without permission', function() {
        var doc = {
          '_id': 'biz.3.notification.3',
          'sender': 'test-service',
          'subject': 'a different subject',
          'message': 'last warning!',
          'createdAt': '2016-02-29T17:13:43.666Z',
          'actions': [ { 'url': 'http://foobar.baz/lastwarning', 'label': 'pay up here'} ]
        };
        var oldDoc = {
          '_id': 'biz.3.notification.3',
          'sender': 'test-service',
          'subject': 'pay up!',
          'message': 'you best pay up now, or else...',
          'createdAt': '2016-02-29T17:13:43.666Z',
          'actions': [ { 'url': 'http://foobar.baz', 'label': 'pay up here'} ]
        };
        var expectedError = new Error();

        requireAccess = simple.stub().throwWith(expectedError);

        expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
        expect(requireAccess.calls[0].arg).to.eql([ '3-CHANGE_' + notificationsPrivilege, staffChannel ]);
      });

      it('successfully deletes a valid document', function() {
        var doc = { '_id': 'biz.3.notification.5', '_deleted': true };
        var oldDoc = {
          '_id': 'biz.3.notification.5',
          'sender': 'test-service',
          'subject': 'pay up!',
          'message': 'you best pay up now, or else...',
          'createdAt': '2016-02-29T17:13:43.666Z',
          'actions': [ { 'url': 'http://foobar.baz', 'label': 'pay up here'} ]
        };

        syncFunction(doc, oldDoc);

        verifyDocumentDeleted(notificationsPrivilege, 3);
      });

      it('cannot delete a document for a user without permission', function() {
        var doc = { '_id': 'biz.3.notification.5', '_deleted': true };
        var oldDoc = {
          '_id': 'biz.3.notification.5',
          'sender': 'test-service',
          'subject': 'pay up!',
          'message': 'you best pay up now, or else...',
          'createdAt': '2016-02-29T17:13:43.666Z',
          'actions': [ { 'url': 'http://foobar.baz', 'label': 'pay up here'} ]
        };
        var expectedError = new Error();

        requireAccess = simple.stub().throwWith(expectedError);

        expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
        expect(requireAccess.calls[0].arg).to.eql([ '3-REMOVE_' + notificationsPrivilege, staffChannel ]);
      });
    });

    describe('business notifications reference handler', function() {
      var notificationsRefPrivilege = 'NOTIFICATIONS';

      it('successfully creates a valid document', function() {
        var doc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z' ],
          'unreadNotificationIds': [ 'X', 'Z' ]
        };

        syncFunction(doc, null);

        verifyDocumentCreated(notificationsRefPrivilege, 3);
      });

      it('cannot create a document with invalid properties', function() {
        var doc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 23, 'Y', 'Z' ],
          'unreadNotificationIds': [ 'Z', '' ]
        };

        expect(syncFunction).withArgs(doc).to.throwException(function(ex) {
          expect(ex).to.eql({ forbidden: 'Invalid notificationsReference document: property "allNotificationIds[0]" must be a string; property "unreadNotificationIds[1]" must not be empty' });
        });
      });

      it('cannot create a document for a user without permission', function() {
        var doc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z' ],
          'unreadNotificationIds': [ 'X', 'Z' ]
        };
        var expectedError = new Error();

        requireAccess = simple.stub().throwWith(expectedError);

        expect(syncFunction).withArgs(doc).to.throwException(expectedError);
        expect(requireAccess.calls[0].arg).to.eql([ '3-ADD_' + notificationsRefPrivilege, staffChannel ]);
      });

      it('successfully replaces a valid document', function() {
        var doc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z', 'A' ],
          'unreadNotificationIds': [ 'X', 'Z', 'A' ]
        };
        var oldDoc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z' ],
          'unreadNotificationIds': [ 'X', 'Z' ]
        };

        syncFunction(doc, oldDoc);

        verifyDocumentReplaced(notificationsRefPrivilege, 3);
      });

      it('cannot replace a document when the properties are invalid', function() {
        var doc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z', '' ],
          'unreadNotificationIds': [ 'X', 'Z', 5 ]
        };
        var oldDoc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z' ],
          'unreadNotificationIds': [ 'X', 'Z' ]
        };

        expect(syncFunction).withArgs(doc, oldDoc).to.throwException(function(ex) {
          expect(ex).to.eql({ forbidden: 'Invalid notificationsReference document: property "allNotificationIds[3]" must not be empty; property "unreadNotificationIds[2]" must be a string' });
        });
      });

      it('cannot replace a document for a user without permission', function() {
        var doc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z', 'A' ],
          'unreadNotificationIds': [ 'X', 'Z', 'Y' ]
        };
        var oldDoc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z' ],
          'unreadNotificationIds': [ 'X', 'Z' ]
        };
        var expectedError = new Error();

        requireAccess = simple.stub().throwWith(expectedError);

        expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
        expect(requireAccess.calls[0].arg).to.eql([ '3-CHANGE_' + notificationsRefPrivilege, staffChannel ]);
      });

      it('successfully deletes a valid document', function() {
        var doc = { '_id': 'biz.3.notifications', '_deleted': true };
        var oldDoc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z' ],
          'unreadNotificationIds': [ 'X', 'Z' ]
        };

        syncFunction(doc, oldDoc);

        verifyDocumentDeleted(notificationsRefPrivilege, 3);
      });

      it('cannot delete a document for a user without permission', function() {
        var doc = { '_id': 'biz.3.notifications', '_deleted': true };
        var oldDoc = {
          '_id': 'biz.3.notifications',
          'allNotificationIds': [ 'X', 'Y', 'Z' ],
          'unreadNotificationIds': [ 'X', 'Z' ]
        };
        var expectedError = new Error();

        requireAccess = simple.stub().throwWith(expectedError);

        expect(syncFunction).withArgs(doc, oldDoc).to.throwException(expectedError);
        expect(requireAccess.calls[0].arg).to.eql([ '3-REMOVE_' + notificationsRefPrivilege, staffChannel ]);
      });
    });

});

var verifyDocumentCreated = function(basePrivilegeName, businessId) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.have.length(2);
  expect(requireAccess.calls[0].arg).to.contain(businessId + '-ADD_' + basePrivilegeName);
  expect(requireAccess.calls[0].arg).to.contain(staffChannel);

  expect(channel.callCount).to.equal(1);
  expect(channel.calls[0].arg).to.have.length(5);
  expect(channel.calls[0].arg).to.contain(businessId + '-VIEW_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-ADD_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(staffChannel);
};

var verifyDocumentReplaced = function(basePrivilegeName, businessId) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.have.length(2);
  expect(requireAccess.calls[0].arg).to.contain(businessId + '-CHANGE_' + basePrivilegeName);
  expect(requireAccess.calls[0].arg).to.contain(staffChannel);

  expect(channel.callCount).to.equal(1);
  expect(channel.calls[0].arg).to.have.length(5);
  expect(channel.calls[0].arg).to.contain(businessId + '-VIEW_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-ADD_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(staffChannel);
};

var verifyDocumentDeleted = function(basePrivilegeName, businessId) {
  expect(requireAccess.callCount).to.equal(1);
  expect(requireAccess.calls[0].arg).to.have.length(2);
  expect(requireAccess.calls[0].arg).to.contain(businessId + '-REMOVE_' + basePrivilegeName);
  expect(requireAccess.calls[0].arg).to.contain(staffChannel);

  expect(channel.callCount).to.equal(1);
  expect(channel.calls[0].arg).to.have.length(5);
  expect(channel.calls[0].arg).to.contain(businessId + '-VIEW_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-ADD_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-CHANGE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(businessId + '-REMOVE_' + basePrivilegeName);
  expect(channel.calls[0].arg).to.contain(staffChannel);
};

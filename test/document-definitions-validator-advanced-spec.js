var expect = require('expect.js');
var docDefinitionsValidator = require('../src/document-definitions-validator.js');

describe('Document definitions validator:', function() {
  var testDocDefinitions;

  beforeEach(function() {
    // By default these document definitions are valid
    testDocDefinitions = {
      myDoc1: {
        typeFilter: function() { },
        channels: {
          view: 'view',
          add: 'add',
          replace: 'replace',
          remove: 'remove'
        },
        propertyValidators: { },
        allowUnknownProperties: false,
        immutable: true,
        cannotReplace: false,
        cannotDelete: false,
        allowAttachments: true,
        attachmentConstraints: {
          maximumAttachmentCount: 1,
          maximumIndividualSize: 256,
          maximumTotalSize: 256,
          supportedExtensions: [ 'txt' ],
          supportedContentTypes: [ 'text/plain' ],
          requireAttachmentReferences: true
        },
        accessAssignments: [
          {
            type: 'role',
            roles: 'role1',
            users: 'user1'
          },
          {
            type: 'channel',
            channels: 'channel1',
            roles: 'role2',
            users: 'user2'
          }
        ],
        customActions: {
          onTypeIdentificationSucceeded: function() { },
          onAuthorizationSucceeded: function() { },
          onValidationSucceeded: function() { },
          onAccessAssignmentsSucceeded: function() { },
          onDocumentChannelAssignmentSucceeded: function() { }
        }
      },
      myDoc2: {
        typeFilter: function() { },
        authorizedRoles: function() { },
        propertyValidators: function() { },
        allowUnknownProperties: function() { },
        immutable: function() { },
        cannotReplace: function() { },
        cannotDelete: function() { },
        allowAttachments: function() { },
        attachmentConstraints: function() { },
        accessAssignments: [
          {
            type: 'role',
            roles: function() { },
            users: function() { }
          },
          {
            // The absence of the "type" property indicates it is the channel assignment type
            channels: function() { },
            roles: function() { },
            users: function() { }
          }
        ]
      },
      myDoc3: {
        typeFilter: function() { },
        authorizedUsers: { write: [ 'write' ] },
        propertyValidators: { },
        immutable: false,
        cannotReplace: true,
        cannotDelete: true
      }
    };
  });

  it('approves valid document definitions as an object', function() {
    var results = docDefinitionsValidator.validate(testDocDefinitions);

    expect(results).to.eql({
      myDoc1: [ ],
      myDoc2: [ ],
      myDoc3: [ ]
    });
  });

  it('approves valid document definitions as a function', function() {
    var results = docDefinitionsValidator.validate(function() { return testDocDefinitions; });

    expect(results).to.eql({
      myDoc1: [ ],
      myDoc2: [ ],
      myDoc3: [ ]
    });
  });

  it('rejects an allowUnknownProperties constraint that is not a boolean or a function', function() {
    testDocDefinitions.myDoc1.allowUnknownProperties = { };
    testDocDefinitions.myDoc2.allowUnknownProperties = 0;
    testDocDefinitions.myDoc3.allowUnknownProperties = '';

    var results = docDefinitionsValidator.validate(testDocDefinitions);

    expect(results).to.eql({
      myDoc1: [ 'the "allowUnknownProperties" property is not a boolean or a function' ],
      myDoc2: [ 'the "allowUnknownProperties" property is not a boolean or a function' ],
      myDoc3: [ 'the "allowUnknownProperties" property is not a boolean or a function' ]
    });
  });

  describe('immutable constraint', function() {
    it('cannot be anything other than a boolean or a function', function() {
      testDocDefinitions.myDoc1.immutable = { };
      testDocDefinitions.myDoc2.immutable = 0;
      testDocDefinitions.myDoc3.immutable = '';

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "immutable" property is not a boolean or a function' ],
        myDoc2: [ 'the "immutable" property is not a boolean or a function' ],
        myDoc3: [ 'the "immutable" property is not a boolean or a function' ]
      });
    });

    it('cannot be enabled along with the cannotReplace constraint', function() {
      testDocDefinitions.myDoc1.immutable = true;
      testDocDefinitions.myDoc1.cannotReplace = true;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "immutable" property should not be enabled when either "cannotReplace" or "cannotDelete" are also enabled' ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });

    it('cannot be enabled along with the cannotDelete constraint', function() {
      testDocDefinitions.myDoc1.immutable = true;
      testDocDefinitions.myDoc1.cannotDelete = true;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "immutable" property should not be enabled when either "cannotReplace" or "cannotDelete" are also enabled' ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });
  });

  it('rejects a cannotReplace property that is not a boolean or a function', function() {
    testDocDefinitions.myDoc1.cannotReplace = { };
    testDocDefinitions.myDoc2.cannotReplace = 1;
    testDocDefinitions.myDoc3.cannotReplace = 'true';

    var results = docDefinitionsValidator.validate(testDocDefinitions);

    expect(results).to.eql({
      myDoc1: [ 'the "cannotReplace" property is not a boolean or a function' ],
      myDoc2: [ 'the "cannotReplace" property is not a boolean or a function' ],
      myDoc3: [ 'the "cannotReplace" property is not a boolean or a function' ]
    });
  });

  it('rejects a cannotDelete property that is not a boolean or a function', function() {
    testDocDefinitions.myDoc1.cannotDelete = { };
    testDocDefinitions.myDoc2.cannotDelete = 1;
    testDocDefinitions.myDoc3.cannotDelete = 'true';

    var results = docDefinitionsValidator.validate(testDocDefinitions);

    expect(results).to.eql({
      myDoc1: [ 'the "cannotDelete" property is not a boolean or a function' ],
      myDoc2: [ 'the "cannotDelete" property is not a boolean or a function' ],
      myDoc3: [ 'the "cannotDelete" property is not a boolean or a function' ]
    });
  });

  it('rejects an allowAttachments property that is not a boolean or a function', function() {
    testDocDefinitions.myDoc1.allowAttachments = { };
    testDocDefinitions.myDoc2.allowAttachments = 1;
    testDocDefinitions.myDoc3.allowAttachments = 'true';

    var results = docDefinitionsValidator.validate(testDocDefinitions);

    expect(results).to.eql({
      myDoc1: [ 'the "allowAttachments" property is not a boolean or a function' ],
      myDoc2: [ 'the "allowAttachments" property is not a boolean or a function' ],
      myDoc3: [ 'the "allowAttachments" property is not a boolean or a function' ]
    });
  });

  describe('attachment constraints', function() {
    it('cannot be anything other than an object or function', function() {
      testDocDefinitions.myDoc1.attachmentConstraints = 1;
      testDocDefinitions.myDoc2.attachmentConstraints = [ 'prop1', 'prop2' ];
      testDocDefinitions.myDoc3.allowAttachments = true;
      testDocDefinitions.myDoc3.attachmentConstraints = 'foobar';

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "attachmentConstraints" property is not an object or a function' ],
        myDoc2: [ 'the "attachmentConstraints" property is not an object or a function' ],
        myDoc3: [ 'the "attachmentConstraints" property is not an object or a function' ]
      });
    });

    it('cannot be defined if allowAttachments is not true', function() {
      testDocDefinitions.myDoc1.allowAttachments = null;
      testDocDefinitions.myDoc2.allowAttachments = null;
      testDocDefinitions.myDoc3.attachmentConstraints = { };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "attachmentConstraints" property is defined but attachments have not been enabled via the "allowAttachments" property' ],
        myDoc2: [ 'the "attachmentConstraints" property is defined but attachments have not been enabled via the "allowAttachments" property' ],
        myDoc3: [ 'the "attachmentConstraints" property is defined but attachments have not been enabled via the "allowAttachments" property' ]
      });
    });

    it('cannot contain an unsupported property', function() {
      testDocDefinitions.myDoc1.attachmentConstraints.foo = 'bar';

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "attachmentConstraints" contains an unsupported property: "foo"' ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });

    describe('maximum attachment count property', function() {
      verifyAttachmentIntegerConstraint('maximumAttachmentCount');
    });

    describe('maximum individual size property', function() {
      verifyAttachmentIntegerConstraint('maximumIndividualSize');
    });

    describe('maximum total size property', function() {
      verifyAttachmentIntegerConstraint('maximumTotalSize');
    });

    it('cannot declare a maximum total size less than maximum individual size', function() {
      testDocDefinitions.myDoc1.attachmentConstraints.maximumIndividualSize = 512;
      testDocDefinitions.myDoc1.attachmentConstraints.maximumTotalSize = 511;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "attachmentConstraints" property\'s "maximumIndividualSize" is greater than "maximumTotalSize"' ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });

    describe('supported extensions property', function() {
      verifyAttachmentListConstraint('supportedExtensions');
    });

    describe('supported content types property', function() {
      verifyAttachmentListConstraint('supportedContentTypes');
    });

    it('cannot declare a requireAttachmentReferences property that is not a boolean', function() {
      testDocDefinitions.myDoc1.attachmentConstraints = { };
      testDocDefinitions.myDoc1.attachmentConstraints.requireAttachmentReferences = [ ];

      testDocDefinitions.myDoc2.attachmentConstraints = { };
      testDocDefinitions.myDoc2.attachmentConstraints.requireAttachmentReferences = 1;

      testDocDefinitions.myDoc3.allowAttachments = true;
      testDocDefinitions.myDoc3.attachmentConstraints = { requireAttachmentReferences: 'false' };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "attachmentConstraints" specifies a "requireAttachmentReferences" property that is not a boolean' ],
        myDoc2: [ 'the "attachmentConstraints" specifies a "requireAttachmentReferences" property that is not a boolean' ],
        myDoc3: [ 'the "attachmentConstraints" specifies a "requireAttachmentReferences" property that is not a boolean' ]
      });
    });
  });

  describe('access assignments', function() {
    it('cannot be anything other than an array', function() {
      testDocDefinitions.myDoc1.accessAssignments = { foo: 'bar' };
      testDocDefinitions.myDoc2.accessAssignments = 12.21;
      testDocDefinitions.myDoc3.accessAssignments = true;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "accessAssignments" property is not an array' ],
        myDoc2: [ 'the "accessAssignments" property is not an array' ],
        myDoc3: [ 'the "accessAssignments" property is not an array' ]
      });
    });

    it('cannot contain elements that are not objects', function() {
      testDocDefinitions.myDoc1.accessAssignments = [ 'foo', [ ], null ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "accessAssignments" property specifies an element that is not an object: "foo"',
          'the "accessAssignments" property specifies an element that is not an object: ' + JSON.stringify([ ]),
          'the "accessAssignments" property specifies an element that is not an object: null'
        ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });

    it('cannot contain an element with an invalid type', function() {
      testDocDefinitions.myDoc1.accessAssignments = [ { type: 'invalid' } ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "accessAssignments" element 0 has an invalid "type": "invalid"' ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });

    it('cannot contain a role assignment that does not declare any users or roles', function() {
      testDocDefinitions.myDoc1.accessAssignments = [ { type: 'role' } ];
      testDocDefinitions.myDoc2.accessAssignments = [
        {
          type: 'role',
          users: [ 'user1' ]
        }
      ];
      testDocDefinitions.myDoc3.accessAssignments = [
        {
          type: 'role',
          roles: [ 'role1' ]
        }
      ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "accessAssignments" element 0 is missing its "roles" property',
          'the "accessAssignments" element 0 is missing its "users" property'
        ],
        myDoc2: [ 'the "accessAssignments" element 0 is missing its "roles" property' ],
        myDoc3: [ 'the "accessAssignments" element 0 is missing its "users" property' ]
      });
    });

    it('cannot contain a role assignment that has empty users or roles', function() {
      testDocDefinitions.myDoc1.accessAssignments = [
        {
          type: 'role',
          users: [ ],
          roles: [ ]
        }
      ];
      testDocDefinitions.myDoc2.accessAssignments = [
        {
          type: 'role',
          users: [ ],
          roles: [ 'role1' ]
        }
      ];
      testDocDefinitions.myDoc3.accessAssignments = [
        {
          type: 'role',
          users: [ 'user1' ],
          roles: [ ]
        }
      ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "accessAssignments" element 0 has an empty "roles" property',
          'the "accessAssignments" element 0 has an empty "users" property'
        ],
        myDoc2: [ 'the "accessAssignments" element 0 has an empty "users" property' ],
        myDoc3: [ 'the "accessAssignments" element 0 has an empty "roles" property' ]
      });
    });

    it('cannot contain a channel assignment that does not declare any users, roles or channels', function() {
      testDocDefinitions.myDoc1.accessAssignments = [ { type: 'channel' } ];
      testDocDefinitions.myDoc2.accessAssignments = [ { users: [ 'user1' ] } ];
      testDocDefinitions.myDoc3.accessAssignments = [ { type: null, roles: [ 'role1' ] } ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "accessAssignments" element 0 does not include either a "roles" or "users" property',
          'the "accessAssignments" element 0 is missing its "channels" property'
        ],
        myDoc2: [ 'the "accessAssignments" element 0 is missing its "channels" property' ],
        myDoc3: [ 'the "accessAssignments" element 0 is missing its "channels" property' ]
      });
    });

    it('cannot contain a channel assignment that has empty users, roles or channels', function() {
      testDocDefinitions.myDoc1.accessAssignments = [
        {
          users: [ ],
          roles: [ ],
          channels: [ ]
        }
      ];
      testDocDefinitions.myDoc2.accessAssignments = [
        {
          type: null,
          users: [ ],
          roles: [ ],
          channels: [ 'channel1' ]
        }
      ];
      testDocDefinitions.myDoc3.accessAssignments = [
        {
          type: 'channel',
          users: [ 'user1' ],
          roles: [ 'role1' ],
          channels: [ ]
        }
      ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "accessAssignments" element 0 has an empty "roles" property',
          'the "accessAssignments" element 0 has an empty "users" property',
          'the "accessAssignments" element 0 has an empty "channels" property'
        ],
        myDoc2: [
          'the "accessAssignments" element 0 has an empty "roles" property',
          'the "accessAssignments" element 0 has an empty "users" property'
        ],
        myDoc3: [ 'the "accessAssignments" element 0 has an empty "channels" property' ]
      });
    });

    it('cannot include an access assignment with properties that are not arrays, strings or functions', function() {
      testDocDefinitions.myDoc1.accessAssignments = [
        {
          type: 'role',
          roles: null,
          users: -12
        }
      ];
      testDocDefinitions.myDoc2.accessAssignments = [
        {
          roles: { },
          users: false,
          channels: 277.1
        }
      ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "accessAssignments" element 0 has a "roles" property that is not an array, string or function',
          'the "accessAssignments" element 0 has a "users" property that is not an array, string or function'
        ],
        myDoc2: [
          'the "accessAssignments" element 0 has a "roles" property that is not an array, string or function',
          'the "accessAssignments" element 0 has a "users" property that is not an array, string or function',
          'the "accessAssignments" element 0 has a "channels" property that is not an array, string or function'
        ],
        myDoc3: [ ]
      });
    });

    it('cannot include an access assignment with non-string elements', function() {
      testDocDefinitions.myDoc1.accessAssignments = [
        {
          type: 'role',
          roles: [ null ],
          users: [ -91 ]
        }
      ];
      testDocDefinitions.myDoc2.accessAssignments = [
        {
          type: 'channel',
          roles: [ { } ],
          users: [ true ],
          channels: [ null ]
        }
      ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "accessAssignments" element 0 "roles" property has an element that is not a string: null',
          'the "accessAssignments" element 0 "users" property has an element that is not a string: -91'
        ],
        myDoc2: [
          'the "accessAssignments" element 0 "roles" property has an element that is not a string: ' + JSON.stringify({ }),
          'the "accessAssignments" element 0 "users" property has an element that is not a string: true',
          'the "accessAssignments" element 0 "channels" property has an element that is not a string: null'
        ],
        myDoc3: [ ]
      });
    });

    it('cannot include an access assignment with an invalid property', function() {
      testDocDefinitions.myDoc1.accessAssignments = [
        {
          type: 'role',
          users: [ 'user1' ],
          roles: [ 'role1' ],
          foo: 'bar'
        }
      ];
      testDocDefinitions.myDoc2.accessAssignments = [
        {
          users: [ 'user1' ],
          roles: [ 'role1' ],
          channels: [ 'channel1' ],
          bar: 'baz'
        }
      ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "accessAssignments" element 0 has an invalid property: "foo"' ],
        myDoc2: [ 'the "accessAssignments" element 0 has an invalid property: "bar"' ],
        myDoc3: [ ]
      });
    });
  });

  describe('custom actions', function() {
    it('cannot be an invalid type', function() {
      testDocDefinitions.myDoc1.customActions.onFoobar = function() { };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "customActions" property specifies an invalid event: "onFoobar"' ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });

    it('cannot be anything other than a function', function() {
      testDocDefinitions.myDoc1.customActions = {
        onTypeIdentificationSucceeded: null,
        onAuthorizationSucceeded: { }
      };
      testDocDefinitions.myDoc2.customActions = {
        onValidationSucceeded: 0,
        onAccessAssignmentsSucceeded: 'function() { }'
      };
      testDocDefinitions.myDoc3.customActions = {
        onDocumentChannelAssignmentSucceeded: true
      };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results.myDoc1.length).to.be(2);
      expect(results.myDoc1).to.contain('the "customActions" property contains a value for the "onTypeIdentificationSucceeded" event that is not a function');
      expect(results.myDoc1).to.contain('the "customActions" property contains a value for the "onAuthorizationSucceeded" event that is not a function');

      expect(results.myDoc2.length).to.be(2);
      expect(results.myDoc2).to.contain('the "customActions" property contains a value for the "onValidationSucceeded" event that is not a function');
      expect(results.myDoc2).to.contain('the "customActions" property contains a value for the "onAccessAssignmentsSucceeded" event that is not a function');

      expect(results.myDoc3.length).to.be(1);
      expect(results.myDoc3).to.contain('the "customActions" property contains a value for the "onDocumentChannelAssignmentSucceeded" event that is not a function');
    });
  });

  function verifyAttachmentIntegerConstraint(propertyName) {
    it('cannot declare a value that is not an integer', function() {
      testDocDefinitions.myDoc1.attachmentConstraints = { };
      testDocDefinitions.myDoc1.attachmentConstraints[propertyName] = '1';

      testDocDefinitions.myDoc2.attachmentConstraints = { };
      testDocDefinitions.myDoc2.attachmentConstraints[propertyName] = -15.5;

      testDocDefinitions.myDoc3.allowAttachments = true;
      testDocDefinitions.myDoc3.attachmentConstraints = { };
      testDocDefinitions.myDoc3.attachmentConstraints[propertyName] = null;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "attachmentConstraints" specifies a "' + propertyName + '" property that is not an integer' ],
        myDoc2: [ 'the "attachmentConstraints" specifies a "' + propertyName + '" property that is not an integer' ],
        myDoc3: [ 'the "attachmentConstraints" specifies a "' + propertyName + '" property that is not an integer' ]
      });
    });

    it('cannot declare an integer value less than 1', function() {
      testDocDefinitions.myDoc1.attachmentConstraints = { };
      testDocDefinitions.myDoc1.attachmentConstraints[propertyName] = 0;

      testDocDefinitions.myDoc2.attachmentConstraints = { };
      testDocDefinitions.myDoc2.attachmentConstraints[propertyName] = -1;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "attachmentConstraints" specifies a "' + propertyName + '" property that is not a positive number' ],
        myDoc2: [ 'the "attachmentConstraints" specifies a "' + propertyName + '" property that is not a positive number' ],
        myDoc3: [ ]
      });
    });
  }

  function verifyAttachmentListConstraint(propertyName) {
    it('cannot declare a value that is not an array', function() {
      testDocDefinitions.myDoc1.attachmentConstraints = { };
      testDocDefinitions.myDoc1.attachmentConstraints[propertyName] = { foo: 'bar' };

      testDocDefinitions.myDoc2.attachmentConstraints = { };
      testDocDefinitions.myDoc2.attachmentConstraints[propertyName] = 'foobar';

      testDocDefinitions.myDoc3.allowAttachments = true;
      testDocDefinitions.myDoc3.attachmentConstraints = { };
      testDocDefinitions.myDoc3.attachmentConstraints[propertyName] = null;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "attachmentConstraints" specifies a "' + propertyName + '" property that is not an array' ],
        myDoc2: [ 'the "attachmentConstraints" specifies a "' + propertyName + '" property that is not an array' ],
        myDoc3: [ 'the "attachmentConstraints" specifies a "' + propertyName + '" property that is not an array' ]
      });
    });

    it('cannot be empty', function() {
      testDocDefinitions.myDoc1.attachmentConstraints[propertyName] = [ ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "attachmentConstraints" specifies a "' + propertyName + '" property that does not contain any elements' ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });

    it('cannot contain non-string elements', function() {
      testDocDefinitions.myDoc1.attachmentConstraints = { };
      testDocDefinitions.myDoc1.attachmentConstraints[propertyName] = [ 1, false, null ];

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "attachmentConstraints" property\'s "' + propertyName + '" contains an element that is not a string: 1',
          'the "attachmentConstraints" property\'s "' + propertyName + '" contains an element that is not a string: false',
          'the "attachmentConstraints" property\'s "' + propertyName + '" contains an element that is not a string: null'
        ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });
  }
});

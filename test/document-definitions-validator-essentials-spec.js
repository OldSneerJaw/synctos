var expect = require('chai').expect;
var simpleMock = require('../lib/simple-mock/index.js');
var mockRequire = require('mock-require');

describe('Document definitions essential properties validator:', function() {
  var docDefinitionsValidator, propertiesValidatorMock, testDocDefinitions;

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
        propertyValidators: { }
      },
      myDoc2: {
        typeFilter: function() { },
        channels: function() { },
        authorizedRoles: function() { },
        authorizedUsers: function() { },
        propertyValidators: function() { }
      },
      myDoc3: {
        typeFilter: function() { },
        authorizedRoles: {
          add: [ 'add-role1' ],
          replace: [ 'replace-role1' ],
          remove: [ 'remove-role1' ]
        },
        authorizedUsers: {
          add: [ 'add-role1' ],
          replace: [ 'replace-role1' ],
          remove: [ 'remove-role1' ]
        },
        propertyValidators: { }
      }
    };

    propertiesValidatorMock = { validate: simpleMock.stub() };
    propertiesValidatorMock.validate.returnWith([ ]);
    mockRequire('../src/document-definition-properties-validator.js', propertiesValidatorMock);

    docDefinitionsValidator = mockRequire.reRequire('../src/document-definitions-validator.js');
  });

  afterEach(function() {
    // Restore "require" calls to their original behaviour after each test case
    mockRequire.stopAll();
  });

  it('approves valid document definitions as an object', function() {
    var results = docDefinitionsValidator.validate(testDocDefinitions);

    expect(results).to.eql({
      myDoc1: [ ],
      myDoc2: [ ],
      myDoc3: [ ]
    });

    verifyPropertyValidationPerformed();
  });

  it('approves valid document definitions as a function', function() {
    var results = docDefinitionsValidator.validate(function() { return testDocDefinitions; });

    expect(results).to.eql({
      myDoc1: [ ],
      myDoc2: [ ],
      myDoc3: [ ]
    });

    verifyPropertyValidationPerformed();
  });

  it('rejects a value input that is not a plain object', function() {
    var results = docDefinitionsValidator.validate([ 1, 2, 3 ]);

    expect(results).to.equal('Document definitions are not specified as an object');
    expect(propertiesValidatorMock.validate.callCount).to.equal(0);
  });

  it('rejects a function input that does not return a plain object', function() {
    var results = docDefinitionsValidator.validate(function() { return 'not-an-object'; });

    expect(results).to.equal('Document definitions are not specified as an object');
    expect(propertiesValidatorMock.validate.callCount).to.equal(0);
  });

  it('rejects a value input that is null', function() {
    var results = docDefinitionsValidator.validate(null);

    expect(results).to.equal('Document definitions are not specified as an object');
    expect(propertiesValidatorMock.validate.callCount).to.equal(0);
  });

  it('rejects a function input that returns null', function() {
    var results = docDefinitionsValidator.validate(null);

    expect(results).to.equal('Document definitions are not specified as an object');
    expect(propertiesValidatorMock.validate.callCount).to.equal(0);
  });

  it('rejects an input that throws an exception', function() {
    var exception = new Error('my exception');

    var results = docDefinitionsValidator.validate(function() { throw exception; });

    expect(results).to.equal('Document definitions threw an exception: ' + exception.message);
    expect(propertiesValidatorMock.validate.callCount).to.equal(0);
  });

  describe('type filter', function() {
    it('cannot be anything other than a function', function() {
      testDocDefinitions.myDoc1.typeFilter = true;
      testDocDefinitions.myDoc2.typeFilter = { foo: 'bar' };
      testDocDefinitions.myDoc3.typeFilter = 'foobar';

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "typeFilter" property is not a function' ],
        myDoc2: [ 'the "typeFilter" property is not a function' ],
        myDoc3: [ 'the "typeFilter" property is not a function' ]
      });
    });

    it('cannot be left undefined or null', function() {
      delete testDocDefinitions.myDoc1.typeFilter;
      testDocDefinitions.myDoc2.typeFilter = null;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'missing a "typeFilter" property' ],
        myDoc2: [ 'missing a "typeFilter" property' ],
        myDoc3: [ ]
      });
    });
  });

  describe('channels', function() {
    verifyPermissionsCategory('channels', true);

    it('cannot be left undefined or null if neither authorizedRoles nor authorizedUsers are defined', function() {
      delete testDocDefinitions.myDoc1.channels;

      testDocDefinitions.myDoc2.channels = null;
      testDocDefinitions.myDoc2.authorizedRoles = null;
      testDocDefinitions.myDoc2.authorizedUsers = null;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'missing a "channels", "authorizedRoles" or "authorizedUsers" property' ],
        myDoc2: [ 'missing a "channels", "authorizedRoles" or "authorizedUsers" property' ],
        myDoc3: [ ]
      });
    });
  });

  describe('authorizedRoles', function() {
    verifyPermissionsCategory('authorizedRoles', false);
  });

  describe('authorizedUsers', function() {
    verifyPermissionsCategory('authorizedUsers', false);
  });

  describe('property validators', function() {
    it('cannot be anything other than an object or a function', function() {
      testDocDefinitions.myDoc1.propertyValidators = true;
      testDocDefinitions.myDoc2.propertyValidators = [ 'prop1', 'prop2' ];
      testDocDefinitions.myDoc3.propertyValidators = 'foobar';

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "propertyValidators" property is not an object or a function' ],
        myDoc2: [ 'the "propertyValidators" property is not an object or a function' ],
        myDoc3: [ 'the "propertyValidators" property is not an object or a function' ]
      });

      expect(propertiesValidatorMock.validate.callCount).to.equal(0);
    });

    it('cannot be be left undefined or null', function() {
      delete testDocDefinitions.myDoc1.propertyValidators;
      testDocDefinitions.myDoc2.propertyValidators = null;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'missing a "propertyValidators" property' ],
        myDoc2: [ 'missing a "propertyValidators" property' ],
        myDoc3: [ ]
      });

      expect(propertiesValidatorMock.validate.callCount).to.equal(1);
      expect(propertiesValidatorMock.validate.calls[0].args).to.eql(
        [ testDocDefinitions.myDoc3, testDocDefinitions.myDoc3.propertyValidators ]);
    });

    it('errors are included in the final result', function() {
      var expectedErrors = [ 'my', 'errors' ];
      propertiesValidatorMock.validate = simpleMock.stub();
      propertiesValidatorMock.validate.returnWith(expectedErrors);

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: expectedErrors,
        myDoc2: [ ], // No errors because the property validators are specified as a function which are not validated
        myDoc3: expectedErrors
      });

      verifyPropertyValidationPerformed();
    });
  });

  function verifyPermissionsCategory(category, supportsViewOperation) {
    it('cannot be anything other than an object or a function', function() {
      testDocDefinitions.myDoc1[category] = [ 'foo', 'bar' ];
      testDocDefinitions.myDoc2[category] = 'foobar';
      testDocDefinitions.myDoc3[category] = true;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "' + category + '" property is not an object or a function' ],
        myDoc2: [ 'the "' + category + '" property is not an object or a function' ],
        myDoc3: [ 'the "' + category + '" property is not an object or a function' ]
      });
    });

    it('cannot contain unknown operations', function() {
      testDocDefinitions.myDoc1[category] = {
        write: 'write1',
        foo: 'bar'
      };
      testDocDefinitions.myDoc2[category] = {
        add: [ 'add1' ],
        replace: [ 'replace1' ],
        remove: [ 'remove1' ],
        bar: [ 'baz' ]
      };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "' + category + '" property\'s "foo" operation type is not supported' ],
        myDoc2: [ 'the "' + category + '" property\'s "bar" operation type is not supported' ],
        myDoc3: [ ]
      });
    });

    it('cannot specify no operations', function() {
      testDocDefinitions.myDoc1[category] = { };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'the "' + category + '" property does not specify any operation types' ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });

    it('cannot contain empty operations', function() {
      var expectedDoc1Errors = [ 'the "' + category + '" property\'s "write" operation does not contain any elements' ];
      testDocDefinitions.myDoc1[category] = { write: [ ] };
      if (supportsViewOperation) {
        expectedDoc1Errors.push('the "' + category + '" property\'s "view" operation does not contain any elements');
        testDocDefinitions.myDoc1[category].view = [ ];
      }

      testDocDefinitions.myDoc2[category] = {
        add: [ ],
        replace: [ ],
        remove: [ ]
      };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: expectedDoc1Errors,
        myDoc2: [
          'the "' + category + '" property\'s "add" operation does not contain any elements',
          'the "' + category + '" property\'s "replace" operation does not contain any elements',
          'the "' + category + '" property\'s "remove" operation does not contain any elements'
        ],
        myDoc3: [ ]
      });
    });

    it('cannot contain operations that are not specified as strings or arrays', function() {
      var expectedDoc1Errors = [ 'the "' + category + '" property\'s "write" operation is not a string or array' ];
      testDocDefinitions.myDoc1[category] = { write: null };
      if (supportsViewOperation) {
        expectedDoc1Errors.push('the "' + category + '" property\'s "view" operation is not a string or array');
        testDocDefinitions.myDoc1[category].view = true;
      }

      testDocDefinitions.myDoc2[category] = {
        add: { bar: 'baz' },
        replace: -3,
        remove: 180.33
      };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: expectedDoc1Errors,
        myDoc2: [
          'the "' + category + '" property\'s "add" operation is not a string or array',
          'the "' + category + '" property\'s "replace" operation is not a string or array',
          'the "' + category + '" property\'s "remove" operation is not a string or array'
        ],
        myDoc3: [ ]
      });
    });

    it('cannot contain channels that are not strings', function() {
      var expectedDoc1Errors = [ 'the "' + category + '" property\'s "write" operation contains an element that is not a string: true' ];
      testDocDefinitions.myDoc1[category] = { write: [ true ] };
      if (supportsViewOperation) {
        expectedDoc1Errors.push('the "' + category + '" property\'s "view" operation contains an element that is not a string: 1');
        testDocDefinitions.myDoc1[category].view = [ 1 ];
      }

      var myObj = { foo: 'bar' };
      testDocDefinitions.myDoc2[category] = {
        add: [ myObj ],
        replace: [ -17.83 ],
        remove: [ null ]
      };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: expectedDoc1Errors,
        myDoc2: [
          'the "' + category + '" property\'s "add" operation contains an element that is not a string: ' + JSON.stringify(myObj),
          'the "' + category + '" property\'s "replace" operation contains an element that is not a string: -17.83',
          'the "' + category + '" property\'s "remove" operation contains an element that is not a string: null'
        ],
        myDoc3: [ ]
      });
    });

    if (!supportsViewOperation) {
      it('cannot include the view operation', function() {
        testDocDefinitions.myDoc1[category] = { view: [ 'view' ] };
        testDocDefinitions.myDoc2[category] = { view: 'view' };

        var results = docDefinitionsValidator.validate(testDocDefinitions);

        expect(results).to.eql({
          myDoc1: [ 'the "' + category + '" property\'s "view" operation type is not supported' ],
          myDoc2: [ 'the "' + category + '" property\'s "view" operation type is not supported' ],
          myDoc3: [ ]
        });
      });
    }
  }

  function verifyPropertyValidationPerformed() {
    expect(propertiesValidatorMock.validate.callCount).to.equal(2);
    expect(propertiesValidatorMock.validate.calls[0].args).to.eql([ testDocDefinitions.myDoc1, testDocDefinitions.myDoc1.propertyValidators ]);
    expect(propertiesValidatorMock.validate.calls[1].args).to.eql([ testDocDefinitions.myDoc3, testDocDefinitions.myDoc3.propertyValidators ]);
  }
});

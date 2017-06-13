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
        propertyValidators: { }
      },
      myDoc2: {
        typeFilter: function() { },
        authorizedRoles: function() { },
        propertyValidators: function() { }
      },
      myDoc3: {
        typeFilter: function() { },
        authorizedUsers: { write: [ 'write' ] },
        propertyValidators: { }
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

  it('rejects a value input that is not a plain object', function() {
    var results = docDefinitionsValidator.validate([ 1, 2, 3 ]);

    expect(results).to.equal('Document definitions are not specified as an object');
  });

  it('rejects a function input that does not return a plain object', function() {
    var results = docDefinitionsValidator.validate(function() { return 'not-an-object'; });

    expect(results).to.equal('Document definitions are not specified as an object');
  });

  it('rejects a value input that is null', function() {
    var results = docDefinitionsValidator.validate(null);

    expect(results).to.equal('Document definitions are not specified as an object');
  });

  it('rejects a function input that returns null', function() {
    var results = docDefinitionsValidator.validate(null);

    expect(results).to.equal('Document definitions are not specified as an object');
  });

  it('rejects an input that throws an exception', function() {
    var exception = new Error('my exception');

    var results = docDefinitionsValidator.validate(function() { throw exception; });

    expect(results).to.equal('Document definitions threw an exception: ' + exception.message);
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
    verifyPermissionsCategory('channels');

    it('cannot be left undefined or null if neither authorizedRoles nor authorizedUsers are defined', function() {
      testDocDefinitions.myDoc1.channels = null;
      testDocDefinitions.myDoc2.authorizedRoles = null;

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [ 'missing a "channels", "authorizedRoles" or "authorizedUsers" property' ],
        myDoc2: [ 'missing a "channels", "authorizedRoles" or "authorizedUsers" property' ],
        myDoc3: [ ]
      });
    });
  });

  describe('authorizedRoles', function() {
    verifyPermissionsCategory('authorizedRoles');
  });

  describe('authorizedUsers', function() {
    verifyPermissionsCategory('authorizedUsers');
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
    });
  });

  function verifyPermissionsCategory(category) {
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
        myDoc1: [ 'the "' + category + '" property does not specify any operation types (e.g. "view", "add", "replace", "remove", "write")' ],
        myDoc2: [ ],
        myDoc3: [ ]
      });
    });

    it('cannot contain empty operations', function() {
      testDocDefinitions.myDoc1[category] = {
        view: [ ],
        write: [ ]
      };
      testDocDefinitions.myDoc2[category] = {
        add: [ ],
        replace: [ ],
        remove: [ ]
      };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "' + category + '" property\'s "view" operation does not contain any elements',
          'the "' + category + '" property\'s "write" operation does not contain any elements'
        ],
        myDoc2: [
          'the "' + category + '" property\'s "add" operation does not contain any elements',
          'the "' + category + '" property\'s "replace" operation does not contain any elements',
          'the "' + category + '" property\'s "remove" operation does not contain any elements'
        ],
        myDoc3: [ ]
      });
    });

    it('cannot contain operations that are not specified as strings or arrays', function() {
      var myObj = { foo: 'bar' };
      testDocDefinitions.myDoc1[category] = {
        view: true,
        write: null
      };
      testDocDefinitions.myDoc2[category] = {
        add: { bar: 'baz' },
        replace: -3,
        remove: 180.33
      };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "' + category + '" property\'s "view" operation is not a string or array',
          'the "' + category + '" property\'s "write" operation is not a string or array'
        ],
        myDoc2: [
          'the "' + category + '" property\'s "add" operation is not a string or array',
          'the "' + category + '" property\'s "replace" operation is not a string or array',
          'the "' + category + '" property\'s "remove" operation is not a string or array'
        ],
        myDoc3: [ ]
      });
    });

    it('cannot contain channels that are not strings', function() {
      var myObj = { foo: 'bar' };
      testDocDefinitions.myDoc1[category] = {
        view: [ 1 ],
        write: [ true ]
      };
      testDocDefinitions.myDoc2[category] = {
        add: [ myObj ],
        replace: [ -17.83 ],
        remove: [ null ]
      };

      var results = docDefinitionsValidator.validate(testDocDefinitions);

      expect(results).to.eql({
        myDoc1: [
          'the "' + category + '" property\'s "view" operation contains an element that is not a string: 1',
          'the "' + category + '" property\'s "write" operation contains an element that is not a string: true'
        ],
        myDoc2: [
          'the "' + category + '" property\'s "add" operation contains an element that is not a string: ' + JSON.stringify(myObj),
          'the "' + category + '" property\'s "replace" operation contains an element that is not a string: -17.83',
          'the "' + category + '" property\'s "remove" operation contains an element that is not a string: null'
        ],
        myDoc3: [ ]
      });
    });
  }
});

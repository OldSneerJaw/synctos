# Introduction

Synctos: The Syncmaker. A utility to aid with the process of designing well-structured sync functions for Couchbase Sync Gateway.

With this utility, you define all your JSON document types in a declarative JavaScript object format that eliminates much of the boilerplate normally required for [sync functions](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/sync-function-api-guide/index.html) that perform comprehensive validation of document contents and permissions. Not only is it invaluable in protecting the integrity of the documents that are stored in a Sync Gateway database, whenever a document fails validation the sync function will return a detailed error message that makes it easy for a client to figure out exactly what went wrong.

To learn more about Sync Gateway, check out [Couchbase](http://www.couchbase.com/)'s comprehensive [developer documentation](http://developer.couchbase.com/documentation/mobile/current/get-started/sync-gateway-overview/index.html).

[![Build Status](https://travis-ci.org/Kashoo/synctos.svg?branch=master)](https://travis-ci.org/Kashoo/synctos)

# Installation

Synctos is distributed as an [npm](https://www.npmjs.com/) package and has several npm dependencies. As such, it requires that [Node.js](https://nodejs.org/) is installed in order to run.

To add synctos to your project, run `npm install synctos` from the project's root directory to install the package locally. Or, better yet, if you define a package.json in your project, you can run `npm install synctos --savedev` to automatically install locally and insert the package into your package.json's developer dependencies.

For more info on npm package management, see the official npm documentation for [Installing npm packages locally](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) and [Using a \`package.json\`](https://docs.npmjs.com/getting-started/using-a-package.json).

# Usage

### Running

Once synctos is installed, you can run it from your project's directory as follows:

    node_modules/synctos/make-sync-function /path/to/my-document-definitions.js /path/to/my-generated-sync-function.js

This will take the sync document definitions that are defined in `/path/to/my-document-definitions.js` and build a new sync function that is output to `/path/to/my-generated-sync-function.js`. The generated sync function contents can then be inserted into the definition of a bucket/database in a Sync Gateway [configuration file](http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/config-properties/index.html#configuration-files) as a multi-line string surrounded with backquotes/backticks ( \` ).

Generated sync functions are compatible with all Sync Gateway 1.x versions.

**NOTE**: Due to a [known issue](https://github.com/couchbase/sync_gateway/issues/1866) in Sync Gateway versions up to and including 1.2.1, when specifying a bucket/database's sync function in a configuration file as a multi-line string, you will have to be sure to escape any literal backslash characters in the sync function body. For example, if your sync function contains a regular expression like `new RegExp('\\w+')`, you will have to escape the backslashes when inserting the sync function into the configuration file so that it becomes `new RegExp('\\\\w+')`. The issue has been resolved in Sync Gateway version 1.3.0 and later.

### Definition file

A document definition file contains all the document types that belong to a single Sync Gateway bucket/database. A file can contain either a plain JavaScript object or a JavaScript function that returns the documents' definitions wrapped in an object.

For example, a document definition file implemented as an object:

    {
      myDocType1: {
        channels: {
          view: 'view',
          write: 'write'
        },
        typeFilter: function(doc, oldDoc, docType) {
          return oldDoc ? oldDoc.type === docType : doc.type === docType;
        },
        propertyValidators: {
          type: {
            type: 'string',
            required: true
          },
          myProp1: {
            type: 'integer'
          }
        }
      },
      myDocType2: {
        channels: {
          view: 'view',
          write: 'write'
        },
        typeFilter: function(doc, oldDoc, docType) {
          return oldDoc ? oldDoc.type === docType : doc.type === docType;
        },
        propertyValidators: {
          type: {
            type: 'string',
            required: true
          },
          myProp2: {
            type: 'datetime'
          }
        }
      }
    }

Or a functionally equivalent document definition file implemented as a function:

    function() {
      var sharedChannels = {
        view: 'view',
        write: 'write'
      };
      var typePropertyValidator = {
        type: 'string',
        required: true
      };

      function myDocTypeFilter(doc, oldDoc, docType) {
        return oldDoc ? oldDoc.type === docType : doc.type === docType;
      }

      return {
        myDocType1: {
          channels: sharedChannels,
          typeFilter: myDocTypeFilter,
          propertyValidators: {
            type: typePropertyValidator,
            myProp1: {
              type: 'integer'
            }
          }
        },
        myDocType2: {
          channels: sharedChannels,
          typeFilter: myDocTypeFilter,
          propertyValidators: {
            type: typePropertyValidator,
            myProp2: {
              type: 'datetime'
            }
          }
        }
      };
    }

As seen above, the advantage of defining a function rather than an object is that you may define variables and functions that can be shared between document types, but the choice is ultimately yours.

### Specifications

In the case of either file format, the document definitions object must conform to the following specification. See the `samples/` directory for some example definitions.

At the top level, the object contains a property for each document type that is to be supported by the Sync Gateway bucket. For example:

    {
      myDocType1: {
        channels: ...,
        typeFilter: ...,
        propertyValidators: ...
      },
      myDocType2: {
        channels: ...,
        typeFilter: ...,
        propertyValidators: ...
      }
    }

##### Document types:

Each document type is specified as an object with the following properties:

* `channels`: (required if `authorizedRoles` is undefined) The [channels](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/channels/index.html) to assign to documents of this type. If used in combination with the `authorizedRoles` property, authorization will be granted if the user making the modification has at least one of the channels and/or one of the authorized roles for the corresponding operation type (add, replace or remove). May be specified as either a plain object or a function that returns a dynamically-constructed object and accepts as parameters (1) the new document and (2) the old document that is being replaced (if any). NOTE: In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, and if the old document has been deleted or simply does not exist, the second parameter will be `null`. Either way the object is specified, it may include the following properties, each of which may be either an array of channel names or a single channel name as a string:
  * `view`: (optional) The channel(s) that confer read-only access to documents of this type.
  * `add`: (required if `write` is undefined) The channel(s) that confer the ability to create new documents of this type. Any user with a matching channel also gains implicit read access.
  * `replace`: (required if `write` is undefined) The channel(s) that confer the ability to replace existing documents of this type. Any user with a matching channel also gains implicit read access.
  * `remove`: (required if `write` is undefined) The channel(s) that confer the ability to delete documents of this type. Any user with a matching channel also gains implicit read access.
  * `write`: (required if one or more of `add`, `replace` or `remove` are undefined) The channel(s) that confer the ability to add, replace or remove documents of this type. Exists as a convenience in cases where the add, replace and remove operations should share the same channel(s). Any user with a matching channel also gains implicit read access.

For example:

```
    channels: {
      add: [ 'create', 'new' ],
      replace: 'update',
      remove: 'delete'
    }
```

Or:

```
    channels: function(doc, oldDoc) {
      return {
        view: doc._id + '-readonly',
        write: [ doc._id + '-edit', doc._id + '-admin' ]
      };
    }
```

* `authorizedRoles`: (required if `channels` is undefined) The [roles](http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/authorizing-users/index.html#roles) that are authorized to add, replace and remove documents of this type. If used in combination with the `channels` property, authorization will be granted if the user making the modification has at least one of the channels and/or one of the authorized roles for the corresponding operation type (add, replace or remove). May be specified as either a plain object or a function that returns a dynamically-constructed object and accepts as parameters (1) the new document and (2) the old document that is being replaced (if any). NOTE: In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, and if the old document has been deleted or simply does not exist, the second parameter will be `null`. Either way the object is specified, it may include the following properties, each of which may be either an array of role names or a single role name as a string:
  * `add`: (optional) The role(s) that confer the ability to create new documents of this type.
  * `replace`: (optional) The role(s) that confer the ability to replace existing documents of this type.
  * `remove`: (optional) The role(s) that confer the ability to delete documents of this type.
  * `write`: (optional) The role(s) that confer the ability to add, replace or remove documents of this type. Exists as a convenience in cases where the add, replace and remove operations should share the same role(s).

For example:

```
    authorizedRoles: {
      add: 'manager',
      replace: [ 'manager', 'employee' ],
      remove: 'manager'
    }
```

Or:

```
    authorizedRoles: function(doc, oldDoc) {
      return {
        write: [ doc._id + '-collaborator', 'admin' ]
      };
    }
```

* `typeFilter`: (required) A function that is used to identify documents of this type. It accepts as function parameters (1) the new document, (2) the old document that is being replaced (if any) and (3) the name of the current document type. For the sake of convenience, a simple type filter function (`simpleTypeFilter`) is available that attempts to match the document's `type` property to the document type's name (e.g. if a document definition is named "message", then a candidate document's `type` property must be "message" to be considered a document of that type). NOTE: In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, so be sure to account for such cases. And, if the old document has been deleted or simply does not exist, the second parameter will be `null`.

An example of the simple type filter:

```
    typeFilter: simpleTypeFilter
```

And an example of a more complex custom type filter:

```
    typeFilter: function(doc, oldDoc, currentDocType) {
      var typePropertyMatches;
      if (oldDoc) {
        if (doc._deleted) {
          typePropertyMatches = oldDoc.type === currentDocType;
        } else {
          typePropertyMatches = doc.type === oldDoc.type && oldDoc.type === currentDocType;
        }
      } else {
        // The old document does not exist or was deleted - we can rely on the new document's type
        typePropertyMatches = doc.type === currentDocType;
      }

      if (typePropertyMatches) {
        return true;
      } else {
        // The type property did not match - fall back to matching the document ID pattern
        var docIdRegex = new RegExp('^message\\.[A-Za-z0-9_-]+$');

        return docIdRegex.test(doc._id);
      }
    }
```

* `propertyValidators`: (required) An object/hash of validators that specify the format of each of the document type's supported properties. Each entry consists of a key that specifies the property name and a value that specifies the validation to perform on that property. Each element must declare a type and, optionally, some number of additional parameters. Any property that is not declared here will be rejected by the sync function unless the `allowUnknownProperties` field is set to `true`. An example:

```
    propertyValidators: {
      myProp1: {
        type: 'boolean',
        required: true
      },
      myProp2: {
        type: 'array',
        mustNotBeEmpty: true
      }
    }
```

* `accessAssignments`: (optional) Defines the channels to dynamically assign to users and/or roles when a document of the corresponding type is successfully created, replaced or deleted. It is specified as a list, where each entry is an object that defines `users`, `roles` and/or `channels` properties. The value of each property can be either a list of strings that specify the raw user/role/channel names or a function that returns the corresponding values as a dynamically-constructed list and accepts the following parameters: (1) the new document and (2) the old document that is being replaced/deleted (if any). NOTE: In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, so be sure to account for such cases. And, if the old document has been deleted or simply does not exist, the second parameter will be `null`. An example:

```
    accessAssignments: [
      {
        users: [ 'user1', 'user2' ],
        channels: [ 'channel1' ]
      },
      {
        roles: [ 'role1', 'role2' ],
        channels: [ 'channel2' ]
      },
      {
        users: function(doc, oldDoc) {
          return doc.users;
        },
        roles: function(doc, oldDoc) {
          return doc.roles;
        },
        channels: function(doc, oldDoc) {
          return [ doc._id + '-channel3', doc._id + '-channel4' ];
        }
      },
    ]
```

* `allowAttachments`: (optional) Whether to allow the addition of [file attachments](http://developer.couchbase.com/documentation/mobile/current/develop/references/sync-gateway/rest-api/document-public/put-db-doc-attachment/index.html) for the document type. Defaults to `false` to prevent malicious/misbehaving clients from polluting the bucket/database with unwanted files.
* `allowUnknownProperties`: (optional) Whether to allow the existence of properties that are not explicitly declared in the document type definition. Not applied recursively to objects that are nested within documents of this type. Defaults to `false`.
* `immutable`: (optional) The document cannot be replaced or deleted after it is created. Note that, even if attachments are allowed for this document type (see the `allowAttachments` parameter for more info), it will not be possible to create, modify or delete attachments in a document that already exists, which means that they must be created inline in the document's `_attachments` property when the document is first created. Defaults to `false`.
* `cannotReplace`: (optional) As with the `immutable` constraint, the document cannot be replaced after it is created. However, this constraint does not prevent the document from being deleted. Note that, even if attachments are allowed for this document type (see the `allowAttachments` parameter for more info), it will not be possible to create, modify or delete attachments in a document that already exists, which means that they must be created inline in the document's `_attachments` property when the document is first created. Defaults to `false`.
* `cannotDelete`: (optional) As with the `immutable` constraint, the document cannot be deleted after it is created. However, this constraint does not prevent the document from being replaced. Defaults to `false`.

##### Validation:

There are a number of validation types that can be used to define each property/element/key's expected format in a document.

Validation for simple data types:

* `string`: The value is a string of characters. Additional parameters:
  * `mustNotBeEmpty`: If `true`, an empty string is not allowed. Defaults to `false`.
  * `regexPattern`: A regular expression pattern that must be satisfied for values to be accepted (e.g. `new RegExp('\\d+')`). Undefined by default.
  * `minimumLength`: The minimum number of characters (inclusive) allowed in the string. Undefined by default.
  * `maximumLength`: The maximum number of characters (inclusive) allowed in the string. Undefined by default.
* `integer`: The value is a number with no fractional component. Additional parameters:
  * `minimumValue`: Reject values that are less than this. No restriction by default.
  * `minimumValueExclusive`: Reject values that are less than or equal to this. No restriction by default.
  * `maximumValue`: Reject values that are greater than this. No restriction by default.
  * `maximumValueExclusive`: Reject values that are greater than or equal to this. No restriction by default.
* `float`: The value is a number with an optional fractional component (i.e. it is either an integer or a floating point number). Additional parameters:
  * `minimumValue`: Reject values that are less than this. No restriction by default.
  * `minimumValueExclusive`: Reject values that are less than or equal to this. No restriction by default.
  * `maximumValue`: Reject values that are greater than this. No restriction by default.
  * `maximumValueExclusive`: Reject values that are greater than or equal to this. No restriction by default.
* `boolean`: The value is either `true` or `false`. No additional parameters.
* `datetime`: The value is an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date string with optional time and time zone components (e.g. "2016-06-18T18:57:35.328-08:00"). Additional parameters:
  * `minimumValue`: Reject date/times that are less than this. If the value of this parameter or the property value to which it is to be applied are missing their time and time zone components, they will default to midnight UTC of the date in question. No restriction by default.
  * `minimumValueExclusive`: Reject date/times that are less than or equal to this. If the value of this parameter or the property value to which it is to be applied are missing their time and time zone components, they will default to midnight UTC of the date in question. No restriction by default.
  * `maximumValue`: Reject date/times that are greater than this. If the value of this parameter or the property value to which it is to be applied are missing their time and time zone components, they will default to midnight UTC of the date in question. No restriction by default.
  * `maximumValueExclusive`: Reject date/times that are greater than or equal to this. If the value of this parameter or the property value to which it is to be applied are missing their time and time zone components, they will default to midnight UTC of the date in question. No restriction by default.
* `date`: The value is an ISO 8601 date string _without_ time and time zone components (e.g. "2016-06-18"). Additional parameters:
  * `minimumValue`: Reject dates that are less than this. No restriction by default.
  * `minimumValueExclusive`: Reject dates that are less than or equal to this. No restriction by default.
  * `maximumValue`: Reject dates that are greater than this. No restriction by default.
  * `maximumValueExclusive`: Reject dates that are greater than or equal to this. No restriction by default.
* `attachmentReference`: The value is the name of one of the document's file attachments. Note that, because the addition of an attachment is often a separate Sync Gateway API operation from the creation/replacement of the associated document, this validation type is only applied if the attachment is actually present in the document. However, since the sync function is run twice in such situations (i.e. once when the document is created/replaced and once when the attachment is created/replaced), the validation will be performed eventually. Additional parameters:
  * `supportedExtensions`: An array of case-insensitive file extensions that are allowed for the attachment's filename (e.g. "txt", "jpg", "pdf"). No restriction by default.
  * `supportedContentTypes`: An array of content/MIME types that are allowed for the attachment's contents (e.g. "image/png", "text/html", "application/xml"). No restriction by default.
  * `maximumSize`: The maximum file size, in bytes, of the attachment. May not be greater than 20MB (20,971,520 bytes), as Couchbase Server/Sync Gateway sets that as the hard limit per document or attachment. Undefined by default.

Validation for complex data types, which allow for nesting of child properties and elements:

* `array`: An array/list of elements. Additional parameters:
  * `mustNotBeEmpty`: If `true`, an array with no elements is not allowed. Defaults to `false`.
  * `minimumLength`: The minimum number of elements (inclusive) allowed in the array. Undefined by default.
  * `maximumLength`: The maximum number of elements (inclusive) allowed in the array. Undefined by default.
  * `arrayElementsValidator`: The validation that is applied to each element of the array. Any validation type, including those for complex data types, may be used. Undefined by default. An example:

```
    myArray1: {
      type: 'array',
      mustNotBeEmpty: true,
      arrayElementsValidator: {
        type: 'string',
        regexPattern: new RegExp('[A-Za-z0-9_-]+')
      }
    }
```

* `object`: An object that is able to declare which properties it supports so that unrecognized properties are rejected. Additional parameters:
  * `allowUnknownProperties`: Whether to allow the existence of properties that are not explicitly declared in the object definition. Not applied recursively to objects that are nested within this object. Defaults to `false` if the `propertyValidators` parameter is specified; otherwise, it defaults to `true`.
  * `propertyValidators`: An object/hash of validators to be applied to the properties that are explicitly supported by the object. Any validation type, including those for complex data types, may be used for each property validator. Undefined by default. If defined, then any property that is not declared will be rejected by the sync function unless the `allowUnknownProperties` parameter is `true`. An example:

```
    myObj1: {
      type: 'object',
      propertyValidators: {
        myProp1: {
          type: 'date',
          immutable: true
        },
        myProp2: {
          type: 'integer',
          minimumValue: 1
        }
      }
    }
```

* `hashtable`: An object/hash that, unlike the `object` type, does not declare the names of the properties it supports and may optionally define a single validator that is applied to all of its element values. Additional parameters:
  * `hashtableKeysValidator`: The validation that is applied to each of the keys in the object/hash. Undefined by default. Additional parameters:
    * `mustNotBeEmpty`: If `true`, empty key strings are not allowed. Defaults to `false`.
    * `regexPattern`: A regular expression pattern that must be satisfied for key strings to be accepted. Undefined by default.
  * `hashtableValuesValidator`: The validation that is applied to each of the values in the object/hash. Undefined by default. Any validation type, including those for complex data types, may be used. An example:

```
    myHash1: {
      type: 'hashtable',
      hashtableKeysValidator: {
        mustNotBeEmpty: false,
        regexPattern: new RegExp('\\w+')
      },
      hashtableValuesValidator: {
        type: 'object',
        required: true,
        propertyValidators: {
          mySubObjProp1: {
            type: 'string'
          }
        }
      }
    }
```

**NOTE**: Validation for all simple and complex data types support the following additional parameters:

* `required`: The value cannot be null or undefined. Defaults to `false`.
* `immutable`: The item cannot be changed from its existing value if the document is being replaced. The constraint is applied recursively so that, even if a value that is nested an arbitrary number of levels deep within an immutable complex type is modified, the document change will be rejected. Does not apply when creating a new document or deleting an existing document. Defaults to `false`.
* `immutableWhenSet`: As with the `immutable` property, the item cannot be changed from its existing value if the document is being replaced. However, it differs in that it only prevents modification if the item does not currently have a value (i.e. it is null or undefined). The constraint is applied recursively so that, even if a value that is nested an arbitrary number of levels deep within an immutable complex type is modified, the document change will be rejected. Does not apply when creating a new document or deleting an existing document. Defaults to `false`.
* `customValidation`: A function that accepts as parameters (1) the new document, (2) the old document that is being replaced/deleted (if any), (3) an object that contains metadata about the current item to validate and (4) a stack of the items (e.g. object properties, array elements, hashtable element values) that have gone through validation, where the last/top element contains metadata for the direct parent of the item currently being validated and the first/bottom element is metadata for the root (i.e. the document). In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, so be sure to account for such cases. If the document does not yet exist, the second parameter will be null or undefined. And, in some cases where the document previously existed (i.e. it was deleted), the second parameter _may_ be non-null and its `_deleted` property will be `true`. Generally, custom validation should not throw exceptions; it's recommended to return an array/list of error descriptions so the sync function can compile a list of all validation errors that were encountered once full validation is complete. A return value of `null`, `undefined` or an empty array indicate there were no validation errors. An example:

```
    propertyValidators: {
      myStringProp: {
        type: 'string'
      },
      myCustomProp: {
        type: 'integer',
        minimumValue: 1,
        maximumValue: 100,
        customValidation: function(doc, oldDoc, currentItemElement, validationItemStack) {
          var parentObjectElement = validationItemStack[validationItemStack.length - 1];
          var parentObjectName = parentObjectElement.itemName;
          var parentObjectValue = parentObjectElement.itemValue;
          var parentObjectOldValue = parentObjectElement.oldItemValue;

          var currentPropName = currentItemElement.itemName;
          var currentPropValue = currentItemElement.itemValue;
          var currentPropOldValue = currentItemElement.oldItemValue;

          var currentPropPath = parentObjectName + '.' + currentPropName;
          var myStringPropPath = parentObjectName + '.myStringProp';

          var validationErrors = [ ];

          if (parentObjectValue.myStringProp && !currentPropValue) {
            validationErrors.push('property "' + currentPropPath + '" must be defined when "' + myStringPropPath + '" is defined');
          }

          if (currentPropOldValue && currentPropValue && currentPropValue < currentPropOldValue) {
            validationErrors.push('property "' + currentPropPath + '" must not decrease in value');
          }

          return validationErrors;
        }
      }
    }
```

# Testing

The synctos project includes a variety of specifications/test cases to verify the behaviours of its various features. However, if you need to write a custom validation function, dynamic type filter, dynamic assignment of channels to users/roles, etc. or you would otherwise like to verify a generated sync function, this project includes a test helper module (`etc/test-helper.js`) that is useful in automating much of the work that can go into writing test cases.

To include the test helper module in your own sync function test cases, you must first ensure that your project [includes](https://docs.npmjs.com/getting-started/using-a-package.json) the development dependencies it relies upon. Update your project's `devDependencies` to include the following packages:

* [expect.js](https://www.npmjs.com/package/expect.js) for test assertions
* [simple-mock](https://www.npmjs.com/package/simple-mock) for mocking/stubbing the built-in Sync Gateway functions `requireAccess`, `channel`, `access`, etc.
* [mocha](https://mochajs.org/) or another JavaScript test runner/framework that supports `expect.js`

The synctos project uses `mocha` for writing and executing test cases and the following instructions assume that you will too, but you are free to substitute something else if you like. Once your dev dependencies have been set up, run `npm install` to download the extra dependencies.

After that, run the `make-sync-function` script on your document definitions to generate the sync function to test. For example:

    node_modules/synctos/make-sync-function /path/to/my-doc-definitions.js /path/to/my-generated-sync-function.js

Next, create a new spec file in your project's `test/` directory (e.g. `test/foobar-spec.js`) and import the test helper module into the empty spec:

    var testHelper = require('../node_modules/synctos/etc/test-helper.js');

Create a new `describe` block to encapsulate the forthcoming test cases and also initialize the synctos test helper before each test case using the `beforeEach` function. For example:

    describe('My new sync function', function() {
      beforeEach(function() {
        testHelper.init('relative/path/to/my-generated-sync-function.js');
      });

      ...
    });

Now you can begin writing specs/test cases inside the `describe` block using the test helper's convenience functions to verify the behaviour of the generated sync function. For example, to verify that a new document passes validation, is authorized with the correct channels and roles for the add operation, and assigns the desired channel access to a list of users:

```
it('can create a myDocType document', function() {
  var doc = {
    _id: 'myDocId',
    type: 'myDocType',
    foo: 'bar',
    bar: -32,
    members: [ 'joe', 'nancy' ]
  }

  testHelper.verifyDocumentCreated(
    doc,
    {
      expectedChannels: [ 'my-add-channel1', 'my-add-channel2' ],
      expectedRoles: [ 'my-add-role' ]
    },
    [
      {
        expectedUsers: function(doc, oldDoc) {
          return doc.members;
        },
        expectedChannels: function(doc, oldDoc) {
          return 'view-' + doc._id;
        }
      }
    ]);
});
```

Or to verify that a document cannot be created because it fails validation:

```
it('cannot create a myDocType doc when required property foo is missing', function() {
  var doc = {
    _id: 'myDocId',
    type: 'myDocType',
    bar: 79
  };

  testHelper.verifyDocumentNotCreated(
    doc,
    'myDocType',
    [ testHelper.validationErrorFormatter.requiredValueViolation('foo') ],
    {
      expectedChannels: [ 'my-add-channel1', 'my-add-channel2' ],
      expectedRoles: [ 'my-add-role' ]
    },
});
```

The `testHelper.validationErrorFormatter` object in the preceding example provides a variety of functions that can be used to specify expected validation error messages. See the `etc/validation-error-message-formatter.js` module in this project for documentation.

You will find many more examples in this project's `test/` directory.

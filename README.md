# Introduction

Synctos: The Syncmaker. A utility to aid with the process of designing well-structured sync functions for Couchbase Sync Gateway.

With this utility, you define all your JSON document types in a declarative JavaScript object format that eliminates much of the boilerplate normally required for [sync functions](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/sync-function-api-guide/index.html) that perform comprehensive validation of document contents and permissions. Not only is it invaluable in protecting the integrity of the documents that are stored in a Sync Gateway database, whenever a document fails validation the sync function will return a detailed error message that makes it easy for a client to figure out exactly what went wrong.

To learn more about Sync Gateway, check out [Couchbase](http://www.couchbase.com/)'s comprehensive [developer documentation](http://developer.couchbase.com/documentation/mobile/current/get-started/sync-gateway-overview/index.html).

# Installation

Synctos is distributed as an [npm](https://www.npmjs.com/) package and has several npm dependencies. As such, it requires that [Node.js](https://nodejs.org/) is installed in order to run.

To add synctos to your project, run `npm install synctos` from the project's root directory to install the package locally. Or, better yet, if you define a package.json in your project, you can run `npm install synctos --savedev` to automatically install locally and insert the package into your package.json's developer dependencies.

For more info on npm package management, see the official npm documentation for [Installing npm packages locally](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) and [Using a \`package.json\`](https://docs.npmjs.com/getting-started/using-a-package.json).

# Usage

### Running

Once synctos is installed, you can run it from your project's directory as follows:

    node_modules/synctos/make-sync-function /path/to/my-document-definitions.js /path/to/my-generated-sync-function.js

This will take the sync document definitions that are defined in `/path/to/my-document-definitions.js` and build a new sync function that is output to `/path/to/my-generated-sync-function.js`. The generated sync function contents can then be inserted into the definition of a bucket/database in a Sync Gateway [configuration file](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/configuring-sync-gateway/config-properties/index.html#story-h2-3) as a multi-line string surrounded with backquotes ( \` ).

Generated sync functions are compatible with all Sync Gateway 1.x versions.

**NOTE**: Due to a [known issue](https://github.com/couchbase/sync_gateway/issues/1866) in Sync Gateway versions up to and including 1.2.1, when specifying a bucket/database's sync function in a configuration file as a multi-line string, you will have to be sure to escape any literal backslash characters in the sync function body. For example, if your sync function contains a regular expression like `new RegExp('\\w+')`, you will have to escape the backslashes when inserting the sync function into the configuration file so that it becomes `new RegExp('\\\\w+')`.

### Definition file

A document definition file contains all the document types that belong to a single Sync Gateway bucket/database. A file can contain either a plain JavaScript object or a JavaScript function that returns the documents' definitions wrapped in an object.

For example, a document definition file implemented as an object:

    {
      myDocType1: {
        channels: {
          view: 'view',
          add: 'add',
          replace: 'change',
          remove: 'delete'
        },
        typeFilter: function(doc, oldDoc) {
          if (oldDoc) {
            return doc.type === oldDoc.type && oldDoc.type === 'myDocType1';
          } else {
            return doc.type === 'myDocType1';
          }
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
          add: 'add',
          replace: 'change',
          remove: 'delete'
        },
        typeFilter: function(doc, oldDoc) {
          if (oldDoc) {
            return doc.type === oldDoc.type && oldDoc.type === 'myDocType2';
          } else {
            return doc.type === 'myDocType2';
          }
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
        add: 'add',
        replace: 'change',
        remove: 'delete'
      };
      var typePropertyValidator = {
        type: 'string',
        required: true
      };

      function makeDocTypeFilter(doc, oldDoc, docType) {
        return function(doc, oldDoc) {
          if (oldDoc) {
            return doc.type === oldDoc.type && oldDoc.type === docType;
          } else {
            return doc.type === docType;
          }
        };
      }

      return {
        myDocType1: {
          channels: sharedChannels,
          typeFilter: makeDocTypeFilter(doc, oldDoc, 'myDocType1'),
          propertyValidators: {
            type: typePropertyValidator,
            myProp1: {
              type: 'integer'
            }
          }
        },
        myDocType2: {
          channels: sharedChannels,
          typeFilter: makeDocTypeFilter(doc, oldDoc, 'myDocType2'),
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

* `channels`: (required) The [channels](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/channels/index.html) to assign to documents of this type. Defined as an object with required `view`, `add`, `replace` and `remove` properties, each of which determines which channel(s) are required to authorize the corresponding action. Each entry may be either an array of channel names or a single channel name as a string. For example:

```
    channels: {
      view: [ 'admin', 'readonly' ],
      add: 'admin',
      replace: 'admin',
      remove: 'admin'
    }
```

* `typeFilter`: (required) A function that is used to identify documents of this type. It accepts as function parameters both (1) the new document and (2) the old document that is being replaced/deleted (if any). For example:

```
    typeFilter: function(doc, oldDoc) {
      if (oldDoc) {
        return doc.type === oldDoc.type && oldDoc.type === 'foo';
      } else {
        return doc.type === 'foo';
      }
    }
```

* `propertyValidators`: (required) An object/hash of validators that specify the format of each of the document type's supported properties. Each entry consists of a key that specifies the property name and a value that specifies the validation to perform on that property. Each element must declare a type and, optionally, some number of additional parameters. Any property that is not declared will be rejected by the sync function. An example:

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

* `allowAttachments`: (optional) Whether to allow the addition of [file attachments](http://developer.couchbase.com/documentation/mobile/current/develop/references/sync-gateway/rest-api/document-public/put-db-doc-attachment/index.html) for the document type. Defaults to `false` to prevent malicious/misbehaving clients from polluting the bucket/database with unwanted files.

* `immutable`: (optional) The document cannot be replaced or deleted after it is created. Note that, even if attachments are allowed for this document type (see the `allowAttachments` parameter for more info), it will not be possible to create, modify or delete attachments in a document that already exists, which means that they must be created inline in the document's `_attachments` property when the document is first created. Defaults to `false`.

##### Validation:

There are a number of validation types that can be used to define each property/element/key's expected format in a document.

Validation for simple data types:

* `string`: The value is a string of characters. Additional parameters:
  * `mustNotBeEmpty`: If `true`, an empty string is not allowed. Defaults to `false`.
  * `regexPattern`: A regular expression pattern that must be satisfied for values to be accepted (e.g. `new RegExp('\\d+')`). Undefined by default.
  * `minimumLength`: The minimum number of characters (inclusive) allowed in the string. Undefined by default.
  * `maximumLength`: The maximum number of characters (inclusive) allowed in the string. Undefined by default.
* `integer`: The value is a number with no fractional component. Additional parameters:
  * `minimumValue`: The smallest (inclusive) value that is allowed. Undefined by default.
  * `maximumValue`: The largest (inclusive) value that is allowed. Undefined by default.
* `float`: The value is a number with an optional fractional component (i.e. it is either an integer or a floating point number). Additional parameters:
  * `minimumValue`: The smallest (inclusive) value that is allowed. Undefined by default.
  * `maximumValue`: The largest (inclusive) value that is allowed. Undefined by default.
* `boolean`: The value is either `true` or `false`. No additional parameters.
* `datetime`: The value is an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date string with optional time and time zone components (e.g. "2016-06-18T18:57:35.328-08:00"). Additional parameters:
  * `minimumValue`: The earliest (inclusive) date/time that is allowed. If the value of this parameter or the property value to which it is to be applied are missing their time and time zone components, they will default to midnight UTC of the date in question. No restriction by default.
  * `maximumValue`: The latest (inclusive) date/time that is allowed. If the value of this parameter or the property value to which it is to be applied are missing their time and time zone components, they will default to midnight UTC of the date in question. No restriction by default.
* `date`: The value is an ISO 8601 date string _without_ time and time zone components (e.g. "2016-06-18"). Additional parameters:
  * `minimumValue`: The earliest (inclusive) date that is allowed. No restriction by default.
  * `maximumValue`: The latest (inclusive) date that is allowed. No restriction by default.
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
  * `propertyValidators`: An object/hash of validators to be applied to the properties that are supported by the object. Any validation type, including those for complex data types, may be used for each property validator. Undefined by default. If defined, then any property that is not declared will be rejected by the sync function. An example:

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
* `immutable`: The item cannot be changed from its existing value if the document is being replaced. Applied recursively so that, even if a value that is nested an arbitrary number of levels deep within an immutable complex type is modified, the document change will be rejected. Does not apply when creating a new document or deleting an existing document. Defaults to `false`.
* `customValidation`: A function that accepts as parameters (1) the new document, (2) the old document that is being replaced/deleted (if any), (3) an object that contains metadata about the current item to validate and (4) a stack of the items (e.g. object properties, array elements, hashtable element values) that have gone through validation, where the last/top element contains metadata for the direct parent of the item currently being validated and the first/bottom element is metadata for the root (i.e. the document). Generally, custom validation should not throw exceptions; it's recommended to return an array/list of error descriptions so the sync function can compile a list of all validation errors that were encountered once full validation is complete. A return value of `null`, `undefined` or an empty array indicate there were no validation errors. An example:

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

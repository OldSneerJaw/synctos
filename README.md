# Introduction

[![Build Status](https://travis-ci.org/Kashoo/synctos.svg?branch=master)](https://travis-ci.org/Kashoo/synctos)
[![npm version](https://badge.fury.io/js/synctos.svg)](https://www.npmjs.com/package/synctos)
[![dependencies Status](https://david-dm.org/Kashoo/synctos/master/status.svg)](https://david-dm.org/Kashoo/synctos/master)
[![devDependencies Status](https://david-dm.org/Kashoo/synctos/master/dev-status.svg)](https://david-dm.org/Kashoo/synctos/master?type=dev)

Synctos: The Syncmaker. A utility to aid with the process of designing well-structured sync functions for Couchbase Sync Gateway.

With this utility, you define all your JSON document types in a declarative JavaScript object format that eliminates much of the boilerplate normally required for [sync functions](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/sync-function-api-guide/index.html) with comprehensive validation of document contents and permissions. Not only is it invaluable in protecting the integrity of the documents that are stored in a Sync Gateway database, whenever a document fails validation, sync functions generated with synctos return specific, detailed error messages that make it easy for a client app developer to figure out exactly what went wrong. An included test fixture module also provides a simple framework to write unit tests for generated sync functions.

To learn more about Sync Gateway, check out [Couchbase](http://www.couchbase.com/)'s comprehensive [developer documentation](http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/index.html). And, for a comprehensive introduction to synctos, see the post [Validating your Sync Gateway documents with synctos](https://blog.couchbase.com/validating-your-sync-gateway-documents-with-synctos/) on the official Couchbase blog.

For validation of documents in Apache CouchDB, see the [couchster](https://github.com/OldSneerJaw/couchster) project.

# Table of Contents

- [Introduction](#introduction)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
    - [Running](#running)
    - [Validating](#validating)
    - [Specifications](#specifications)
      - [Document type definitions](#document-type-definitions)
        - [Essential document constraints](#essential-document-constraints)
        - [Advanced document constraints](#advanced-document-constraints)
      - [Content validation](#content-validation)
        - [Simple type validation](#simple-type-validation)
        - [Complex type validation](#complex-type-validation)
        - [Multi-type validation](#multi-type-validation)
        - [Universal validation constraints](#universal-validation-constraints)
        - [Predefined validators](#predefined-validators)
        - [Dynamic constraint validation](#dynamic-constraint-validation)
    - [Definition file](#definition-file)
      - [Modularity](#modularity)
    - [Helper functions](#helper-functions)
- [Testing](#testing)

# Installation

Synctos is distributed as an [npm](https://www.npmjs.com/) package, and the minimum version of [Node.js](https://nodejs.org/) that it officially supports is v8.9.0. Both of these required components can be acquired at once by [installing](https://nodejs.org/en/download/package-manager/) Node.js.

If your project does not already have an npm `package.json` file, run `npm init` to create one. Don't worry too much about the answers to the questions it asks right now; the file it produces can be updated as needed later.

Next, to install synctos locally (i.e. in your project's `node_modules` directory) and to add it to your project as a development dependency automatically, run `npm install synctos --save-dev` from the project's root directory.

For more info on npm package management, see the official npm documentation for [How to install local packages](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) and [Working with package.json](https://docs.npmjs.com/getting-started/using-a-package.json).

**A note on JavaScript/ECMAScript compatibility:**

Sync Gateway uses the [otto](https://github.com/robertkrimen/otto) JavaScript engine to execute sync functions from within its [Go](https://golang.org/) codebase. The version of otto, and thus the version of ECMAScript, that are supported varies depending on the version of Sync Gateway:

* Sync Gateway 1.x is pinned to commit [5282a5a](https://github.com/robertkrimen/otto/tree/5282a5a45ba989692b3ae22f730fa6b9dd67662f) of otto, which does not support any of the features introduced in ECMAScript 2015 (aka ES6/ES2015). In fact, it does not promise compatibility with ECMAScript 5, offering only that "For now, otto is a hybrid ECMA3/ECMA5 interpreter. Parts of the specification are still works in progress."
* Sync Gateway 2.x is pinned to commit [a813c59](https://github.com/robertkrimen/otto/tree/a813c59b1b4471ff7ecd3b533bac2f7e7d178784) of otto, which also does not support any of the features introduced in ECMAScript 2015, but it does at least offer full compatibility with ECMAScript 5, aside from a handful of [noted](https://github.com/robertkrimen/otto/tree/a813c59b1b4471ff7ecd3b533bac2f7e7d178784#regular-expression-incompatibility) RegExp incompatibilities.

It is for compatibility with these specific versions of otto that synctos intentionally generates code that does not make use of many of the conveniences of modern JavaScript (e.g. `let`, `const`, `for...of` loops, arrow functions, spread operators, etc.). For the same reason, it is always best to verify sync functions that are generated by synctos or otherwise within a live instance of Sync Gateway before deploying to production to ensure that your own custom code is supported by the corresponding version of the otto JS interpreter.

As a convenience, otto - and, by extension, Sync Gateway - does support the [Underscore.js](http://underscorejs.org/) utility belt library (specifically version [1.4.4](https://cdn.rawgit.com/jashkenas/underscore/1.4.4/index.html)), which provides a great many useful functions. As such, it may help to fill in some of the gaps that would otherwise be filled by a newer version of the ECMAScript specification.

# Usage

### Running

Once synctos is installed, you can run it from your project's directory as follows:

```bash
node_modules/.bin/synctos /path/to/my-document-definitions.js /path/to/my-generated-sync-function.js
```

Or as a custom [script](https://docs.npmjs.com/misc/scripts) in your project's `package.json` as follows:

```javascript
"scripts": {
  "build": "synctos /path/to/my-document-definitions.js /path/to/my-generated-sync-function.js"
}
```

This will take the sync document definitions that are defined in `/path/to/my-document-definitions.js` and build a new sync function that is output to `/path/to/my-generated-sync-function.js`. The generated sync function contents can then be inserted into the definition of a bucket/database in a Sync Gateway [configuration file](http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/config-properties/index.html#configuration-files) as a multi-line string surrounded with backquotes/backticks ( \` ).

Generated sync functions are compatible with Sync Gateway 1.x and 2.x.

**NOTE**: Due to a [known issue](https://github.com/couchbase/sync_gateway/issues/1866) in Sync Gateway versions up to and including 1.2.1, when specifying a bucket/database's sync function in a configuration file as a multi-line string, you will have to be sure to escape any literal backslash characters in the sync function body. For example, if your sync function contains a regular expression like `new RegExp('\\w+')`, you will have to escape the backslashes when inserting the sync function into the configuration file so that it becomes `new RegExp('\\\\w+')`. The issue has been resolved in Sync Gateway version 1.3.0 and later.

### Validating

To validate that your document definitions file is structured correctly and does not contain any obvious semantic violations, execute the built in validation script as follows:

```bash
node_modules/.bin/synctos-validate /path/to/my-document-definitions.js
```

Or as a custom [script](https://docs.npmjs.com/misc/scripts) in your project's `package.json` as follows:

```javascript
"scripts": {
  "validate": "synctos-validate /path/to/my-document-definitions.js"
}
```

If the specified document definitions contain any violations, the utility will exit with a non-zero status code and output a list of the violations to standard error (stderr). Otherwise, if validation was successful, the utility will exit normally and will not output anything.

Be aware that the validation utility cannot verify the behaviour of custom functions (e.g. dynamic constraints, custom actions, custom validation functions) in a document definition. However, the [Testing](#testing) section of the README describes how to write test cases for such custom code.

### Specifications

Document definitions must conform to the following specification. See the `samples/` directory and Kashoo's official [document definitions](https://github.com/Kashoo/kashoo-document-definitions) repository for some examples.

At the top level, the document definitions object contains a property for each document type that is to be supported by the Sync Gateway bucket. For example:

```javascript
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
```

#### Document type definitions

Each document type is defined as an object with a number of properties that control authorization, content validation and access control.

##### Essential document constraints

The following properties include the basics necessary to build a document definition:

* `typeFilter`: (required) A function that is used to identify documents of this type. It accepts as function parameters (1) the new document, (2) the old document that is being replaced (if any) and (3) the name of the current document type. For the sake of convenience, a simple type filter function (`simpleTypeFilter`) is available that attempts to match the document's `type` property value to the document type's name (e.g. if a document definition is named "message", then a candidate document's `type` property value must be "message" to be considered a document of that type); if the document definition does not include an explicit `type` property validator, then, for convenience, the `type` property will be implicitly included in the document definition and validated with the built in `typeIdValidator` (see the validator's description for more info). NOTE: In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, so be sure to account for such cases. And, if the old document has been deleted or simply does not exist, the second parameter will be `null`.

An example of the simple type filter:

```javascript
typeFilter: simpleTypeFilter
```

And an example of a more complex custom type filter:

```javascript
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
    var docIdRegex = /^message\.[A-Za-z0-9_-]+$/;

    return docIdRegex.test(doc._id);
  }
}
```

* `channels`: (required if `authorizedRoles` and `authorizedUsers` are undefined - see the [Advanced document properties](#advanced-document-properties) section for more info) The [channels](http://developer.couchbase.com/documentation/mobile/current/develop/guides/sync-gateway/channels/index.html) to assign to documents of this type. If used in combination with the `authorizedRoles` and/or `authorizedUsers` properties, authorization will be granted if the user making the modification matches at least one of the channels and/or authorized roles/usernames for the corresponding operation type (add, replace or remove). May be specified as either a plain object or a function that returns a dynamically-constructed object and accepts as parameters (1) the new document and (2) the old document that is being replaced (if any). NOTE: In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, and if the old document has been deleted or simply does not exist, the second parameter will be `null`. Either way the object is specified, it may include the following properties, each of which may be either an array of channel names or a single channel name as a string:
  * `view`: (optional) The channel(s) that confer read-only access to documents of this type.
  * `add`: (required if `write` is undefined) The channel(s) that confer the ability to create new documents of this type. Any user with a matching channel also gains implicit read access. Use the [special channel](https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/channels/index.html#special-channels) "!" to allow any authenticated user to add a document of this type.
  * `replace`: (required if `write` is undefined) The channel(s) that confer the ability to replace existing documents of this type. Any user with a matching channel also gains implicit read access. Use the special channel "!" to allow any authenticated user to replace a document of this type.
  * `remove`: (required if `write` is undefined) The channel(s) that confer the ability to delete documents of this type. Any user with a matching channel also gains implicit read access. Use the special channel "!" to allow any authenticated user to delete a document of this type.
  * `write`: (required if one or more of `add`, `replace` or `remove` are undefined) The channel(s) that confer the ability to add, replace or remove documents of this type. Exists as a convenience in cases where the add, replace and remove operations should share the same channel(s). Any user with a matching channel also gains implicit read access. Use the special channel "!" to allow any authenticated user to write a document of this type.

For example:

```javascript
channels: {
  add: [ 'create', 'new' ],
  replace: 'update',
  remove: 'delete'
}
```

Or:

```javascript
channels: function(doc, oldDoc) {
  return {
    view: doc._id + '-readonly',
    write: [ doc._id + '-edit', doc._id + '-admin' ]
  };
}
```

* `propertyValidators`: (required) An object/hash of validators that specify the format of each of the document type's supported properties. Each entry consists of a key that specifies the property name and a value that specifies the validation to perform on that property. Each property element must declare a type and, optionally, some number of additional parameters. Any property that is not declared here will be rejected by the sync function unless the `allowUnknownProperties` field is set to `true`. In addition to a static value (e.g. `propertyValidators: { ... }`), this property may also be assigned a value dynamically via a function (e.g. `propertyValidators: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist).

An example static definition:

```javascript
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

And a dynamic definition:

```javascript
propertyValidators: function(doc, oldDoc) {
  var dynamicProp = (doc._id.indexOf('foobar') >= 0) ? { type: 'string' } : { type: 'float' }

  return {
    myDynamicProp: dynamicProp
  };
}
```

##### Advanced document constraints

Additional properties that provide finer grained control over documents:

* `allowUnknownProperties`: (optional) Whether to allow the existence of properties that are not explicitly declared in the document type definition. Not applied recursively to objects that are nested within documents of this type. In addition to a static value (e.g. `allowUnknownProperties: true`), this property may also be assigned a value dynamically via a function (e.g. `allowUnknownProperties: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Defaults to `false`.
* `documentIdRegexPattern`: (optional) A [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) pattern that must be satisfied by the document's ID for a new document of this type to be created. Note that the constraint is not applied when a document is being replaced or deleted. In addition to a static value (e.g. `documentIdRegexPattern: /^payment\.[a-zA-Z0-9_-]+$/`), this constraint may also be assigned a value dynamically via a function (e.g. `documentIdRegexPattern: function(doc) { ... }`) where it receives a single parameter as follows: (1) the new document. No restriction by default.
* `immutable`: (optional) The document cannot be replaced or deleted after it is created. Note that, when this property is enabled, even if attachments are allowed for this document type (see the `allowAttachments` parameter for more info), it will not be possible to create, modify or delete attachments in a document that already exists, which means that they must be created inline in the document's `_attachments` property when the document is first created. In addition to a static value (e.g. `immutable: true`), this property may also be assigned a value dynamically via a function (e.g. `immutable: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Defaults to `false`.
* `cannotReplace`: (optional) As with the `immutable` constraint, the document cannot be replaced after it is created. However, this constraint does not prevent the document from being deleted. Note that, even if attachments are allowed for this document type (see the `allowAttachments` parameter for more info), it will not be possible to create, modify or delete attachments in a document that already exists, which means that they must be created inline in the document's `_attachments` property when the document is first created. In addition to a static value (e.g. `cannotReplace: true`), this property may also be assigned a value dynamically via a function (e.g. `cannotReplace: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Defaults to `false`.
* `cannotDelete`: (optional) As with the `immutable` constraint, the document cannot be deleted after it is created. However, this constraint does not prevent the document from being replaced. In addition to a static value (e.g. `cannotDelete: true`), this property may also be assigned a value dynamically via a function (e.g. `cannotDelete: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Defaults to `false`.
* `authorizedRoles`: (required if `channels` and `authorizedUsers` are undefined) The [roles](http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/authorizing-users/index.html#roles) that are authorized to add, replace and remove documents of this type. If used in combination with the `channels` and/or `authorizedUsers` properties, authorization will be granted if the user making the modification matches at least one of the roles and/or authorized channels/usernames for the corresponding operation type (add, replace or remove). May be specified as either a plain object or a function that returns a dynamically-constructed object and accepts as parameters (1) the new document and (2) the old document that is being replaced (if any). NOTE: In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, and if the old document has been deleted or simply does not exist, the second parameter will be `null`. Either way the object is specified, it may include the following properties, each of which may be either an array of role names or a single role name as a string:
  * `add`: (optional) The role(s) that confer the ability to create new documents of this type.
  * `replace`: (optional) The role(s) that confer the ability to replace existing documents of this type.
  * `remove`: (optional) The role(s) that confer the ability to delete documents of this type.
  * `write`: (optional) The role(s) that confer the ability to add, replace or remove documents of this type. Exists as a convenience in cases where the add, replace and remove operations should share the same role(s).

For example:

```javascript
authorizedRoles: {
  add: 'manager',
  replace: [ 'manager', 'employee' ],
  remove: 'manager'
}
```

Or:

```javascript
authorizedRoles: function(doc, oldDoc) {
  return {
    write: oldDoc ? oldDoc.roles : doc.roles
  };
}
```

* `authorizedUsers`: (required if `channels` and `authorizedRoles` are undefined) The names of [users](http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/authorizing-users/index.html#authorizing-users) that are explicitly authorized to add, replace and remove documents of this type. If used in combination with the `channels` and/or `authorizedRoles` properties, authorization will be granted if the user making the modification matches at least one of the usernames and/or authorized channels/roles for the corresponding operation type (add, replace or remove). May be specified as either a plain object or a function that returns a dynamically-constructed object and accepts as parameters (1) the new document and (2) the old document that is being replaced (if any). NOTE: In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, and if the old document has been deleted or simply does not exist, the second parameter will be `null`. Either way the object is specified, it may include the following properties, each of which may be either an array of usernames or a single username as a string:
  * `add`: (optional) The user(s) that have the ability to create new documents of this type.
  * `replace`: (optional) The user(s) that have the ability to replace existing documents of this type.
  * `remove`: (optional) The user(s) that have the ability to delete documents of this type.
  * `write`: (optional) The user(s) that have the ability to add, replace or remove documents of this type. Exists as a convenience in cases where the add, replace and remove operations should share the same user(s).

For example:

```javascript
authorizedUsers: {
  add: [ 'sally', 'roger', 'samantha' ],
  replace: [ 'roger', 'samantha' ],
  remove: 'samantha'
}
```

Or:

```javascript
authorizedUsers: function(doc, oldDoc) {
  return {
    write: oldDoc ? oldDoc.users : doc.users
  };
}
```

* `accessAssignments`: (optional) Defines either the channel access to assign to users/roles or the role access to assign to users when a document of the corresponding type is successfully created or replaced. The constraint can be defined as either a list, where each entry is an object that defines `users`, `roles` and/or `channels` properties, depending on the access assignment type, or it can be defined dynamically as a function that accepts the following parameters: (1) the new document and (2) the old document that is being replaced/deleted (if any). NOTE: If the old document has been deleted or simply does not exist, the second parameter will be `null`. When a document that included access assignments is deleted, its access assignments will be revoked. The assignment types are specified as follows:
  * Channel access assignments:
    * `type`: May be either "channel", `null` or missing/`undefined`.
    * `channels`: An array of channel names to assign to users and/or roles.
    * `roles`: An array of role names to which to assign the channels.
    * `users`: An array of usernames to which to assign the channels.
  * Role access assignments:
    * `type`: Must be "role".
    * `roles`: An array of role names to assign to users.
    * `users`: An array of usernames to which to assign the roles.

An example of a static mix of channel and role access assignments:

```javascript
accessAssignments: [
  {
    type: 'role',
    users: [ 'user3', 'user4' ],
    roles: [ 'role1', 'role2' ]
  },
  {
    type: 'channel',
    users: [ 'user1', 'user2' ],
    channels: [ 'channel1' ]
  },
  {
    type: 'channel',
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

And an example of dynamic channel and role access assignments:

```javascript
accessAssignments: function(doc, oldDoc) {
  var accessAssignments = [ ];

  if (doc.channels) {
    accessAssignments.push(
      {
        type: 'channel',
        channels: doc.channels,
        roles: doc.channelRoles,
        users: doc.channelUsers
      });
  }

  if (doc.roles) {
    accessAssignments.push(
      {
        type: 'role',
        roles: doc.roles,
        users: doc.roleUsers
      });
  }

  return assignments;
}
```

* `allowAttachments`: (optional) Whether to allow the addition of [file attachments](http://developer.couchbase.com/documentation/mobile/current/references/sync-gateway/rest-api/index.html#!/attachment/put_db_doc_attachment) for the document type. In addition to a static value (e.g. `allowAttachments: true`), this property may also be assigned a value dynamically via a function (e.g. `allowAttachments: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Defaults to `false` to prevent malicious/misbehaving clients from polluting the bucket/database with unwanted files. See the `attachmentConstraints` property and the `attachmentReference` validation type for more options.
* `attachmentConstraints`: (optional) Various constraints to apply to file attachments associated with a document type. Its settings only apply if the document definition's `allowAttachments` property is `true`. In addition to a static value (e.g. `attachmentConstraints: { }`), this property may also be assigned a value dynamically via a function (e.g. `attachmentConstraints: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Additional parameters:
  * `maximumAttachmentCount`: (optional) The maximum number of attachments that may be assigned to a single document of this type. In addition to a static value (e.g. `maximumAttachmentCount: 2`), this property may also be assigned a value dynamically via a function (e.g. `maximumAttachmentCount: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Unlimited by default.
  * `maximumIndividualSize`: (optional) The maximum file size, in bytes, allowed for any single attachment assigned to a document of this type. May not be greater than 20MB (20,971,520 bytes), as Couchbase Server/Sync Gateway sets that as the hard limit per document or attachment. In addition to a static value (e.g. `maximumIndividualSize: 256`), this property may also be assigned a value dynamically via a function (e.g. `maximumIndividualSize: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Unlimited by default.
  * `maximumTotalSize`: (optional) The maximum total size, in bytes, of _all_ attachments assigned to a single document of this type. In other words, when the sizes of all of a document's attachments are added together, it must not exceed this value. In addition to a static value (e.g. `maximumTotalSize: 1024`), this property may also be assigned a value dynamically via a function (e.g. `maximumTotalSize: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Unlimited by default.
  * `supportedExtensions`: (optional) An array of case-insensitive file extensions that are allowed for an attachment's filename (e.g. "txt", "jpg", "pdf"). In addition to a static value (e.g. `supportedExtensions: [ 'png', 'gif', 'jpg' ]`), this property may also be assigned a value dynamically via a function (e.g. `supportedExtensions: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). No restriction by default.
  * `supportedContentTypes`: (optional) An array of content/MIME types that are allowed for an attachment's contents (e.g. "image/png", "text/html", "application/xml"). In addition to a static value (e.g. `supportedContentTypes: [ 'image/png', 'image/gif', 'image/jpeg' ]`), this property may also be assigned a value dynamically via a function (e.g. `supportedContentTypes: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). No restriction by default.
  * `requireAttachmentReferences`: (optional) Whether every one of a document's attachments must have a corresponding `attachmentReference`-type property referencing it. In addition to a static value (e.g. `requireAttachmentReferences: true`), this property may also be assigned a value dynamically via a function (e.g. `requireAttachmentReferences: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). Defaults to `false`.
  * `filenameRegexPattern`: (optional) A regular expression pattern that must be satisfied by each attachment's filename. In addition to a static value (e.g. `filenameRegexPattern: /^foo|bar$/`), this property may also be assigned a value dynamically via a function (e.g. `filenameRegexPattern: function(doc, oldDoc) { ... }`) where the parameters are as follows: (1) the document (if deleted, the `_deleted` property will be `true`) and (2) the document that is being replaced (if any; it will be `null` if it has been deleted or does not exist). No restriction by default.
* `expiry`: (optional) Specifies when documents of this type will [expire](https://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html#expiry-value) and subsequently get purged from the database. The constraint is only applied when a document is created or replaced. NOTE: This constraint is only supported by Sync Gateway 2.0 and later and, furthermore, it is not supported when using a [Walrus](https://developer.couchbase.com/documentation/mobile/current/installation/sync-gateway/index.html#walrus-mode) database. The constraint's value may be specified in one of the following ways:
  * an integer whose value is greater than 2,592,000 (i.e. the number of seconds in 30 days), indicating an absolute point in time as the number of seconds since the Unix epoch (1970-01-01T00:00Z)
  * an integer whose value is at most 2,592,000 (i.e. the number of seconds in 30 days), indicating a relative offset as the number of seconds in the future
  * a string in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date and time format. Unlike for other constraints that accept a date/time string, this constraint does not consider any component of the date to be optional. In other words, the string must include year, month, day, hour, minute, second and time zone offset (e.g. "2018-04-22T14:47:35-07:00").
  * a JavaScript [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object
  * a function that accepts as parameters (1) the new document and (2) the old document that is being replaced (if any; it will be `null` if it has been deleted or does not exist) and returns any of the aforementioned results
* `customActions`: (optional) Defines custom actions to be executed at various events during the generated sync function's execution. Specified as an object where each property specifies a JavaScript function to be executed when the corresponding event is completed. In each case, the function accepts as parameters (1) the new document, (2) the old document that is being replaced/deleted (if any) and (3) an object that is populated with metadata generated by each event. In cases where the document is in the process of being deleted, the first parameter's `_deleted` property will be `true`, so be sure to account for such cases. If the document does not yet exist, the second parameter will be `null` and, in some cases where the document previously existed (i.e. it was deleted), the second parameter _may_ be non-null and its `_deleted` property will be `true`. At each stage of the generated sync function's execution, the third parameter (the custom action metadata parameter) is augmented with properties that provide additional context to the custom action being executed. Custom actions may call functions from the [standard sync function API](http://developer.couchbase.com/documentation/mobile/current/guides/sync-gateway/sync-function-api-guide/index.html) (e.g. `requireAccess`, `requireRole`, `requireUser`, `access`, `role`, `channel`) and may indicate errors via the `throw` statement to prevent the document from being written. The custom actions that are available, in the order their corresponding events occur:
  1. `onTypeIdentificationSucceeded`: Executed immediately after the document's type is determined and before checking authorization. The custom action metadata object parameter contains the following properties:
    * `documentTypeId`: The unique ID of the document type.
    * `documentDefinition`: The full definition of the document type.
  2. `onAuthorizationSucceeded`: Executed immediately after the user is authorized to make the modification and before validating document contents. Not executed if user authorization is denied. The custom action metadata object parameter includes properties from all previous events in addition to the following properties:
    * `authorization`: An object that indicates which channels, roles and users were used to authorize the current operation, as specified by the `channels`, `roles` and `users` list properties.
  3. `onValidationSucceeded`: Executed immediately after the document's contents are validated and before channels are assigned to users/roles and the document. Not executed if the document's contents are invalid. The custom action metadata object parameter includes properties from all previous events but does not include any additional properties.
  4. `onAccessAssignmentsSucceeded`: Executed immediately after channel access is assigned to users/roles and before document expiry is set. Not executed if the document definition does not include an `accessAssignments` constraint. The custom action metadata object parameter includes properties from all previous events in addition to the following properties:
    * `accessAssignments`: A list that contains each of the access assignments that were applied. Each element is an object that represents either a channel access assignment or a role access assignment depending on the value of its `type` property. The assignment types are specified as follows:
      * Channel access assignments:
        * `type`: Value of "channel".
        * `channels`: A list of channels that were assigned to the users/roles.
        * `usersAndRoles`: A list of the combined users and/or roles to which the channels were assigned. Note that, as per the sync function API, each role element's value is prefixed with "role:".
      * Role access assignments:
        * `type`: Value of "role".
        * `roles`: A list of roles that were assigned to the users.
        * `users`: A list of users to which the roles were assigned. Note that, as per the sync function API, each role element's value is prefixed with "role:".
  6. `onExpiryAssignmentSucceeded`: Executed immediately after document [expiry](https://developer.couchbase.com/documentation/mobile/2.0/guides/sync-gateway/sync-function-api-guide/index.html#expiry-value) is set and before channels are assigned to the document. Not executed if the document definition does not include an `expiry` constraint. NOTE: Only supported by Sync Gateway 2.0 and later. The custom action metadata object parameter includes properties from all previous events in addition to the following properties:
    * `expiryDate`: A JavaScript `Date` object that specifies the absolute point in time at which the document will expire and be purged from the database.
  7. `onDocumentChannelAssignmentSucceeded`: Executed immediately after channels are assigned to the document. The last step before the sync function is finished executing and the document revision is written. The custom action metadata object parameter includes properties from all previous events in addition to the following properties:
    * `documentChannels`: A list of channels that were assigned to the document.

An example of an `onAuthorizationSucceeded` custom action that stores a property in the metadata object parameter for later use by the `onDocumentChannelAssignmentSucceeded` custom action:

```javascript
customActions: {
  onAuthorizationSucceeded: function(doc, oldDoc, customActionMetadata) {
    var extraChannel = customActionMetadata.documentTypeId + '-modify';
    if (oldDoc && !oldDoc._deleted) {
      // If the document is being replaced or deleted, ensure the user has the document type's "-modify" channel in addition to one of
      // the channels from the document definition's "channels" property that was already authorized
      requireAccess(extraChannel);
    }

    // Store the extra modification validation channel name for future use
    customActionMetadata.extraModifyChannel = extraChannel;
  },
  onDocumentChannelAssignmentSucceeded: function(doc, oldDoc, customActionMetadata) {
    // Ensure the extra modification validation channel is also assigned to the document
    channel(customActionMetadata.extraModifyChannel);
  }
}
```

#### Content validation

There are a number of validation types that can be used to define each property/element/key's expected format in a document.

##### Simple type validation

Validation for simple data types (e.g. integers, floating point numbers, strings, dates/times, etc.):

* `string`: The value is a string of characters. Additional parameters:
  * `mustNotBeEmpty`: If `true`, an empty string is not allowed. Defaults to `false`.
  * `mustBeTrimmed`: If `true`, a string that has leading or trailing whitespace characters is not allowed. Defaults to `false`.
  * `regexPattern`: A regular expression pattern that must be satisfied for values to be accepted (e.g. `new RegExp('\\d+')` or `/[A-Za-z]+/`). No restriction by default.
  * `minimumLength`: The minimum number of characters (inclusive) allowed in the string. No restriction by default.
  * `maximumLength`: The maximum number of characters (inclusive) allowed in the string. No restriction by default.
  * `minimumValue`: Reject strings with an alphanumeric sort order that is less than this. No restriction by default.
  * `minimumValueExclusive`: Reject strings with an alphanumeric sort order that is less than or equal to this. No restriction by default.
  * `maximumValue`: Reject strings with an alphanumeric sort order that is greater than this. No restriction by default.
  * `maximumValueExclusive`: Reject strings with an alphanumeric sort order that is greater than or equal to this. No restriction by default.
  * `mustEqualIgnoreCase`: The item's value must be equal to the specified value, ignoring differences in case. For example, `"CAD"` and `"cad"` would be considered equal by this constraint. No restriction by default.
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
* `datetime`: The value is a simplified [ECMAScript ISO 8601](https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15) date string with optional time and time zone components (e.g. "2016-06-18T18:57:35.328-08:00"). If both time and time zone are omitted, the time is assumed to be midnight UTC. If a time is provided but the time zone is omitted, the time zone is assumed to be the Sync Gateway server's local time zone. Additional parameters:
  * `minimumValue`: Reject date/times that are less than this. May be either an ECMAScript ISO 8601 date string with optional time and time zone components OR a JavaScript [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object. No restriction by default.
  * `minimumValueExclusive`: Reject date/times that are less than or equal to this. May be either an ECMAScript ISO 8601 date string with optional time and time zone components OR a JavaScript `Date` object. No restriction by default.
  * `maximumValue`: Reject date/times that are greater than this. May be either an ECMAScript ISO 8601 date string with optional time and time zone components OR a JavaScript `Date` object. No restriction by default.
  * `maximumValueExclusive`: Reject date/times that are greater than or equal to this. May be either an ECMAScript ISO 8601 date string with optional time and time zone components OR a JavaScript `Date` object. No restriction by default.
* `date`: The value is a simplified [ECMAScript ISO 8601](https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15) date string _without_ time and time zone components (e.g. "2016-06-18"). For the purposes of date comparisons (e.g. by way of the `minimumValue`, `maximumValue`, etc. parameters), the time is assumed to be midnight UTC. Additional parameters:
  * `minimumValue`: Reject dates that are less than this. May be either an ECMAScript ISO 8601 date string without time and time zone components OR a JavaScript `Date` object. No restriction by default.
  * `minimumValueExclusive`: Reject dates that are less than or equal to this. May be either an ECMAScript ISO 8601 date string without time and time zone components OR a JavaScript `Date` object. No restriction by default.
  * `maximumValue`: Reject dates that are greater than this. May be either an ECMAScript ISO 8601 date string without time and time zone components OR a JavaScript `Date` object. No restriction by default.
  * `maximumValueExclusive`: Reject dates that are greater than or equal to this. May be either an ECMAScript ISO 8601 date string without time and time zone components OR a JavaScript `Date` object. No restriction by default.
* `time`: The value is a simplified [ECMAScript ISO 8601](https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15) time string _without_ date and time zone components (e.g. "18:57:35.328"). Additional parameters:
  * `minimumValue`: Reject times that are less than this. Must be an ECMAScript ISO 8601 time string without date and time zone components.
  * `minimumValueExclusive`: Reject times that are less than or equal to this. Must be an ECMAScript ISO 8601 time string without date and time zone components.
  * `maximumValue`: Reject times that are greater than this. Must be an ECMAScript ISO 8601 time string without date and time zone components.
  * `maximumValueExclusive`: Reject times that are greater than or equal to this. Must be an ECMAScript ISO 8601 time string without date and time zone components.
* `timezone`: The value is a simplified [ECMAScript ISO 8601](https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15) time zone string _without_ date and zone components (e.g. "Z" or "-05:00"). Additional parameters:
  * `minimumValue`: Reject time zones that are less than this. Must be an ECMAScript ISO 8601 time zone string.
  * `minimumValueExclusive`: Reject time zones that are less than or equal to this. Must be an ECMAScript ISO 8601 time zone string.
  * `maximumValue`: Reject time zones that are greater than this. Must be an ECMAScript ISO 8601 time zone string.
  * `maximumValueExclusive`: Reject time zones that are greater than or equal to this. Must be an ECMAScript ISO 8601 time zone string.
* `enum`: The value must be one of the specified predefined string and/or integer values. Additional parameters:
  * `predefinedValues`: A list of strings and/or integers that are to be accepted. If this parameter is omitted from an `enum` property's configuration, that property will not accept a value of any kind. For example: `[ 1, 2, 3, 'a', 'b', 'c' ]`
* `uuid`: The value must be a string representation of a [universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) (UUID). A UUID may contain either uppercase or lowercase letters so that, for example, both "1511fba4-e039-42cc-9ac2-9f2fa29eecfc" and "DFF421EA-0AB2-45C9-989C-12C76E7282B8" are valid. Additional parameters:
  * `minimumValue`: Reject UUIDs that are less than this. No restriction by default.
  * `minimumValueExclusive`: Reject UUIDs that are less than or equal to this. No restriction by default.
  * `maximumValue`: Reject UUIDs that are greater than this. No restriction by default.
  * `maximumValueExclusive`: Reject UUIDs that are greater than or equal to this. No restriction by default.
* `attachmentReference`: The value is the name of one of the document's file attachments. Note that, because the addition of an attachment is often a separate Sync Gateway API operation from the creation/replacement of the associated document, this validation type is only applied if the attachment is actually present in the document. However, since the sync function is run twice in such situations (i.e. once when the _document_ is created/replaced and once when the _attachment_ is created/replaced), the validation will be performed eventually. The top-level `allowAttachments` property should be `true` so that documents of this type can actually store attachments. Additional parameters:
  * `supportedExtensions`: An array of case-insensitive file extensions that are allowed for the attachment's filename (e.g. "txt", "jpg", "pdf"). Takes precedence over the document-wide `supportedExtensions` constraint for the referenced attachment. No restriction by default.
  * `supportedContentTypes`: An array of content/MIME types that are allowed for the attachment's contents (e.g. "image/png", "text/html", "application/xml"). Takes precedence over the document-wide `supportedContentTypes` constraint for the referenced attachment. No restriction by default.
  * `maximumSize`: The maximum file size, in bytes, of the attachment. May not be greater than 20MB (20,971,520 bytes), as Couchbase Server/Sync Gateway sets that as the hard limit per document or attachment. Takes precedence over the document-wide `maximumIndividualSize` constraint for the referenced attachment. Unlimited by default.
  * `regexPattern`: A regular expression pattern that must be satisfied by the value. Takes precedence over the document-wide `attachmentConstraints.filenameRegexPattern` constraint for the referenced attachment. No restriction by default.

##### Complex type validation

Validation for complex data types (e.g. objects, arrays, hashtables):

* `array`: An array/list of elements. Additional parameters:
  * `mustNotBeEmpty`: If `true`, an array with no elements is not allowed. Defaults to `false`.
  * `minimumLength`: The minimum number of elements (inclusive) allowed in the array. Undefined by default.
  * `maximumLength`: The maximum number of elements (inclusive) allowed in the array. Undefined by default.
  * `arrayElementsValidator`: The validation that is applied to each element of the array. Any validation type, including those for complex data types, may be used. Undefined by default. An example:

```javascript
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

```javascript
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
  * `minimumSize`: The minimum number of elements allowed in the hashtable. Unconstrained by default.
  * `maximumSize`: The maximum number of elements allowed in the hashtable. Unconstrained by default.
  * `hashtableKeysValidator`: The validation that is applied to each of the keys in the object/hash. Undefined by default. Additional parameters:
    * `mustNotBeEmpty`: If `true`, empty key strings are not allowed. Defaults to `false`.
    * `regexPattern`: A regular expression pattern that must be satisfied for key strings to be accepted. Undefined by default.
  * `hashtableValuesValidator`: The validation that is applied to each of the values in the object/hash. Undefined by default. Any validation type, including those for complex data types, may be used. An example:

```javascript
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

##### Multi-type validation

These validation types support more than a single data type:

* `any`: The value may be any JSON data type: number, string, boolean, array or object. No additional parameters.
* `conditional`: The value must match any one of some number of candidate validators. Each validator is accompanied by a condition that determines whether that validator should be applied to the value. Additional parameters:
  * `validationCandidates`: A list of candidates to act as the property or element's validator if their conditions are satisfied. Each condition is defined as a function that returns a boolean and accepts as parameters (1) the new document, (2) the old document that is being replaced/deleted (if any; it will be `null` if it has been deleted or does not exist), (3) an object that contains metadata about the current item to validate and (4) a stack of the items (e.g. object properties, array elements, hashtable element values) that have gone through validation, where the last/top element contains metadata for the direct parent of the item currently being validated and the first/bottom element is metadata for the root (i.e. the document). Conditions are tested in the order they are defined; if two or more candidates' conditions would evaluate to `true`, only the first candidate's validator will be applied to the property or element value. When a matching validation candidate declares the same constraint as the containing `conditional` validator, the candidate validator's constraint takes precedence. An example:

```javascript
entries: {
  type: 'hashtable',
  hashtableValuesValidator: {
    type: 'object',
    required: true,
    propertyValidators: {
      entryType: {
        type: 'enum',
        required: true,
        predefinedValues: [ 'name', 'codes' ]
      },
      entryValue: {
        type: 'conditional',
        required: true,
        validationCandidates: [
          {
            condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
              var parentEntry = validationItemStack[validationItemStack.length - 1];

              return parentEntry.itemValue.entryType === 'name';
            },
            validator: {
              type: 'string',
              mustNotBeEmpty: true
            }
          },
          {
            condition: function(doc, oldDoc, currentItemEntry, validationItemStack) {
              var parentEntry = validationItemStack[validationItemStack.length - 1];

              return parentEntry.itemValue.entryType === 'codes';
            },
            validator: {
              type: 'array',
              arrayElementsValidator: {
                type: 'integer',
                required: true,
                minimumValue: 1
              }
            }
          }
        ]
      }
    }
  }
}
```

##### Universal validation constraints

Validation for all simple and complex data types support the following additional parameters:

* `required`: The value cannot be `null` or missing/`undefined`. Defaults to `false`.
* `mustNotBeMissing`: The value cannot be missing/`undefined`. Defaults to `false`. **WARNING:** This constraint exists for advanced users only. Generally the `required` constraint should be favoured because many programming languages are incapable of distinguishing between `null` and missing values, potentially leading to a situation in which a client application cannot satisfy this constraint depending on the JSON serialization strategy it uses.
* `mustNotBeNull`: The value cannot be `null`. Defaults to `false`. **WARNING:** This constraint exists for advanced users only. Generally the `required` constraint should be favoured because many programming languages are incapable of distinguishing between `null` and missing values, potentially leading to a situation in which a client application cannot satisfy this constraint depending on the JSON serialization strategy it uses.
* `immutable`: The item cannot be changed from its existing value if the document is being replaced. The constraint is applied recursively so that, even if a value that is nested an arbitrary number of levels deep within an immutable complex type is modified, the document change will be rejected. A value of `null` is treated as equal to missing/`undefined` and vice versa. Does not apply when creating a new document or deleting an existing document. Differs from `immutableStrict` in that it checks for semantic equality of specialized string validation types (e.g. `date`, `datetime`, `time`, `timezone`, `uuid`); for example, the two `uuid` values of "d97b3a52-78d5-4112-9705-e4ab436f5114" and "D97B3A52-78D5-4112-9705-E4AB436F5114" are considered equal with this constraint since they differ only by case. Defaults to `false`.
* `immutableStrict`: The item cannot be changed from its existing value if the document is being replaced. Differs from `immutable` in that specialized string validation types (e.g. `date`, `datetime`, `time`, `timezone`, `uuid`) are not compared semantically; for example, the two `time` values of "12:45" and "12:45:00.000" are _not_ considered equal because the strings are not strictly equal. Defaults to `false`.
* `immutableWhenSet`: As with the `immutable` property, the item cannot be changed from its existing value if the document is being replaced. However, it differs in that it does not prevent modification if the item is either `null` or missing/`undefined` in the existing document. Differs from `immutableWhenSetStrict` in that it checks for semantic equality of specialized string validation types (e.g. `date`, `datetime`, `time`, `timezone`, `uuid`); for example, the two `datetime` values of "2018-01-01T21:09:00.000Z" and "2018T16:09-05:00" are considered equal with this constraint since they represent the same point in time. Defaults to `false`.
* `immutableWhenSetStrict`: As with the `immutableWhenSet` property, the item cannot be changed if it already has a value. However, it differs in that specialized string validation types (e.g. `date`, `datetime`, `time`, `timezone`, `uuid`) are not compared semantically; for example, the two `date` values of "2018" and "2018-01-01" are _not_ considered equal because the strings are not strictly equal. Defaults to `false`.
* `mustEqual`: The value of the property or element must be equal to the specified value. Useful in cases where the item's value should be computed from other properties of the document (e.g. a reference ID that is encoded into the document's ID or a number that is the result of some calculation performed on other properties in the document). For that reason, this constraint is perhaps most useful when specified as a dynamic constraint (e.g. `mustEqual: function(doc, oldDoc, value, oldValue) { ... }`) rather than as a static value (e.g. `mustEqual: 'foobar'`). If this constraint is set to `null`, then only values of `null` or missing/`undefined` will be accepted for the corresponding property or element. Differs from `mustEqualStrict` in that it checks for semantic equality of specialized string validation types (e.g. `date`, `datetime`, `time`, `timezone`, `uuid`); for example, the two `datetime` values of "2018-02-12T11:02:00.000Z" and "2018-02-12T11:02+00:00" are considered equal with this constraint since they represent the same point in time. No constraint by default.
* `mustEqualStrict`: The value of the property or element must be strictly equal to the specified value. Differs from `mustEqual` in that specialized string validation types (e.g. `date`, `datetime`, `time`, `timezone`, `uuid`) are not compared semantically; for example, the two `timezone` values of "Z" and "+00:00" are _not_ considered equal because the strings are not strictly equal. No constraint by default.
* `skipValidationWhenValueUnchanged`: When set to `true`, the property or element is not validated if the document is being replaced and its value is _semantically_ equal to the same property or element value from the previous document revision. Useful if a change that is not backward compatible must be introduced to a property/element validator and existing values from documents that are already stored in the database should be preserved as they are. Differs from `skipValidationWhenValueUnchangedStrict` in that it checks for semantic equality of specialized string validation types (e.g. `date`, `datetime`, `time`, `timezone`, `uuid`); for example, the two `date` values of "2018" and "2018-01-01" are considered equal with this constraint since they represent the same date. Defaults to `false`.
* `skipValidationWhenValueUnchangedStrict`: When set to `true`, the property or element is not validated if the document is being replaced and its value is _strictly_ equal to the same property or element value from the previous document revision. Useful if a change that is not backward compatible must be introduced to a property/element validator and existing values from documents that are already stored in the database should be preserved as they are. Differs from `skipValidationWhenValueUnchanged` in that specialized string validation types (e.g. `date`, `datetime`, `time`, `timezone`, `uuid`) are not compared semantically; for example, the two `datetime` values of "2018-06-23T14:30:00.000Z" and "2018-06-23T14:30+00:00" are _not_ considered equal because the strings are not strictly equal. Defaults to `false`.
* `customValidation`: A function that accepts as parameters (1) the new document, (2) the old document that is being replaced/deleted (if any), (3) an object that contains metadata about the current item to validate and (4) a stack of the items (e.g. object properties, array elements, hashtable element values) that have gone through validation, where the last/top element contains metadata for the direct parent of the item currently being validated and the first/bottom element is metadata for the root (i.e. the document). If the document does not yet exist, the second parameter will be `null`. And, in some cases where the document previously existed (i.e. it was deleted), the second parameter _may_ be non-null and its `_deleted` property will be `true`. Generally, custom validation should not throw exceptions; it's recommended to return an array/list of error descriptions so the sync function can compile a list of all validation errors that were encountered once full validation is complete. A return value of `null`, `undefined` or an empty array indicate there were no validation errors. An example:

```javascript
propertyValidators: {
  myStringProp: {
    type: 'string'
  },
  myCustomProp: {
    type: 'integer',
    minimumValue: 1,
    maximumValue: 100,
    customValidation: function(doc, oldDoc, currentItemEntry, validationItemStack) {
      var parentObjectElement = validationItemStack[validationItemStack.length - 1];
      var parentObjectName = parentObjectElement.itemName;
      var parentObjectValue = parentObjectElement.itemValue;
      var parentObjectOldValue = parentObjectElement.oldItemValue;

      var currentPropName = currentItemEntry.itemName;
      var currentPropValue = currentItemEntry.itemValue;
      var currentPropOldValue = currentItemEntry.oldItemValue;

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

##### Predefined validators

The following predefined item validators may also be useful:

* `typeIdValidator`: A property validator that is suitable for application to the property that specifies the type of a document. Its constraints include ensuring the value is a string, is neither null nor undefined, is not an empty string and cannot be modified. NOTE: If a document type specifies `simpleTypeFilter` as its type filter, it is not necessary to explicitly include a `type` property validator; it will be supported implicitly as a `typeIdValidator`. An example usage:

```javascript
propertyValidators: {
  type: typeIdValidator,
  foobar: {
    type: 'string'
  }
}
```

##### Dynamic constraint validation

In addition to defining any of the item validation constraints above, including `type`, as static values (e.g. `maximumValue: 99`, `mustNotBeEmpty: true`), it is possible to specify them dynamically via function (e.g. `regexPattern: function(doc, oldDoc, value, oldValue) { ... }`). This is useful if, for example, the constraint should be based on the value of another property/element in the document or computed based on the previous stored value of the current property/element. The function should expect to receive the following parameters:

1. The current document.
2. The document that is being replaced (if any). Note that, if the document is missing (e.g. it doesn't exist yet) or it has been deleted, this parameter will be `null`.
3. The current value of the property/element/key.
4. The previous value of the property/element/key as stored in the revision of the document that is being replaced (if any).

For example:

```javascript
propertyValidators: {
  sequence: {
    type: 'integer',
    required: true,
    // The value must always increase by at least one with each revision
    minimumValue: function(doc, oldDoc, value, oldValue) {
      return !isValueNullOrUndefined(oldValue) ? oldValue + 1 : 0;
    }
  },
  category: {
    type: 'enum',
    required: true,
    // The list of valid categories depends on the beginning of the document's ID
    predefinedValues: function(doc, oldDoc, value, oldValue) {
      return (doc._id.indexOf('integerDoc-') === 0) ? [ 1, 2, 3 ] : [ 'a', 'b', 'c' ];
    }
  },
  referenceId: {
    type: 'string',
    required: true,
    // The reference ID must be constructed from the value of the category field
    regexPattern: function(doc, oldDoc, value, oldValue) {
      return new RegExp('^foobar-' + doc.category + '-[a-zA-Z_-]+$');
    }
  }
}
```

### Definition file

A document definitions file specifies all the document types that belong to a single Sync Gateway bucket/database. Such a file can contain either a plain JavaScript object or a JavaScript function that returns the documents' definitions wrapped in an object.

For example, a document definitions file implemented as an object:

```javascript
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
      type: typeIdValidator,
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
      type: typeIdValidator,
      myProp2: {
        type: 'datetime'
      }
    }
  }
}
```

Or a functionally equivalent document definitions file implemented as a function:

```javascript
function() {
  var sharedChannels = {
    view: 'view',
    write: 'write'
  };

  function myDocTypeFilter(doc, oldDoc, docType) {
    return oldDoc ? oldDoc.type === docType : doc.type === docType;
  }

  return {
    myDocType1: {
      channels: sharedChannels,
      typeFilter: myDocTypeFilter,
      propertyValidators: {
        type: typeIdValidator,
        myProp1: {
          type: 'integer'
        }
      }
    },
    myDocType2: {
      channels: sharedChannels,
      typeFilter: myDocTypeFilter,
      propertyValidators: {
        type: typeIdValidator,
        myProp2: {
          type: 'datetime'
        }
      }
    }
  };
}
```

As demonstrated above, the advantage of defining a function rather than an object is that you may also define variables and functions that can be shared between document types but at the cost of some brevity.

#### Modularity

Document definitions are also modular. By invoking the `importDocumentDefinitionFragment` macro, the contents of external files can be imported into the main document definitions file. For example, each individual document definition from the example above can be specified as a fragment in its own separate file:

* `my-doc-type1-fragment.js`:

```javascript
{
  channels: sharedChannels,
  typeFilter: myDocTypeFilter,
  propertyValidators: {
    type: typeIdValidator,
    myProp1: {
      type: 'integer'
    }
  }
}
```

* `my-doc-type2-fragment.js`:

```javascript
{
  channels: sharedChannels,
  typeFilter: myDocTypeFilter,
  propertyValidators: {
    type: typeIdValidator,
    myProp2: {
      type: 'datetime'
    }
  }
}
```

And then each fragment can be imported into the main document definitions file:

```javascript
function() {
  var sharedChannels = {
    view: 'view',
    write: 'write'
  };

  function myDocTypeFilter(doc, oldDoc, docType) {
    return oldDoc ? oldDoc.type === docType : doc.type === docType;
  }

  return {
    myDocType1: importDocumentDefinitionFragment('my-doc-type1-fragment.js'),
    myDocType2: importDocumentDefinitionFragment('my-doc-type2-fragment.js')
  };
}
```

As you can see, the fragments can also reference functions (e.g. `myDocTypeFilter`) and variables (e.g. `sharedChannels`) that were defined in the main document definitions file. Organizing document definitions in this manner helps to keep configuration manageable.

### Helper functions

Custom code (e.g. type filters, custom validation functions, custom actions) within document definitions have access to Underscore.js's [API](https://cdn.rawgit.com/jashkenas/underscore/1.4.4/index.html) by way of the `_` variable (e.g. `_.map(...)`, `_.union(...)`). In addition, synctos provides some extra predefined functions for common operations:

* `isDocumentMissingOrDeleted(candidate)`: Determines whether the given `candidate` document is either missing (i.e. `null` or `undefined`) or deleted (i.e. its `_deleted` property is `true`). Useful in cases where, for example, the old document (i.e. `oldDoc` parameter) is non-existant or deleted and you want to treat both cases as equivalent.
* `isValueNullOrUndefined(value)`: Determines whether the given `value` parameter is either `null` or `undefined`. In many cases, it is useful to treat both states the same.
* `jsonStringify(value)`: Converts a value into a JSON string. May be useful in a `customValidation` constraint for formatting a custom error message, for example. Serves as a direct replacement for [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) since Sync Gateway does not support the global `JSON` object.

# Testing

The synctos project includes a variety of specifications/test cases to verify the behaviours of its various features. However, if you need to write a custom validation function, dynamic type filter, dynamic assignment of channels to users/roles, etc. or you would otherwise like to verify a generated sync function, this project includes a test fixture module (`src/testing/test-fixture-maker.js`) that is useful in automating much of the work that can go into writing test cases.

The post [Testing your Sync Gateway functions with synctos](https://blog.couchbase.com/testing-sync-gateway-functions-synctos/) on the official Couchbase blog provides a detailed walkthrough, with examples, for setting up and running tests. The following section also provides a brief overview of the process.

Note that synctos uses the [mocha](https://mochajs.org/) test framework for writing and executing test cases and the [Chai](http://chaijs.com/) library for assertions. The following instructions assume that you will too, but by no means are your projects restricted to using either of these libraries for their own tests.

Some other test runners/frameworks that might be of interest:

* [Jasmine](https://jasmine.github.io/)
* [Vows](http://vowsjs.org/)

And some alternate assertion libraries:

* [Node.js Assertions](https://nodejs.org/dist/latest/docs/api/assert.html)
* [expect.js](https://www.npmjs.com/package/expect.js)
* [should.js](https://www.npmjs.com/package/should)

Install the testing libraries locally and add them as development dependencies in the project's [`package.json`](https://docs.npmjs.com/getting-started/using-a-package.json) file (e.g. `npm install mocha --save-dev`, `npm install chai --save-dev`).

After that, create a new specification file in your project's `test/` directory (e.g. `test/foobar-spec.js`) and import the test fixture module into the empty spec:

```javascript
var testFixtureMaker = require('synctos').testFixtureMaker;
```

Create a new `describe` block to encapsulate the forthcoming test cases, initialize the synctos test fixture and also reset the state after each test case using the `afterEach` function. For example:

```javascript
describe('My new sync function', function() {
  var testFixture = testFixtureMaker.initFromDocumentDefinitions('/path/to/my-doc-definitions.js');

  afterEach(function() {
    testFixture.resetTestEnvironment();
  });

  ...
});
```

Now you can begin writing specs/test cases inside the `describe` block using the test fixture's convenience functions to verify the behaviour of the generated sync function. For example, to verify that a new document passes validation, specifies the correct channels, roles and usernames for authorization, and assigns the desired channel access to a list of users:

```javascript
it('can create a myDocType document', function() {
  var doc = {
    _id: 'myDocId',
    type: 'myDocType',
    foo: 'bar',
    bar: -32,
    members: [ 'joe', 'nancy' ]
  };

  testFixture.verifyDocumentCreated(
    doc,
    {
      expectedChannels: [ 'my-add-channel1', 'my-add-channel2' ],
      expectedRoles: [ 'my-add-role' ],
      expectedUsers: [ 'my-add-user' ]
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

```javascript
it('cannot create a myDocType doc when required property foo is missing', function() {
  var doc = {
    _id: 'myDocId',
    type: 'myDocType',
    bar: 79
  };

  testFixture.verifyDocumentNotCreated(
    doc,
    'myDocType',
    [ testFixture.validationErrorFormatter.requiredValueViolation('foo') ],
    {
      expectedChannels: [ 'my-add-channel1', 'my-add-channel2' ],
      expectedRoles: [ 'my-add-role' ],
      expectedUsers: [ 'my-add-user' ]
    });
});
```

The `testFixture.validationErrorFormatter` object in the preceding example provides a variety of functions that can be used to specify expected validation error messages. See the `src/testing/validation-error-formatter.js` module in this project for documentation.

To execute the tests in the `test/` directory, ensure that the project's `package.json` file contains a "test" script. For example:

```javascript
"scripts": {
  "test": "mocha test/"
}
```

Once the test script is configured in `package.json`, run the tests with the `npm test` command.

You will find many more examples in this project's `test/` directory and in the example project [synctos-test-examples](https://github.com/OldSneerJaw/synctos-test-examples).

Refer to the [Validating](#validating) section of the README for information on using the validation utility to verify the structure and semantics of a document definitions file.

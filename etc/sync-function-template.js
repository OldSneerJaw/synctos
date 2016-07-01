// This sync function for Couchbase Sync Gateway was generated by synctos: https://github.com/Kashoo/synctos
// More info on sync functions: http://developer.couchbase.com/mobile/develop/guides/sync-gateway/sync-function-api-guide/index.html
function(doc, oldDoc) {
  // Determine if a given value is an integer. Exists as a failsafe because Number.isInteger is not guaranteed to exist in all environments.
  var isInteger = Number.isInteger || function(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  };

  // Check that a given value is a valid ISO 8601 format date string with optional time and time zone components
  function isIso8601DateTimeString(value) {
    var regex = new RegExp('^(([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))([T ]([01][0-9]|2[0-4])(:[0-5][0-9])?(:[0-5][0-9])?([\\.,][0-9]{1,3})?)?([zZ]|([\\+-])([01][0-9]|2[0-3]):?([0-5][0-9])?)?$');

    return regex.test(value);
  }

  // Check that a given value is a valid ISO 8601 date string without time and time zone components
  function isIso8601DateString(value) {
    var regex = new RegExp('^(([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))$');

    return regex.test(value);
  }

  function isValueNullOrUndefined(value) {
    return typeof(value) === 'undefined' || value === null;
  }

  // A document definition may define its channels for each operation (view, add, replace, delete) as either a string or an array of
  // strings. In either case, add them to the list if they are not already present.
  function appendToChannelList(allChannels, channelsToAdd) {
    if (channelsToAdd instanceof Array) {
      for (var i = 0; i < channelsToAdd.length; i++) {
        var channel = channelsToAdd[i];
        if (allChannels.indexOf(channel) < 0) {
          allChannels.push(channel);
        }
      }
    } else if (allChannels.indexOf(channelsToAdd) < 0) {
      allChannels.push(channelsToAdd);
    }
  }

  // A document definition may define its channels as either a function or an object/hashtable
  function getDocChannelMap(doc, oldDoc, docDefinition) {
    if (typeof(docDefinition.channels) === 'function') {
      return docDefinition.channels(doc, oldDoc);
    } else {
      return docDefinition.channels;
    }
  }

  // Retrieves a list of channels the document belongs to based on its specified type
  function getAllDocChannels(doc, oldDoc, docDefinition) {
    var docChannelMap = getDocChannelMap(doc, oldDoc, docDefinition);

    var allChannels = [ ];
    appendToChannelList(allChannels, docChannelMap.view);
    appendToChannelList(allChannels, docChannelMap.add);
    appendToChannelList(allChannels, docChannelMap.replace);
    appendToChannelList(allChannels, docChannelMap.remove);

    return allChannels;
  }

  // Ensures the user is authorized to create/replace/delete this document
  function authorize(doc, oldDoc, docDefinition) {
    var docChannelMap = getDocChannelMap(doc, oldDoc, docDefinition);

    var requiredChannels;
    if (doc._deleted) {
      requiredChannels = docChannelMap.remove;
    } else if (oldDoc && !oldDoc._deleted) {
      requiredChannels = docChannelMap.replace;
    } else {
      requiredChannels = docChannelMap.add;
    }

    requireAccess(requiredChannels);
  }

  function buildItemPath(itemStack) {
    var nameComponents = [ ];
    for (var i = 0; i < itemStack.length; i++) {
      var itemName = itemStack[i].itemName;

      if (!itemName) {
        // Skip null or empty names (e.g. the first element is typically the root of the document, which has no name)
        continue;
      } else if (nameComponents.length < 1 || itemName.indexOf('[') === 0) {
        nameComponents.push(itemName);
      } else {
        nameComponents.push('.' + itemName);
      }
    }

    return nameComponents.join('');
  }

  // Ensures the document structure and content are valid
  function validateDoc(doc, oldDoc, docDefinition, docType) {
    var validationErrors = [ ];

    if (!(docDefinition.allowAttachments) && doc._attachments) {
      for (var attachment in doc._attachments) {
        validationErrors.push('document type does not support attachments');

        break;
      }
    }

    var itemStack = [
      {
        itemValue: doc,
        oldItemValue: oldDoc,
        itemName: null
      }
    ];

    if (docDefinition.immutable && oldDoc && !oldDoc._deleted && !validateImmutableObject(doc, oldDoc)) {
      validationErrors.push('properties of this document may not be modified');
    }

    // Execute each of the document's property validators
    validateProperties(doc, oldDoc, docDefinition.propertyValidators, itemStack, validationErrors, true);

    if (validationErrors.length > 0) {
      throw { forbidden: 'Invalid ' + docType + ' document: ' + validationErrors.join('; ') };
    }
  }

  function validateProperties(doc, oldDoc, propertyValidators, itemStack, validationErrors, useWhitelist) {
    var currentItemEntry = itemStack[itemStack.length - 1];
    var objectValue = currentItemEntry.itemValue;
    var oldObjectValue = currentItemEntry.oldItemValue;

    var supportedProperties = [ ];
    for (var validatorIndex = 0; validatorIndex < propertyValidators.length; validatorIndex++) {
      var validator = propertyValidators[validatorIndex];
      var propertyName = validator.propertyName;
      var propertyValue = objectValue[propertyName];

      var oldPropertyValue;
      if (!isValueNullOrUndefined(oldObjectValue)) {
        oldPropertyValue = oldObjectValue[propertyName];
      }

      supportedProperties.push(propertyName);

      itemStack.push({
        itemValue: propertyValue,
        oldItemValue: oldPropertyValue,
        itemName: propertyName
      });

      validateItemValue(doc, oldDoc, validator, itemStack, validationErrors);

      itemStack.pop();
    }

    // Verify there are no unsupported properties in the object
    var whitelistedProperties = [ '_id', '_rev', '_deleted', '_revisions', '_attachments' ];
    for (var propertyName in objectValue) {
      if (useWhitelist && whitelistedProperties.indexOf(propertyName) >= 0) {
        // These properties are special cases that should always be allowed - generally only applied at the top level of the document
        continue;
      }

      if (supportedProperties.indexOf(propertyName) < 0) {
        var objectPath = buildItemPath(itemStack);
        var fullPropertyPath = objectPath ? objectPath + '.' + propertyName : propertyName;
        validationErrors.push('property "' + fullPropertyPath + '" is not supported');
      }
    }
  }

  function validateItemValue(doc, oldDoc, validator, itemStack, validationErrors) {
    var currentItemEntry = itemStack[itemStack.length - 1];
    var itemValue = currentItemEntry.itemValue;
    var oldItemValue = currentItemEntry.oldItemValue;

    if (validator.customValidation) {
      performCustomValidation(doc, oldDoc, validator, itemStack, validationErrors);
    }

    if (validator.immutable) {
      validateImmutable(doc, oldDoc, itemStack, validationErrors);
    }

    if (!isValueNullOrUndefined(itemValue)) {
      if (validator.mustNotBeEmpty && itemValue.length < 1) {
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be empty');
      }

      if (!isValueNullOrUndefined(validator.minimumValue)) {
        var comparator = function(left, right) {
          return left < right;
        };
        validateRangeConstraint(validator.minimumValue, validator.type, itemStack, comparator, 'less', validationErrors);
      }

      if (!isValueNullOrUndefined(validator.maximumValue)) {
        var comparator = function(left, right) {
          return left > right;
        };
        validateRangeConstraint(validator.maximumValue, validator.type, itemStack, comparator, 'greater', validationErrors);
      }

      if (!isValueNullOrUndefined(validator.minimumLength) && itemValue.length < validator.minimumLength) {
        validationErrors.push('length of item "' + buildItemPath(itemStack) + '" must not be less than ' + validator.minimumLength);
      }

      if (!isValueNullOrUndefined(validator.maximumLength) && itemValue.length > validator.maximumLength) {
        validationErrors.push('length of item "' + buildItemPath(itemStack) + '" must not be greater than ' + validator.maximumLength);
      }

      switch (validator.type) {
        case 'string':
          if (typeof itemValue !== 'string') {
            validationErrors.push('item "' + buildItemPath(itemStack) + '" must be a string');
          } else if (validator.regexPattern && !(validator.regexPattern.test(itemValue))) {
            validationErrors.push('item "' + buildItemPath(itemStack) + '" must conform to expected format ' + validator.regexPattern);
          }
          break;
        case 'integer':
          if (!isInteger(itemValue)) {
            validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an integer');
          }
          break;
        case 'float':
          if (typeof itemValue !== 'number') {
            validationErrors.push('item "' + buildItemPath(itemStack) + '" must be a floating point or integer number');
          }
          break;
        case 'boolean':
          if (typeof itemValue !== 'boolean') {
            validationErrors.push('item "' + buildItemPath(itemStack) + '" must be a boolean');
          }
          break;
        case 'datetime':
          if (typeof itemValue !== 'string' || !isIso8601DateTimeString(itemValue)) {
            validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ISO 8601 date string with optional time and time zone components');
          }
          break;
        case 'date':
          if (typeof itemValue !== 'string' || !isIso8601DateString(itemValue)) {
            validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an ISO 8601 date string with no time or time zone components');
          }
          break;
        case 'object':
          if (typeof itemValue !== 'object') {
            validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an object');
          } else if (validator.propertyValidators) {
            validateProperties(doc, oldDoc, validator.propertyValidators, itemStack, validationErrors);
          }
          break;
        case 'array':
          validateArray(doc, oldDoc, validator.arrayElementsValidator, itemStack, validationErrors);
          break;
        case 'hashtable':
          validateHashtable(
            doc,
            oldDoc,
            validator.hashtableKeysValidator,
            validator.hashtableValuesValidator,
            itemStack,
            validationErrors);
          break;
        case 'attachmentReference':
          validateAttachmentRef(doc, oldDoc, validator, itemStack, validationErrors);
          break;
        default:
          // This is not a document validation error; the item validator is configured incorrectly and must be fixed
          throw({ forbidden: 'No data type defined for validator of item "' + buildItemPath(itemStack) + '"' });
          break;
      }
    } else if (validator.required) {
      // The item has no value (either it's null or undefined), but the validator indicates it is required
      validationErrors.push('required item "' + buildItemPath(itemStack) + '" is missing');
    }
  }

  function validateImmutable(doc, oldDoc, itemStack, validationErrors) {
    if (oldDoc && !(oldDoc._deleted)) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;
      var oldItemValue = currentItemEntry.oldItemValue;

      // Only compare the item's value to the old item if the item's parent existed in the old document. For example, if the item in
      // question is the value of a property in an object that is itself in an array, but the object did not exist in the array in the old
      // document, then there is nothing to validate.
      var oldParentItemValue = (itemStack.length >= 2) ? itemStack[itemStack.length - 2].oldItemValue : null;
      var constraintSatisfied = true;
      if (!isValueNullOrUndefined(oldParentItemValue)) {
        constraintSatisfied = validateImmutableItem(itemValue, oldItemValue);
      }

      if (!constraintSatisfied) {
        validationErrors.push('value of item "' + buildItemPath(itemStack) + '" may not be modified');
      }
    }
  }

  function validateImmutableItem(itemValue, oldItemValue) {
    if (oldItemValue === itemValue || (isValueNullOrUndefined(oldItemValue) && isValueNullOrUndefined(itemValue))) {
      return true;
    } else {
      if (itemValue instanceof Array || oldItemValue instanceof Array) {
        return validateImmutableArray(itemValue, oldItemValue);
      } else if (typeof(itemValue) === 'object' || typeof(oldItemValue) === 'object') {
        return validateImmutableObject(itemValue, oldItemValue);
      } else {
        return false;
      }
    }
  }

  function validateImmutableArray(itemValue, oldItemValue) {
    if (!(itemValue instanceof Array && oldItemValue instanceof Array)) {
      return false;
    } else if (itemValue.length !== oldItemValue.length) {
      return false;
    }

    for (var elementIndex = 0; elementIndex < itemValue.length; elementIndex++) {
      var elementValue = itemValue[elementIndex];
      var oldElementValue = oldItemValue[elementIndex];

      if (!validateImmutableItem(elementValue, oldElementValue)) {
        return false;
      }
    }

    // If we got here, all elements match
    return true;
  }

  function validateImmutableObject(itemValue, oldItemValue) {
    if (typeof(itemValue) !== 'object' || typeof(oldItemValue) !== 'object') {
      return false;
    }

    var itemProperties = [ ];
    for (var itemProp in itemValue) {
      itemProperties.push(itemProp);
    }

    var oldItemPropertiesCount = 0;
    for (var oldItemProp in oldItemValue) {
      oldItemPropertiesCount++;
    }

    if (itemProperties.length !== oldItemPropertiesCount) {
      return false;
    }

    for (var propIndex = 0; propIndex < itemProperties.length; propIndex++) {
      var propertyName = itemProperties[propIndex];
      var propertyValue = itemValue[propertyName];
      var oldPropertyValue = oldItemValue[propertyName];

      if (!validateImmutableItem(propertyValue, oldPropertyValue)) {
        return false;
      }
    }

    // If we got here, all properties match
    return true;
  }

  function validateRangeConstraint(rangeLimit, validationType, itemStack, comparator, violationType, validationErrors) {
    var itemValue = itemStack[itemStack.length - 1].itemValue;
    var outOfRange;
    if (validationType === 'datetime') {
      // Date/times require special handling because their time and time zone components are optional and time zones may differ
      try {
        outOfRange = comparator(new Date(itemValue).getTime(), new Date(rangeLimit).getTime());
      } catch (ex) {
        // The date/time's format may be invalid but it isn't technically in violation of the range constraint
        outOfRange = false;
      }
    } else if (comparator(itemValue, rangeLimit)) {
      outOfRange = true;
    }

    if (outOfRange) {
      validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be ' + violationType + ' than ' + rangeLimit);
    }
  }

  function validateArray(doc, oldDoc, elementValidator, itemStack, validationErrors) {
    var currentItemEntry = itemStack[itemStack.length - 1];
    var itemValue = currentItemEntry.itemValue;
    var oldItemValue = currentItemEntry.oldItemValue;

    if (!(itemValue instanceof Array)) {
      validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an array');
    } else if (elementValidator) {
      // Validate each element in the array
      for (var elementIndex = 0; elementIndex < itemValue.length; elementIndex++) {
        var elementName = '[' + elementIndex + ']';
        var elementValue = itemValue[elementIndex];

        var oldElementValue;
        if (!isValueNullOrUndefined(oldItemValue) && elementIndex < oldItemValue.length) {
          oldElementValue = oldItemValue[elementIndex];
        }

        itemStack.push({
          itemName: elementName,
          itemValue: elementValue,
          oldItemValue: oldElementValue
        });

        validateItemValue(
          doc,
          oldDoc,
          elementValidator,
          itemStack,
          validationErrors);

        itemStack.pop();
      }
    }
  }

  function validateHashtable(doc, oldDoc, keyValidator, valueValidator, itemStack, validationErrors) {
    var currentItemEntry = itemStack[itemStack.length - 1];
    var itemValue = currentItemEntry.itemValue;
    var oldItemValue = currentItemEntry.oldItemValue;

    if (typeof itemValue !== 'object') {
      validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an object/hashtable');
    } else {
      for (var elementKey in itemValue) {
        var elementValue = itemValue[elementKey];

        var elementName = '[' + elementKey + ']';
        if (keyValidator) {
          var hashtablePath = buildItemPath(itemStack);
          var fullKeyPath = hashtablePath ? hashtablePath + elementName : elementName;
          if (typeof elementKey !== 'string') {
            validationErrors.push('hashtable key "' + fullKeyPath + '" is not a string');
          } else {
            if (keyValidator.mustNotBeEmpty && elementKey.length < 1) {
              validationErrors.push('empty hashtable key in item "' + buildItemPath(itemStack) + '" is not allowed');
            }
            if (keyValidator.regexPattern && !(keyValidator.regexPattern.test(elementKey))) {
              validationErrors.push('hashtable key "' + fullKeyPath + '" does not conform to expected format ' + keyValidator.regexPattern);
            }
          }
        }

        if (valueValidator) {
          var oldElementValue;
          if (!isValueNullOrUndefined(oldItemValue)) {
            oldElementValue = oldItemValue[elementKey];
          }

          itemStack.push({
            itemName: elementName,
            itemValue: elementValue,
            oldItemValue: oldElementValue
          });

          validateItemValue(
            doc,
            oldDoc,
            valueValidator,
            itemStack,
            validationErrors);

          itemStack.pop();
        }
      }
    }
  }

  function validateAttachmentRef(doc, oldDoc, validator, itemStack, validationErrors) {
    var currentItemEntry = itemStack[itemStack.length - 1];
    var itemValue = currentItemEntry.itemValue;

    if (typeof itemValue !== 'string') {
      validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must be a string');
    } else {
      if (validator.supportedExtensions) {
        var extRegex = new RegExp('\\.(' + validator.supportedExtensions.join('|') + ')$', 'i');
        if (!extRegex.test(itemValue)) {
          validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must have a supported file extension (' + validator.supportedExtensions.join(',') + ')');
        }
      }

      // Because the addition of an attachment is typically a separate operation from the creation/update of the associated document, we
      // can't guarantee that the attachment is present when the attachment reference property is created/updated for it, so only
      // validate it if it's present. The good news is that, because adding an attachment is a two part operation (create/update the
      // document and add the attachment), the sync function will be run once for each part, thus ensuring the content is verified once
      // both parts have been synced.
      if (doc._attachments && doc._attachments[itemValue]) {
        var attachment = doc._attachments[itemValue];

        if (validator.supportedContentTypes && validator.supportedContentTypes.indexOf(attachment.content_type) < 0) {
            validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must have a supported content type (' + validator.supportedContentTypes.join(',') + ')');
        }

        if (!isValueNullOrUndefined(validator.maximumSize) && attachment.length > validator.maximumSize) {
          validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must not be larger than ' + validator.maximumSize + ' bytes');
        }
      }
    }
  }

  function performCustomValidation(doc, oldDoc, validator, itemStack, validationErrors) {
    var currentItemEntry = itemStack[itemStack.length - 1];

    // Copy all but the last/top element so that the item's parent is at the top of the stack for the custom validation function
    var customValidationItemStack = itemStack.slice(-1);

    var customValidationErrors = validator.customValidation(doc, oldDoc, currentItemEntry, customValidationItemStack);

    if (customValidationErrors instanceof Array) {
      for (var errorIndex = 0; errorIndex < customValidationErrors.length; errorIndex++) {
        validationErrors.push(customValidationErrors[errorIndex]);
      }
    }
  }

  var rawDocDefinitions = %SYNC_DOCUMENT_DEFINITIONS%;

  var docDefinitions;
  if (typeof rawDocDefinitions === 'function') {
    docDefinitions = rawDocDefinitions();
  } else {
    docDefinitions = rawDocDefinitions;
  }


  function getDocumentType(doc, oldDoc) {
    for (var docType in docDefinitions) {
      var docDefn = docDefinitions[docType];
      if (docDefn.typeFilter(doc, oldDoc)) {
        return docType;
      }
    }

    // The document type does not exist
    return null;
  }


  // Now put the pieces together
  var theDocType = getDocumentType(doc, oldDoc);

  if (theDocType == null) {
    throw({ forbidden: 'Unknown document type' });
  }

  var theDocDefinition = docDefinitions[theDocType];

  authorize(doc, oldDoc, theDocDefinition);

  // There's nothing to validate if the doc is being deleted
  if (!doc._deleted) {
    validateDoc(doc, oldDoc, theDocDefinition, theDocType);
  }

  // Getting here means the document write is authorized and valid, and the appropriate channels should now be assigned
  channel(getAllDocChannels(doc, oldDoc, theDocDefinition));
}

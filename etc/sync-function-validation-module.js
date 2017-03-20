function() {
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

  // Constructs the fully qualified path of the item at the top of the given stack
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

    validateDocImmutability(doc, oldDoc, docDefinition, validationErrors);

    // Only validate the document's contents if it's being created or replaced. But there's no need if it's being deleted.
    if (!doc._deleted) {
      validateDocContents(
        doc,
        oldDoc,
        docDefinition,
        validationErrors);
    }

    if (validationErrors.length > 0) {
      throw { forbidden: 'Invalid ' + docType + ' document: ' + validationErrors.join('; ') };
    }
  }

  function validateDocImmutability(doc, oldDoc, docDefinition, validationErrors) {
    if (!isDocumentMissingOrDeleted(oldDoc)) {
      if (docDefinition.immutable) {
        validationErrors.push('documents of this type cannot be replaced or deleted');
      } else if (doc._deleted) {
        if (docDefinition.cannotDelete) {
          validationErrors.push('documents of this type cannot be deleted');
        }
      } else {
        if (docDefinition.cannotReplace) {
          validationErrors.push('documents of this type cannot be replaced');
        }
      }
    }
  }

  function validateDocContents(doc, oldDoc, docDefinition, validationErrors) {
    var attachmentReferenceValidators = { };
    var itemStack = [
      {
        itemValue: doc,
        oldItemValue: oldDoc,
        itemName: null
      }
    ];

    // Execute each of the document's property validators while ignoring the specified whitelisted properties at the root level
    validateProperties(
      docDefinition.propertyValidators,
      docDefinition.allowUnknownProperties,
      [ '_id', '_rev', '_deleted', '_revisions', '_attachments' ]);

    if (doc._attachments) {
      validateAttachments();
    }

    // The following functions are nested within this function so they can share access to the doc, oldDoc and validationErrors params and
    // the attachmentReferenceValidators and itemStack variables

    function validateProperties(propertyValidators, allowUnknownProperties, whitelistedProperties) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var objectValue = currentItemEntry.itemValue;
      var oldObjectValue = currentItemEntry.oldItemValue;

      var supportedProperties = [ ];
      for (var propertyValidatorName in propertyValidators) {
        var validator = propertyValidators[propertyValidatorName];
        if (isValueNullOrUndefined(validator) || isValueNullOrUndefined(validator.type)) {
          // Skip over non-validator fields/properties
          continue;
        }

        var propertyValue = objectValue[propertyValidatorName];

        var oldPropertyValue;
        if (!isValueNullOrUndefined(oldObjectValue)) {
          oldPropertyValue = oldObjectValue[propertyValidatorName];
        }

        supportedProperties.push(propertyValidatorName);

        itemStack.push({
          itemValue: propertyValue,
          oldItemValue: oldPropertyValue,
          itemName: propertyValidatorName
        });

        validateItemValue(validator);

        itemStack.pop();
      }

      // Verify there are no unsupported properties in the object
      if (!allowUnknownProperties) {
        for (var propertyName in objectValue) {
          if (whitelistedProperties && whitelistedProperties.indexOf(propertyName) >= 0) {
            // These properties are special cases that should always be allowed - generally only applied at the root level of the document
            continue;
          }

          if (supportedProperties.indexOf(propertyName) < 0) {
            var objectPath = buildItemPath(itemStack);
            var fullPropertyPath = objectPath ? objectPath + '.' + propertyName : propertyName;
            validationErrors.push('property "' + fullPropertyPath + '" is not supported');
          }
        }
      }
    }

    function validateItemValue(validator) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;

      if (validator.customValidation) {
        performCustomValidation(validator);
      }

      if (validator.immutable) {
        validateImmutable(false);
      }

      if (validator.immutableWhenSet) {
        validateImmutable(true);
      }

      if (!isValueNullOrUndefined(itemValue)) {
        if (validator.mustNotBeEmpty && itemValue.length < 1) {
          validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be empty');
        }

        if (!isValueNullOrUndefined(validator.minimumValue)) {
          var minComparator = function(left, right) {
            return left < right;
          };
          validateRangeConstraint(validator.minimumValue, validator.type, minComparator, 'less than');
        }

        if (!isValueNullOrUndefined(validator.minimumValueExclusive)) {
          var minExclusiveComparator = function(left, right) {
            return left <= right;
          };
          validateRangeConstraint(validator.minimumValueExclusive, validator.type, minExclusiveComparator, 'less than or equal to');
        }

        if (!isValueNullOrUndefined(validator.maximumValue)) {
          var maxComparator = function(left, right) {
            return left > right;
          };
          validateRangeConstraint(validator.maximumValue, validator.type, maxComparator, 'greater than');
        }

        if (!isValueNullOrUndefined(validator.maximumValueExclusive)) {
          var maxExclusiveComparator = function(left, right) {
            return left >= right;
          };
          validateRangeConstraint(validator.maximumValueExclusive, validator.type, maxExclusiveComparator, 'greater than or equal to');
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
          case 'enum':
            if (!(validator.predefinedValues instanceof Array)) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" belongs to an enum that has no predefined values');
            } else if (validator.predefinedValues.indexOf(itemValue) < 0) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be one of the predefined values: ' + validator.predefinedValues.toString());
            }
            break;
          case 'object':
            if (typeof itemValue !== 'object' || itemValue instanceof Array) {
              validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an object');
            } else if (validator.propertyValidators) {
              validateProperties(validator.propertyValidators, validator.allowUnknownProperties);
            }
            break;
          case 'array':
            validateArray(validator.arrayElementsValidator);
            break;
          case 'hashtable':
            validateHashtable(validator);
            break;
          case 'attachmentReference':
            validateAttachmentRef(validator);
            break;
          default:
            // This is not a document validation error; the item validator is configured incorrectly and must be fixed
            throw({ forbidden: 'No data type defined for validator of item "' + buildItemPath(itemStack) + '"' });
        }
      } else if (validator.required) {
        // The item has no value (either it's null or undefined), but the validator indicates it is required
        validationErrors.push('required item "' + buildItemPath(itemStack) + '" is missing');
      }
    }

    function validateImmutable(onlyEnforceIfHasValue) {
      if (!isDocumentMissingOrDeleted(oldDoc)) {
        var currentItemEntry = itemStack[itemStack.length - 1];
        var itemValue = currentItemEntry.itemValue;
        var oldItemValue = currentItemEntry.oldItemValue;

        if (onlyEnforceIfHasValue && isValueNullOrUndefined(oldItemValue)) {
          // No need to continue; the constraint only applies if the old value is neither null nor undefined
          return;
        }

        // Only compare the item's value to the old item if the item's parent existed in the old document. For example, if the item in
        // question is the value of a property in an object that is itself in an array, but the object did not exist in the array in the old
        // document, then there is nothing to validate.
        var oldParentItemValue = (itemStack.length >= 2) ? itemStack[itemStack.length - 2].oldItemValue : null;
        var constraintSatisfied;
        if (isValueNullOrUndefined(oldParentItemValue)) {
          constraintSatisfied = true;
        } else {
          constraintSatisfied = validateImmutableItem(itemValue, oldItemValue);
        }

        if (!constraintSatisfied) {
          validationErrors.push('value of item "' + buildItemPath(itemStack) + '" may not be modified');
        }
      }
    }

    function validateImmutableItem(itemValue, oldItemValue) {
      var itemMissing = isValueNullOrUndefined(itemValue);
      var oldItemMissing = isValueNullOrUndefined(oldItemValue);
      if (oldItemValue === itemValue || (itemMissing && oldItemMissing)) {
        return true;
      } else if (itemMissing !== oldItemMissing) {
        // One value is null or undefined but the other is not, so they cannot be equal
        return false;
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

      for (var oldItemProp in oldItemValue) {
        if (itemProperties.indexOf(oldItemProp) < 0) {
          itemProperties.push(oldItemProp);
        }
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

    function validateRangeConstraint(rangeLimit, validationType, comparator, violationDescription) {
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
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must not be ' + violationDescription + ' ' + rangeLimit);
      }
    }

    function validateArray(elementValidator) {
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

          validateItemValue(elementValidator);

          itemStack.pop();
        }
      }
    }

    function validateHashtable(validator) {
      var keyValidator = validator.hashtableKeysValidator;
      var valueValidator = validator.hashtableValuesValidator;
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;
      var oldItemValue = currentItemEntry.oldItemValue;
      var hashtablePath = buildItemPath(itemStack);

      if (typeof itemValue !== 'object' || itemValue instanceof Array) {
        validationErrors.push('item "' + buildItemPath(itemStack) + '" must be an object/hashtable');
      } else {
        var size = 0;
        for (var elementKey in itemValue) {
          size++;
          var elementValue = itemValue[elementKey];

          var elementName = '[' + elementKey + ']';
          if (keyValidator) {
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

            validateItemValue(valueValidator);

            itemStack.pop();
          }
        }

        if (!isValueNullOrUndefined(validator.maximumSize) && size > validator.maximumSize) {
          validationErrors.push('hashtable "' + hashtablePath + '" must not be larger than ' + validator.maximumSize + ' elements');
        }

        if (!isValueNullOrUndefined(validator.minimumSize) && size < validator.minimumSize) {
          validationErrors.push('hashtable "' + hashtablePath + '" must not be smaller than ' + validator.minimumSize + ' elements');
        }
      }
    }

    function validateAttachmentRef(validator) {
      var currentItemEntry = itemStack[itemStack.length - 1];
      var itemValue = currentItemEntry.itemValue;

      if (typeof itemValue !== 'string') {
        validationErrors.push('attachment reference "' + buildItemPath(itemStack) + '" must be a string');
      } else {
        attachmentReferenceValidators[itemValue] = validator;

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

    function validateAttachments() {
      var maximumIndividualAttachmentSize =
        docDefinition.attachmentConstraints ? docDefinition.attachmentConstraints.maximumIndividualSize : null;
      var maximumTotalAttachmentSize = docDefinition.attachmentConstraints ? docDefinition.attachmentConstraints.maximumTotalSize : null;
      var maximumAttachmentCount = docDefinition.attachmentConstraints ? docDefinition.attachmentConstraints.maximumAttachmentCount : null;

      var totalSize = 0;
      var attachmentCount = 0;
      for (var attachmentName in doc._attachments) {
        attachmentCount++;

        var attachmentSize = doc._attachments[attachmentName].length;
        totalSize += attachmentSize;

        if (isInteger(maximumIndividualAttachmentSize) && attachmentSize > maximumIndividualAttachmentSize) {
          // If this attachment is owned by an attachment reference property, that property's size constraint (if any) takes precedence
          var attachmentRefValidator = attachmentReferenceValidators[attachmentName];
          if (isValueNullOrUndefined(attachmentRefValidator) || !isInteger(attachmentRefValidator.maximumSize)) {
            validationErrors.push('attachment ' + attachmentName + ' must not exceed ' + maximumIndividualAttachmentSize + ' bytes');
          }
        }
      }

      if (isInteger(maximumTotalAttachmentSize) && totalSize > maximumTotalAttachmentSize) {
        validationErrors.push('the total size of all attachments must not exceed ' + maximumTotalAttachmentSize + ' bytes');
      }

      if (isInteger(maximumAttachmentCount) && attachmentCount > maximumAttachmentCount) {
        validationErrors.push('the total number of attachments must not exceed ' + maximumAttachmentCount);
      }

      if (!docDefinition.allowAttachments && attachmentCount > 0) {
        validationErrors.push('document type does not support attachments');
      }
    }

    function performCustomValidation(validator) {
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
  }

  return {
    validateDoc: validateDoc
  };
}

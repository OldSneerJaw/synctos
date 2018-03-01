function comparisonModule(timeModule, buildItemPath) {
  return {
    validateMinValueInclusiveConstraint: validateMinValueInclusiveConstraint,
    validateMaxValueInclusiveConstraint: validateMaxValueInclusiveConstraint,
    validateMinValueExclusiveConstraint: validateMinValueExclusiveConstraint,
    validateMaxValueExclusiveConstraint: validateMaxValueExclusiveConstraint,
    validateImmutable: validateImmutable,
    validateEquality: validateEquality
  };

  function validateMinValueInclusiveConstraint(itemStack, rangeConstraint, validatorType) {
    return validateRangeConstraint(itemStack, rangeConstraint, minValueInclusiveViolationComparator(validatorType), 'less than');
  }

  function validateMaxValueInclusiveConstraint(itemStack, rangeConstraint, validatorType) {
    return validateRangeConstraint(itemStack, rangeConstraint, maxValueInclusiveViolationComparator(validatorType), 'greater than');
  }

  function validateMinValueExclusiveConstraint(itemStack, rangeConstraint, validatorType) {
    return validateRangeConstraint(
      itemStack,
      rangeConstraint,
      minValueExclusiveViolationComparator(validatorType),
      'less than or equal to');
  }

  function validateMaxValueExclusiveConstraint(itemStack, rangeConstraint, validatorType) {
    return validateRangeConstraint(
      itemStack,
      rangeConstraint,
      maxValueExclusiveViolationComparator(validatorType),
      'greater than or equal to');
  }

  function validateRangeConstraint(itemStack, rangeConstraint, violationComparator, violationDescription) {
    var itemValue = itemStack[itemStack.length - 1].itemValue;

    if (violationComparator(itemValue, rangeConstraint)) {
      return 'item "' + buildItemPath(itemStack) + '" must not be ' + violationDescription + ' ' + convertToString(rangeConstraint);
    } else {
      return null;
    }
  }

  function validateImmutable(itemStack, onlyEnforceIfHasValue, validatorType) {
    var currentItemEntry = itemStack[itemStack.length - 1];
    var itemValue = currentItemEntry.itemValue;
    var oldItemValue = currentItemEntry.oldItemValue;

    if (onlyEnforceIfHasValue && isValueNullOrUndefined(oldItemValue)) {
      // No need to continue; the constraint only applies if the old document has a value for this item
      return null;
    }

    // Only compare the item's value to the old item if the item's parent existed in the old document. For example, if the item in
    // question is the value of a property in an object that is itself in an array, but the object did not exist in the array in the old
    // document, then there is nothing to validate.
    var oldParentItemValue = (itemStack.length >= 2) ? itemStack[itemStack.length - 2].oldItemValue : null;
    var constraintSatisfied;
    if (isValueNullOrUndefined(oldParentItemValue)) {
      constraintSatisfied = true;
    } else {
      constraintSatisfied = checkItemEquality(itemValue, oldItemValue, validatorType);
    }

    return !constraintSatisfied ? 'item "' + buildItemPath(itemStack) + '" cannot be modified' : null;
  }

  function validateEquality(itemStack, expectedItemValue, validatorType) {
    var currentItemEntry = itemStack[itemStack.length - 1];
    var currentItemValue = currentItemEntry.itemValue;

    if (!checkItemEquality(currentItemValue, expectedItemValue, validatorType)) {
      return 'value of item "' + buildItemPath(itemStack) + '" must equal ' + jsonStringify(expectedItemValue);
    } else {
      return null;
    }
  }

  function checkItemEquality(itemValue, expectedItemValue, validatorType) {
    if (simpleTypeEqualityComparator(validatorType)(itemValue, expectedItemValue)) {
      // Both have the same simple type (string, number, boolean, null) value
      return true;
    } else if (isValueNullOrUndefined(itemValue) && isValueNullOrUndefined(expectedItemValue)) {
      // Both values are missing, which means they can be considered equal
      return true;
    } else if (isValueNullOrUndefined(itemValue) !== isValueNullOrUndefined(expectedItemValue)) {
      // One has a value while the other does not
      return false;
    } else {
      if (itemValue instanceof Array || expectedItemValue instanceof Array) {
        return checkArrayEquality(itemValue, expectedItemValue);
      } else if (typeof itemValue === 'object' || typeof expectedItemValue === 'object') {
        return checkObjectEquality(itemValue, expectedItemValue);
      } else {
        return false;
      }
    }
  }

  function checkArrayEquality(itemValue, expectedItemValue) {
    if (!(itemValue instanceof Array && expectedItemValue instanceof Array)) {
      return false;
    } else if (itemValue.length !== expectedItemValue.length) {
      return false;
    }

    for (var elementIndex = 0; elementIndex < itemValue.length; elementIndex++) {
      var elementValue = itemValue[elementIndex];
      var expectedElementValue = expectedItemValue[elementIndex];

      if (!checkItemEquality(elementValue, expectedElementValue)) {
        return false;
      }
    }

    // If we got here, all elements match
    return true;
  }

  function checkObjectEquality(itemValue, expectedItemValue) {
    if (typeof itemValue !== 'object' || typeof expectedItemValue !== 'object') {
      return false;
    }

    var itemProperties = [ ];
    for (var itemProp in itemValue) {
      itemProperties.push(itemProp);
    }

    for (var expectedItemProp in expectedItemValue) {
      if (itemProperties.indexOf(expectedItemProp) < 0) {
        itemProperties.push(expectedItemProp);
      }
    }

    for (var propIndex = 0; propIndex < itemProperties.length; propIndex++) {
      var propertyName = itemProperties[propIndex];
      var propertyValue = itemValue[propertyName];
      var expectedPropertyValue = expectedItemValue[propertyName];

      if (!checkItemEquality(propertyValue, expectedPropertyValue)) {
        return false;
      }
    }

    // If we got here, all properties match
    return true;
  }

  function minValueInclusiveViolationComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimes(candidateValue, constraintValue) < 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return timeModule.compareDates(candidateValue, constraintValue) < 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimeZones(candidateValue, constraintValue) < 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return normalizeUuid(candidateValue) < normalizeUuid(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue < constraintValue;
        };
    }
  }

  function minValueExclusiveViolationComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimes(candidateValue, constraintValue) <= 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return timeModule.compareDates(candidateValue, constraintValue) <= 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimeZones(candidateValue, constraintValue) <= 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return normalizeUuid(candidateValue) <= normalizeUuid(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue <= constraintValue;
        };
    }
  }

  function maxValueInclusiveViolationComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimes(candidateValue, constraintValue) > 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return timeModule.compareDates(candidateValue, constraintValue) > 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimeZones(candidateValue, constraintValue) > 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return normalizeUuid(candidateValue) > normalizeUuid(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue > constraintValue;
        };
    }
  }

  function maxValueExclusiveViolationComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimes(candidateValue, constraintValue) >= 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return timeModule.compareDates(candidateValue, constraintValue) >= 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimeZones(candidateValue, constraintValue) >= 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return normalizeUuid(candidateValue) >= normalizeUuid(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue >= constraintValue;
        };
    }
  }

  function simpleTypeEqualityComparator(validatorType) {
    switch (validatorType) {
      case 'time':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimes(candidateValue, constraintValue) === 0;
        };
      case 'date':
      case 'datetime':
        return function(candidateValue, constraintValue) {
          return timeModule.compareDates(candidateValue, constraintValue) === 0;
        };
      case 'timezone':
        return function(candidateValue, constraintValue) {
          return timeModule.compareTimeZones(candidateValue, constraintValue) === 0;
        };
      case 'uuid':
        return function(candidateValue, constraintValue) {
          return normalizeUuid(candidateValue) === normalizeUuid(constraintValue);
        };
      default:
        return function(candidateValue, constraintValue) {
          return candidateValue === constraintValue;
        };
    }
  }

  function convertToString(value) {
    if (value instanceof Date) {
      return value.toISOString();
    } else {
      return !isValueNullOrUndefined(value) ? value.toString() : 'null';
    }
  }

  function normalizeUuid(value) {
    return !isValueNullOrUndefined(value) ? value.toLowerCase() : null;
  }
}

// ATTENTION: Please keep these entries organized in alphabetical order

/**
 * Formats a message for the error that occurs when a document includes an attachment when they are not allowed for the document type.
 */
exports.allowAttachmentsViolation = () => {
  return 'document type does not support attachments';
};

/**
 * Formats a message for the error that occurs when there is an attempt to delete a document that cannot be deleted.
 */
exports.cannotDeleteDocViolation = () => {
  return 'documents of this type cannot be deleted';
};

/**
 * Formats a message for the error that occurs when there is an attempt to replace a document that cannot be replaced.
 */
exports.cannotReplaceDocViolation = () => {
  return 'documents of this type cannot be replaced';
};

/**
 * Formats a message for the error that occurs when the format for a date without time and timezone (i.e. a date) is invalid.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[2].dateProp")
 */
exports.dateFormatInvalid = (itemPath) => {
  return 'item "' + itemPath + '" must be ' + getTypeDescription('date');
};

/**
 * Formats a message for the error that occurs when the format for a date with optional time and timezone (i.e. a datetime) is invalid.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[2].datetimeProp")
 */
exports.datetimeFormatInvalid = (itemPath) => {
  return 'item "' + itemPath + '" must be ' + getTypeDescription('datetime');
};

/**
 * Formats a message for the error that occurs when the value of an enum field is not one of the predefined values.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[3].enumProp")
 * @param {(string[]|integer[])} expectedPredefinedValues A list of predefined values that are allowed for the item in question
 */
exports.enumPredefinedValueViolation = (itemPath, expectedPredefinedValues) => {
  return 'item "' + itemPath + '" must be one of the predefined values: ' + expectedPredefinedValues.join(',');
};

/**
 * Formats a message for the error that occurs when a hashtable key is an empty string.
 *
 * @param {string} hashtablePath The full path of the hashtable in which the error occurs (e.g. "objectProp.arrayProp[2].hashtableProp")
 */
exports.hashtableKeyEmpty = (hashtablePath) => {
  return 'hashtable "' + hashtablePath + '" must not have an empty key';
};

/**
 * Formats a message for the error that occurs when a hashtable has more than the maximum number of elements.
 *
 * @param {string} hashtablePath The full path of the hashtable in which the error occurs (e.g. "objectProp.arrayProp[2].hashtableProp")
 * @param {integer} expectedMaximumSize The maximum number of elements
 */
exports.hashtableMaximumSizeViolation = (hashtablePath, expectedMaximumSize) => {
  return 'hashtable "' + hashtablePath + '" must not be larger than ' + expectedMaximumSize + ' elements';
};

/**
 * Formats a message for the error that occurs when a hashtable has less than the minimum number of elements.
 *
 * @param {string} hashtablePath The full path of the hashtable in which the error occurs (e.g. "objectProp.arrayProp[2].hashtableProp")
 * @param {integer} expectedMinimumSize The minimum number of elements
 */
exports.hashtableMinimumSizeViolation = (hashtablePath, expectedMinimumSize) => {
  return 'hashtable "' + hashtablePath + '" must not be smaller than ' + expectedMinimumSize + ' elements';
};

/**
 * Formats a message for the error that occurs when there is an attempt to replace or delete an immutable document.
 */
exports.immutableDocViolation = () => {
  return 'documents of this type cannot be replaced or deleted';
};

/**
 * Formats a message for the error that occurs when there is an attempt to reassign the value of an immutable property or element.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs
 *                          (e.g. "arrayProp[1].hashtableProp[my-key].integerProp")
 */
exports.immutableItemViolation = (itemPath) => {
  return 'item "' + itemPath + '" cannot be modified';
};

/**
 * Formats a message for the error that occurs when a document has more than the maximum number of attachments.
 *
 * @param {integer} maxCount The maximum number of attachments that are allowed
 */
exports.maximumAttachmentCountViolation = (maxCount) => {
  return 'documents of this type must not have more than ' + maxCount + ' attachments';
};

/**
 * Formats a message for the error that occurs when a document's attachment exceeds the maximum individual attachment size.
 *
 * @param {string} attachmentName The name of the attachment in question
 * @param {integer} maxSize The maximum size, in bytes, that is allowed
 */
exports.maximumIndividualAttachmentSizeViolation = (attachmentName, maxSize) => {
  return 'attachment ' + attachmentName + ' must not exceed ' + maxSize + ' bytes';
};

/**
 * Formats a message for the error that occurs when a string or array's length is greater than the maximum allowed.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[2].stringProp")
 * @param {integer} maxLength The maximum length that is allowed
 */
exports.maximumLengthViolation = (itemPath, maxLength) => {
  return 'length of item "' + itemPath + '" must not be greater than ' + maxLength;
};

/**
 * Formats a message for the error that occurs when an attachment reference points to a file that is larger than the maximum allowed size.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs
 *                          (e.g. "hashtableProp[my-key].attachmentRefProp")
 * @param {integer} maxSize The maximum size, in bytes, that is allowed
 */
exports.maximumSizeAttachmentViolation = (itemPath, maxSize) => {
  return 'attachment reference "' + itemPath + '" must not be larger than ' + maxSize + ' bytes';
};

/**
 * Formats a message for the error that occurs when a document's attachments exceed the maximum total attachment size.
 *
 * @param {integer} maxSize The maximum size, in bytes, that is allowed
 */
exports.maximumTotalAttachmentSizeViolation = (maxSize) => {
  return 'documents of this type must not have a combined attachment size greater than ' + maxSize + ' bytes';
};

/**
 * Formats a message for the error that occurs when a value is greater than the maximum allowed.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[2].integerProp")
 * @param {(float|integer|string)} maxValue The maximum value that is allowed
 */
exports.maximumValueViolation = (itemPath, maxValue) => {
  return 'item "' + itemPath + '" must not be greater than ' + maxValue;
};

/**
 * Formats a message for the error that occurs when a value is greater than or equal to the maximum allowed.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.dateProp")
 * @param {(float|integer|string)} maxValue The maximum value (exclusive) that is allowed
 */
exports.maximumValueExclusiveViolation = (itemPath, maxValue) => {
  return 'item "' + itemPath + '" must not be greater than or equal to ' + maxValue;
};

/**
 * Formats a message for the error that occurs when a string or array's length is less than the minimum allowed.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp")
 * @param {integer} minLength The minimum length that is allowed
 */
exports.minimumLengthViolation = (itemPath, minLength) => {
  return 'length of item "' + itemPath + '" must not be less than ' + minLength;
};

/**
 * Formats a message for the error that occurs when a value is less than the minimum allowed.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[2].floatProp")
 * @param {(float|integer|string)} minValue The minimum value that is allowed
 */
exports.minimumValueViolation = (itemPath, minValue) => {
  return 'item "' + itemPath + '" must not be less than ' + minValue;
};

/**
 * Formats a message for the error that occurs when a value is less than or equal to the minimum allowed.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "arrayProp[0].datetimeProp")
 * @param {(float|integer|string)} minValue The minimum value (exclusive) that is allowed
 */
exports.minimumValueExclusiveViolation = (itemPath, minValue) => {
  return 'item "' + itemPath + '" must not be less than or equal to ' + minValue;
};

/**
 * Formats a message for the error that occurs when a string has leading or trailing whitespace even though it is forbidden.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "hashtableProp[my-key].stringProp")
 */
exports.mustBeTrimmedViolation = (itemPath) => {
  return 'item "' + itemPath + '" must not have any leading or trailing whitespace';
};

/**
 * Formats a message for the error that occurs when a value does not equal the expected value.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.integerProp")
 * @param {*} expectedItemValue The value that is expected
 */
exports.mustEqualViolation = (itemPath, expectedItemValue) => {
  return 'value of item "' + itemPath + '" must equal ' + JSON.stringify(expectedItemValue);
};

/**
 * Formats a message for the error that occurs when there is an attempt to assign an empty string or array to a property or element where
 * that is forbidden.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "hashtableProp[my-key].stringProp")
 */
exports.mustNotBeEmptyViolation = (itemPath) => {
  return 'item "' + itemPath + '" must not be empty';
};

/**
 * Formats a message for the error that occurs when a property or element value is not allowed to be missing/undefined.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[2].booleanProp")
 */
exports.mustNotBeMissingValueViolation = (itemPath) => {
  return 'item "' + itemPath + '" must not be missing';
};

/**
 * Formats a message for the error that occurs when a property or element value is not allowed to be null.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[2].integerProp")
 */
exports.mustNotBeNullValueViolation = (itemPath) => {
  return 'item "' + itemPath + '" must not be null';
};

/**
 * Formats a message for the error that occurs when a hashtable key fails to satisfy the regular expression pattern.
 *
 * @param {string} hashtableKeyPath The full path of the hashtable key in which the error occurs
 *                                  (e.g. "objectProp.hashtableProp[my-key]")
 * @param {RegExp} expectedRegex The regular expression pattern that is expected
 */
exports.regexPatternHashtableKeyViolation = (hashtableKeyPath, expectedRegex) => {
  return 'hashtable key "' + hashtableKeyPath + '" must conform to expected format ' + expectedRegex;
};

/**
 * Formats a message for the error that occurs when a property or element value fails to satisfy the regular expression pattern.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "hashtableProp[my-key].stringProp")
 * @param {RegExp} expectedRegex The regular expression pattern that is expected
 */
exports.regexPatternItemViolation = (itemPath, expectedRegex) => {
  return 'item "' + itemPath + '" must conform to expected format ' + expectedRegex;
};

/**
 * Formats a message for the error that occurs when a file attachment violates the constraint that all of that document type's file
 * attachments must have a corresponding attachment reference property.
 *
 * @param {string} attachmentName The name of the attachment in question
 */
exports.requireAttachmentReferencesViolation = (attachmentName) => {
  return 'attachment ' + attachmentName + ' must have a corresponding attachment reference property';
};

/**
 * Formats a message for the error that occurs when a required property or element value is null or undefined.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[2].booleanProp")
 */
exports.requiredValueViolation = (itemPath) => {
  return 'item "' + itemPath + '" must not be null or missing';
};

/**
 * Formats a message for the error that occurs when a file attachment reference is not one of the supported content types.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.attachmentRefProp")
 * @param {string[]} expectedContentTypes An array of content types that are expected (e.g. [ 'image/png', 'image/gif', 'image/jpeg' ]).
 *                                        Element order must match that set in the validator in the document definition.
 */
exports.supportedContentTypesAttachmentReferenceViolation = (itemPath, expectedContentTypes) => {
  const contentTypesString = expectedContentTypes.join(',');

  return 'attachment reference "' + itemPath + '" must have a supported content type (' + contentTypesString + ')';
};

/**
 * Formats a message for the error that occurs when a file attachment is not one of the supported content types.
 *
 * @param {string} attachmentName The name of the attachment in question
 * @param {string[]} expectedContentTypes An array of content types that are expected (e.g. [ 'image/png', 'image/gif', 'image/jpeg' ]).
 *                                        Element order must match that set in the validator in the document definition.
 */
exports.supportedContentTypesRawAttachmentViolation = (attachmentName, expectedContentTypes) => {
  const contentTypesString = expectedContentTypes.join(',');

  return 'attachment "' + attachmentName + '" must have a supported content type (' + contentTypesString + ')';
};

/**
 * Formats a message for the error that occurs when a file attachment reference does not have one of the supported file extensions.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "arrayProp[0].attachmentRefProp")
 * @param {string[]} expectedFileExtensions An array of file extensions that are expected (e.g. [ 'png', 'gif', 'jpg', 'jpeg' ]).
 *                                          Element order must match that set in the validator in the document definition.
 */
exports.supportedExtensionsAttachmentReferenceViolation = (itemPath, expectedFileExtensions) => {
  const extensionsString = expectedFileExtensions.join(',');

  return 'attachment reference "' + itemPath + '" must have a supported file extension (' + extensionsString + ')';
};

/**
 * Formats a message for the error that occurs when a file attachment does not have one of the supported file extensions.
 *
 * @param {string} attachmentName The name of the attachment in question
 * @param {string[]} expectedFileExtensions An array of file extensions that are expected (e.g. [ 'png', 'gif', 'jpg', 'jpeg' ]).
 *                                          Element order must match that set in the validator in the document definition.
 */
exports.supportedExtensionsRawAttachmentViolation = (attachmentName, expectedFileExtensions) => {
  const extensionsString = expectedFileExtensions.join(',');

  return 'attachment "' + attachmentName + '" must have a supported file extension (' + extensionsString + ')';
};

/**
 * Formats a message for the error that occurs when the format for a time without date and timezone (i.e. a time) is invalid.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[2].timeProp")
 */
exports.timeFormatInvalid = (itemPath) => {
  return 'item "' + itemPath + '" must be ' + getTypeDescription('time');
};

/**
 * Formats a message for the error that occurs when the format for a time zone is invalid.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.timezoneProp")
 */
exports.timezoneFormatInvalid = (itemPath) => {
  return 'item "' + itemPath + '" must be ' + getTypeDescription('timezone');
};

/**
 * Formats a message for the error that occurs when a property or element's type does not match what is defined by the validator.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "arrayProp[2].datetimeProp")
 * @param {string} expectedType The validation type that was expected (e.g. "array", "attachmentReference", "boolean", "date", "datetime",
 *                              "float", "hashtable", "integer", "object", "string"). Throws an exception if the type is not recognized.
 */
exports.typeConstraintViolation = (itemPath, expectedType) => {
  return 'item "' + itemPath + '" must be ' + getTypeDescription(expectedType);
};

/**
 * Formats a message for the error that occurs when the document type is unrecognized.
 */
exports.unknownDocumentType = () => {
  return 'Unknown document type';
};

/**
 * Formats a message for the error that occurs when an unrecognized property is discovered at the root level of a document or in an
 * object nested in a document.
 *
 * @param {string} propertyPath The full path of the property or element in which the error occurs
 *                              (e.g. "arrayProp[1].objectProp.unknownProp")
 */
exports.unsupportedProperty = (propertyPath) => {
  return 'property "' + propertyPath + '" is not supported';
};

/**
 * Formats a message for the error that occurs when the format for a UUID is invalid.
 *
 * @param {string} itemPath The full path of the property or element in which the error occurs (e.g. "objectProp.arrayProp[10].uuidProp")
 */
exports.uuidFormatInvalid = (itemPath) => {
  return 'item "' + itemPath + '" must be ' + getTypeDescription('uuid');
};

function getTypeDescription(type) {
  switch (type) {
    case 'array':
      return 'an array';
    case 'attachmentReference':
      return 'an attachment reference string';
    case 'boolean':
      return 'a boolean';
    case 'date':
      return 'an ECMAScript simplified ISO 8601 date string with no time or time zone components';
    case 'datetime':
      return 'an ECMAScript simplified ISO 8601 date string with optional time and time zone components';
    case 'enum':
      return 'an integer or a string';
    case 'float':
      return 'a floating point or integer number';
    case 'hashtable':
      return 'an object/hashtable';
    case 'integer':
      return 'an integer';
    case 'object':
      return 'an object';
    case 'string':
      return 'a string';
    case 'time':
      return 'an ECMAScript simplified ISO 8601 time string with no date or time zone components';
    case 'timezone':
      return 'an ECMAScript simplified ISO 8601 time zone string';
    case 'uuid':
      return 'a UUID string';
    default:
      throw new Error('Unrecognized validation type: ' + type);
  }
}

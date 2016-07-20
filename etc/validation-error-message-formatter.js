// Please keep these entries organized in alphabetical order

exports.allowAttachmentsViolation = function() {
  return 'document type does not support attachments';
};

exports.cannotDeleteDocViolation = function() {
  return 'documents of this type cannot be deleted';
};

exports.cannotReplaceDocViolation = function() {
  return 'documents of this type cannot be replaced';
};

exports.dateFormatInvalid = function(itemPath) {
  return 'item "' + itemPath + '" must be an ISO 8601 date string with no time or time zone components';
};

exports.datetimeFormatInvalid = function(itemPath) {
  return 'item "' + itemPath + '" must be an ISO 8601 date string with optional time and time zone components';
};

exports.hashtableKeyEmpty = function(hashtablePath) {
  return 'empty hashtable key in item "' + hashtablePath + '" is not allowed';
};

exports.immutableDocViolation = function() {
  return 'documents of this type cannot be replaced or deleted';
};

exports.immutableItemViolation = function(itemPath) {
  return 'value of item "' + itemPath + '" may not be modified';
};

exports.maximumLengthViolation = function(itemPath, maxLength) {
  return 'length of item "' + itemPath + '" must not be greater than ' + maxLength;
};

exports.maximumSizeAttachmentViolation = function(itemPath, maxSize) {
  return 'attachment reference "' + itemPath + '" must not be larger than ' + maxSize + ' bytes';
};

exports.maximumValueViolation = function(itemPath, maxValue) {
  return 'item "' + itemPath + '" must not be greater than ' + maxValue;
};

exports.minimumLengthViolation = function(itemPath, minLength) {
  return 'length of item "' + itemPath + '" must not be less than ' + minLength;
};

exports.minimumValueViolation = function(itemPath, minValue) {
  return 'item "' + itemPath + '" must not be less than ' + minValue;
};

exports.mustNotBeEmptyViolation = function(itemPath) {
  return 'item "' + itemPath + '" must not be empty';
};

exports.regexPatternHashtableKeyViolation = function(itemPath, expectedRegex) {
  return 'hashtable key "' + itemPath + '" does not conform to expected format ' + expectedRegex;
};

exports.regexPatternItemViolation = function(itemPath, expectedRegex) {
  return 'item "' + itemPath + '" must conform to expected format ' + expectedRegex;
};

exports.requiredValueViolation = function(itemPath) {
  return 'required item "' + itemPath + '" is missing';
};

exports.supportedContentTypesAttachmentViolation = function(itemPath, expectedContentTypes) {
  var contentTypesString = expectedContentTypes.join(',');

  return 'attachment reference "' + itemPath + '" must have a supported content type (' + contentTypesString + ')';
};

exports.supportedExtensionsAttachmentViolation = function(itemPath, expectedFileExtensions) {
  var extensionsString = expectedFileExtensions.join(',');

  return 'attachment reference "' + itemPath + '" must have a supported file extension (' + extensionsString + ')';
};

exports.typeConstraintViolation = function(itemPath, expectedType) {
  var typeDescription = getTypeDescription(expectedType);
  if (expectedType === 'attachmentReference') {
    // Attachment references have a slightly different error message format
    return 'attachment reference "' + itemPath + '" must be ' + typeDescription;
  } else {
    return 'item "' + itemPath + '" must be ' + typeDescription;
  }
};

exports.unsupportedProperty = function(propertyPath) {
  return 'property "' + propertyPath + '" is not supported';
};

function getTypeDescription(type) {
  switch (type) {
    case 'array':
      return 'an array';
    case 'attachmentReference':
      return 'a string';
    case 'boolean':
      return 'a boolean';
    case 'date':
      return 'an ISO 8601 date string with no time or time zone components';
    case 'datetime':
      return 'an ISO 8601 date string with optional time and time zone components';
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
    default:
      throw new Error('Unrecognized validation type: ' + expectedType);
  }
}

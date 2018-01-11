// DEPRECATION NOTICE: This module has been deprecated in favour of src/validation-error-message-formatter.js

var deprecate = require('util').deprecate;
var errorFormatter = require('../src/validation-error-message-formatter.js');

var deprecationMessage = 'The etc/validation-error-message-formatter.js module has been deprecated. Use src/validation-error-message-formatter.js instead.';

exports.allowAttachmentsViolation = deprecate(errorFormatter.allowAttachmentsViolation, deprecationMessage);
exports.cannotDeleteDocViolation = deprecate(errorFormatter.cannotDeleteDocViolation, deprecationMessage);
exports.cannotReplaceDocViolation = deprecate(errorFormatter.cannotReplaceDocViolation, deprecationMessage);
exports.dateFormatInvalid = deprecate(errorFormatter.dateFormatInvalid, deprecationMessage);
exports.datetimeFormatInvalid = deprecate(errorFormatter.datetimeFormatInvalid, deprecationMessage);
exports.enumPredefinedValueViolation = deprecate(errorFormatter.enumPredefinedValueViolation, deprecationMessage);
exports.hashtableKeyEmpty = deprecate(errorFormatter.hashtableKeyEmpty, deprecationMessage);
exports.hashtableMaximumSizeViolation = deprecate(errorFormatter.hashtableMaximumSizeViolation, deprecationMessage);
exports.hashtableMinimumSizeViolation = deprecate(errorFormatter.hashtableMinimumSizeViolation, deprecationMessage);
exports.immutableDocViolation = deprecate(errorFormatter.immutableDocViolation, deprecationMessage);
exports.immutableItemViolation = deprecate(errorFormatter.immutableItemViolation, deprecationMessage);
exports.maximumAttachmentCountViolation = deprecate(errorFormatter.maximumAttachmentCountViolation, deprecationMessage);
exports.maximumIndividualAttachmentSizeViolation =
  deprecate(errorFormatter.maximumIndividualAttachmentSizeViolation, deprecationMessage);
exports.maximumLengthViolation = deprecate(errorFormatter.maximumLengthViolation, deprecationMessage);
exports.maximumSizeAttachmentViolation = deprecate(errorFormatter.maximumSizeAttachmentViolation, deprecationMessage);
exports.maximumTotalAttachmentSizeViolation = deprecate(errorFormatter.maximumTotalAttachmentSizeViolation, deprecationMessage);
exports.maximumValueViolation = deprecate(errorFormatter.maximumValueViolation, deprecationMessage);
exports.maximumValueExclusiveViolation = deprecate(errorFormatter.maximumValueExclusiveViolation, deprecationMessage);
exports.minimumLengthViolation = deprecate(errorFormatter.minimumLengthViolation, deprecationMessage);
exports.minimumValueViolation = deprecate(errorFormatter.minimumValueViolation, deprecationMessage);
exports.minimumValueExclusiveViolation = deprecate(errorFormatter.minimumValueExclusiveViolation, deprecationMessage);
exports.mustNotBeEmptyViolation = deprecate(errorFormatter.mustNotBeEmptyViolation, deprecationMessage);
exports.regexPatternHashtableKeyViolation = deprecate(errorFormatter.regexPatternHashtableKeyViolation, deprecationMessage);
exports.regexPatternItemViolation = deprecate(errorFormatter.regexPatternItemViolation, deprecationMessage);
exports.requireAttachmentReferencesViolation = deprecate(errorFormatter.requireAttachmentReferencesViolation, deprecationMessage);
exports.requiredValueViolation = deprecate(errorFormatter.requiredValueViolation, deprecationMessage);
exports.supportedContentTypesAttachmentReferenceViolation =
  deprecate(errorFormatter.supportedContentTypesAttachmentReferenceViolation, deprecationMessage);
exports.supportedContentTypesAttachmentViolation =
  deprecate(errorFormatter.supportedContentTypesAttachmentReferenceViolation, deprecationMessage);
exports.supportedContentTypesRawAttachmentViolation =
  deprecate(errorFormatter.supportedContentTypesRawAttachmentViolation, deprecationMessage);
exports.supportedExtensionsAttachmentReferenceViolation =
  deprecate(errorFormatter.supportedExtensionsAttachmentReferenceViolation, deprecationMessage);
exports.supportedExtensionsAttachmentViolation =
  deprecate(errorFormatter.supportedExtensionsAttachmentReferenceViolation, deprecationMessage);
exports.supportedExtensionsRawAttachmentViolation =
  deprecate(errorFormatter.supportedExtensionsRawAttachmentViolation, deprecationMessage);
exports.typeConstraintViolation = deprecate(errorFormatter.typeConstraintViolation, deprecationMessage);
exports.unknownDocumentType = deprecate(errorFormatter.unknownDocumentType, deprecationMessage);
exports.unsupportedProperty = deprecate(errorFormatter.unsupportedProperty, deprecationMessage);

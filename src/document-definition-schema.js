var joi = require('joi');

var nonEmptyString = joi.string().min(1);
var arrayOrSingleItem = joi.array().single();
var booleanOrFunction = function(maxArity) {
  return joi.alternatives().try(
    joi.boolean(),
    joi.func().maxArity(maxArity));
};
var authorizationDefinition = joi.alternatives().try(
  joi.object().keys(
    {
      add: arrayOrSingleItem.items(nonEmptyString),
      replace: arrayOrSingleItem.items(nonEmptyString),
      remove: arrayOrSingleItem.items(nonEmptyString),
      write: arrayOrSingleItem.items(nonEmptyString)
    }),
  joi.func().maxArity(2));
var accessAssignmentEntryProperty = joi.alternatives().try(
  arrayOrSingleItem.min(1).items(nonEmptyString),
  joi.func().maxArity(2));
var customActionEvent = joi.func().maxArity(3);

module.exports = exports = joi.object().keys({
  typeFilter: joi.func().required().maxArity(3),
  allowUnknownProperties: booleanOrFunction(2),
  immutable: booleanOrFunction(2),
  cannotReplace: booleanOrFunction(2),
  cannotDelete: booleanOrFunction(2),

  allowAttachments: booleanOrFunction(2),
  attachmentConstraints: joi.alternatives().try(
    joi.object().keys({
      requireAttachmentReferences: booleanOrFunction(2),
      maximumAttachmentCount: joi.alternatives().try(
        joi.number().integer().min(0),
        joi.func().maxArity(2)),
      maximumIndividualSize: joi.alternatives().try(
        joi.number().integer().min(0).max(20971520),
        joi.func().maxArity(2)),
      maximumTotalSize: joi.alternatives().try(
        joi.number().integer().min(0),
        joi.func().maxArity(2)),
      supportedExtensions: joi.alternatives().try(
        joi.array().items(nonEmptyString),
        joi.func().maxArity(2)),
      supportedContentTypes: joi.alternatives().try(
        joi.array().items(nonEmptyString),
        joi.func().maxArity(2))
    }),
    joi.func().maxArity(2)
  ),

  channels: joi.alternatives().try(
    joi.object().keys(
      {
        view: arrayOrSingleItem.items(nonEmptyString),
        add: arrayOrSingleItem.items(nonEmptyString),
        replace: arrayOrSingleItem.items(nonEmptyString),
        remove: arrayOrSingleItem.items(nonEmptyString),
        write: arrayOrSingleItem.items(nonEmptyString)
      }),
    joi.func().maxArity(2)),
  authorizedRoles: authorizationDefinition,
  authorizedUsers: authorizationDefinition,

  accessAssignments: joi.array().items(
    joi.alternatives().try(
      // Each access assignment may be either a channel assignment
      joi.object().keys({
        type: joi.string().optional().only([ 'channel', null ]),
        channels: accessAssignmentEntryProperty.required(),
        roles: accessAssignmentEntryProperty,
        users: accessAssignmentEntryProperty
      }).or('roles', 'users'), // At least one of "roles" or "users" must be defined for a channel assignment

      // ... or a role assignment
      joi.object().keys({
        type: joi.string().required().only('role'),
        roles: accessAssignmentEntryProperty.required(),
        users: accessAssignmentEntryProperty.required()
      }))),

  customActions: joi.object().keys({
    onTypeIdentificationSucceeded: customActionEvent,
    onAuthorizationSucceeded: customActionEvent,
    onValidationSucceeded: customActionEvent,
    onAccessAssignmentsSucceeded: customActionEvent,
    onDocumentChannelAssignmentSucceeded: customActionEvent
  }),

  propertyValidators: joi.alternatives().try(
    joi.object().required().unknown(true),
    joi.func().maxArity(2))
})
  // At least one of "channels", "authorizedRoles" or "authorizedUsers" must be defined
  .or('channels', 'authorizedRoles', 'authorizedUsers')
  // It makes no sense to set "immutable" with either of "cannotReplace" or "cannotDelete"
  .without('immutable', [ 'cannotReplace', 'cannotDelete' ])
  // When "attachmentConstraints" is defined, then "allowAttachments" should also be defined
  .with('attachmentConstraints', 'allowAttachments');

var joi = require('joi');
var propertyValidatorSchema = require('./property-validator-schema');
var wrapDynamicConstraint = require('./dynamic-constraint-wrapper');

var integer = joi.number().integer();
var nonEmptyString = joi.string().min(1);
var arrayOrSingleItem = joi.array().single();
var customActionEvent = joi.func().maxArity(3);

var authorizationDefinition = constraintSchema(
  joi.object().keys(
    {
      add: arrayOrSingleItem.items(nonEmptyString),
      replace: arrayOrSingleItem.items(nonEmptyString),
      remove: arrayOrSingleItem.items(nonEmptyString),
      write: arrayOrSingleItem.items(nonEmptyString)
    }));

var accessAssignmentEntryProperty = constraintSchema(arrayOrSingleItem.min(1).items(nonEmptyString));

/**
 * The full schema for a single document definition object.
 */
module.exports = exports = joi.object().keys({
  typeFilter: joi.func().required().maxArity(3),
  allowUnknownProperties: constraintSchema(joi.boolean()),
  immutable: constraintSchema(joi.boolean()),
  cannotReplace: constraintSchema(joi.boolean()),
  cannotDelete: constraintSchema(joi.boolean()),

  allowAttachments: constraintSchema(joi.boolean()),
  attachmentConstraints: constraintSchema(
    joi.object().keys(
      {
        requireAttachmentReferences: constraintSchema(joi.boolean()),
        maximumAttachmentCount: constraintSchema(integer.min(0)),
        maximumIndividualSize: constraintSchema(integer.min(0).max(20971520)),
        maximumTotalSize: constraintSchema(integer.min(0)),
        supportedExtensions: constraintSchema(joi.array().items(joi.string())),
        supportedContentTypes: constraintSchema(joi.array().items(nonEmptyString))
      })),

  channels: constraintSchema(
    joi.object().keys(
      {
        view: arrayOrSingleItem.items(nonEmptyString), // The other auth types deliberately omit this permission type
        add: arrayOrSingleItem.items(nonEmptyString),
        replace: arrayOrSingleItem.items(nonEmptyString),
        remove: arrayOrSingleItem.items(nonEmptyString),
        write: arrayOrSingleItem.items(nonEmptyString)
      })),
  authorizedRoles: authorizationDefinition,
  authorizedUsers: authorizationDefinition,

  accessAssignments: joi.array().items(
    joi.object().keys({ type: joi.string().only([ 'channel', 'role', null ]) })
      // Each access assignment may be either a role assignment
      .when(
        joi.object().unknown().keys({ type: joi.string().required().only('role') }),
        {
          then: joi.object().keys({
            type: joi.string(),
            roles: accessAssignmentEntryProperty.required(),
            users: accessAssignmentEntryProperty.required()
          })
        })

      // ... or a channel assignment
      .when(
        joi.object().unknown().keys({ type: joi.string().optional().only([ 'channel', null ]) }),
        {
          then: joi.object().keys({
            type: joi.string(),
            channels: accessAssignmentEntryProperty.required(),
            roles: accessAssignmentEntryProperty,
            users: accessAssignmentEntryProperty
          }).or('roles', 'users') // At least one of "roles" or "users" must be provided
        })),

  customActions: joi.object().keys({
    onTypeIdentificationSucceeded: customActionEvent,
    onAuthorizationSucceeded: customActionEvent,
    onValidationSucceeded: customActionEvent,
    onAccessAssignmentsSucceeded: customActionEvent,
    onDocumentChannelAssignmentSucceeded: customActionEvent
  }),

  propertyValidators: constraintSchema(
    joi.object().pattern(
      /^[^_].*$/, // Sync Gateway does not allow top-level document property names to start with an underscore
      propertyValidatorSchema)).required()
})
  // At least one of "channels", "authorizedRoles" or "authorizedUsers" must be defined
  .or('channels', 'authorizedRoles', 'authorizedUsers')
  // It makes no sense to set "immutable" with either of "cannotReplace" or "cannotDelete"
  .without('immutable', [ 'cannotReplace', 'cannotDelete' ])
  // When "attachmentConstraints" is defined, then "allowAttachments" should also be defined
  .with('attachmentConstraints', 'allowAttachments');

// Generates a schema that can be used for top-level document definition property constraints
function constraintSchema(wrappedSchema) {
  return wrapDynamicConstraint(wrappedSchema, 2);
}

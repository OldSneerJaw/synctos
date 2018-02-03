var joi = require('joi');
var propertyValidatorSchema = require('./property-validator-schema');
var makeConstraintSchemaDynamic = require('./dynamic-constraint-schema-maker');

var integer = joi.number().integer();
var nonEmptyString = joi.string().min(1);
function arrayOrSingleItem(singleItemType, minimumLength) {
  return joi.any()
    .when(
      joi.array(),
      {
        then: joi.array().min(minimumLength || 0).items(singleItemType),
        otherwise: singleItemType
      }
    );
}
var customActionEvent = joi.func().maxArity(3); // Function parameters: doc, oldDoc, customActionMetadata

var authorizationDefinition = constraintSchema(
  joi.object().min(1).keys(
    {
      add: arrayOrSingleItem(nonEmptyString),
      replace: arrayOrSingleItem(nonEmptyString),
      remove: arrayOrSingleItem(nonEmptyString),
      write: arrayOrSingleItem(nonEmptyString)
    }));

var accessAssignmentEntryProperty = constraintSchema(arrayOrSingleItem(nonEmptyString, 1));

/**
 * The full schema for a single document definition object.
 */
module.exports = exports = joi.object().options({ convert: false }).keys({
  typeFilter: joi.func().required().maxArity(3), // Function parameters: doc, oldDoc, docType
  allowUnknownProperties: constraintSchema(joi.boolean()),
  immutable: constraintSchema(joi.boolean()),
  cannotReplace: constraintSchema(joi.boolean()),
  cannotDelete: constraintSchema(joi.boolean()),

  allowAttachments: joi.any().when(
    // "allowAttachments" must be true or a function if "attachmentConstraints" is defined
    'attachmentConstraints',
    {
      is: joi.any().exist(),
      then: constraintSchema(joi.boolean().only(true)).required(),
      otherwise: constraintSchema(joi.boolean())
    }),
  attachmentConstraints: constraintSchema(
    joi.object().min(1).keys(
      {
        requireAttachmentReferences: constraintSchema(joi.boolean()),
        maximumAttachmentCount: constraintSchema(integer.min(1)),
        maximumIndividualSize: constraintSchema(integer.min(1).max(20971520)),
        maximumTotalSize: constraintSchema(
          integer.when(
            'maximumIndividualSize',
            {
              is: integer.exist(),
              then: integer.min(joi.ref('maximumIndividualSize')),
              otherwise: integer.min(1)
            })),
        supportedExtensions: constraintSchema(joi.array().min(1).items(joi.string())),
        supportedContentTypes: constraintSchema(joi.array().min(1).items(nonEmptyString))
      })),

  channels: constraintSchema(
    joi.object().min(1).keys(
      {
        view: arrayOrSingleItem(nonEmptyString), // The other auth types deliberately omit this permission type
        add: arrayOrSingleItem(nonEmptyString),
        replace: arrayOrSingleItem(nonEmptyString),
        remove: arrayOrSingleItem(nonEmptyString),
        write: arrayOrSingleItem(nonEmptyString)
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

  customActions: joi.object().min(1).keys({
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
  .without('immutable', [ 'cannotReplace', 'cannotDelete' ]);

// Generates a schema that can be used for top-level document definition property constraints
function constraintSchema(wrappedSchema) {
  // The function schema this creates will support no more than two parameters (doc, oldDoc)
  return makeConstraintSchemaDynamic(wrappedSchema, 2);
}

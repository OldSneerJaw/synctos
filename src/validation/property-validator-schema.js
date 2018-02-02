var joi = require('joi');
var makeConstraintSchemaDynamic = require('./dynamic-constraint-schema-maker');

var integer = joi.number().integer();
var dateOnly = joi.any()
  .when(
    joi.string(),
    { then: joi.string().regex(/^(([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))$/) })
  .when(
    joi.any(),
    { then: joi.date().options({ convert: false }) });

var validPropertyTypes =
  [ 'string', 'integer', 'float', 'boolean', 'datetime', 'date', 'enum', 'uuid', 'attachmentReference', 'array', 'object', 'hashtable' ];

var universalConstraints = {
  type: constraintSchema(joi.string()).required(),
  required: constraintSchema(joi.boolean()),
  mustNotBeMissing: constraintSchema(joi.boolean()),
  mustNotBeNull: constraintSchema(joi.boolean()),
  immutable: constraintSchema(joi.boolean()),
  immutableStrict: constraintSchema(joi.boolean()),
  immutableWhenSet: constraintSchema(joi.boolean()),
  immutableWhenSetStrict: constraintSchema(joi.boolean()),
  mustEqual: constraintSchema(joi.any()),
  mustEqualStrict: constraintSchema(joi.any()),
  customValidation: joi.func().maxArity(4) // Function parameters: doc, oldDoc, currentItemElement, validationItemStack
};

var schema = joi.object().keys({
  type: constraintSchema(joi.string().only(validPropertyTypes)).required()
})
  .when(
    joi.object().unknown().keys({ type: 'string' }),
    { then: typeConstraintsSchema('string') })
  .when(
    joi.object().unknown().keys({ type: 'integer' }),
    { then: typeConstraintsSchema('integer') })
  .when(
    joi.object().unknown().keys({ type: 'float' }),
    { then: typeConstraintsSchema('float') })
  .when(
    joi.object().unknown().keys({ type: 'boolean' }),
    { then: typeConstraintsSchema('boolean') })
  .when(
    joi.object().unknown().keys({ type: 'datetime' }),
    { then: typeConstraintsSchema('datetime') })
  .when(
    joi.object().unknown().keys({ type: 'date' }),
    { then: typeConstraintsSchema('date') })
  .when(
    joi.object().unknown().keys({ type: 'enum' }),
    { then: typeConstraintsSchema('enum') })
  .when(
    joi.object().unknown().keys({ type: 'uuid' }),
    { then: typeConstraintsSchema('uuid') })
  .when(
    joi.object().unknown().keys({ type: 'attachmentReference' }),
    { then: typeConstraintsSchema('attachmentReference') })
  .when(
    joi.object().unknown().keys({ type: 'array' }),
    { then: typeConstraintsSchema('array') })
  .when(
    joi.object().unknown().keys({ type: 'object' }),
    { then: typeConstraintsSchema('object') })
  .when(
    joi.object().unknown().keys({ type: 'hashtable' }),
    { then: typeConstraintsSchema('hashtable') })
  .when(
    joi.object().unknown().keys({ type: joi.func() }),
    { then: joi.object().unknown() });

/**
 * A partial schema for a single entry in a "propertyValidators" object at either the top level of a document definition
 * or nested within an "object" validator.
 */
module.exports = exports = schema;

function maximumSizeConstraint(minimumSizePropertyName) {
  return joi.any().when(
    minimumSizePropertyName,
    {
      is: joi.number().exist(),
      then: constraintSchema(integer.min(joi.ref(minimumSizePropertyName))),
      otherwise: constraintSchema(integer.min(0))
    });
}

// Defined as a function rather than a plain object because it contains lazy references that result in recursive
// references between the complex types (e.g. "array", "object", "hashtable") and the main "propertyValidators" schema
function typeSpecificConstraints() {
  return {
    string: {
      mustNotBeEmpty: constraintSchema(joi.boolean()),
      regexPattern: constraintSchema(joi.object().type(RegExp)),
      minimumLength: constraintSchema(integer.min(0)),
      maximumLength: maximumSizeConstraint('minimumLength'),
      minimumValue: constraintSchema(joi.string()),
      minimumValueExclusive: constraintSchema(joi.string()),
      maximumValue: constraintSchema(joi.string()),
      maximumValueExclusive: constraintSchema(joi.string())
    },
    integer: {
      minimumValue: constraintSchema(integer),
      minimumValueExclusive: constraintSchema(integer),
      maximumValue: constraintSchema(integer),
      maximumValueExclusive: constraintSchema(integer)
    },
    float: {
      minimumValue: constraintSchema(joi.number()),
      minimumValueExclusive: constraintSchema(joi.number()),
      maximumValue: constraintSchema(joi.number()),
      maximumValueExclusive: constraintSchema(joi.number())
    },
    boolean: { },
    datetime: {
      minimumValue: constraintSchema(joi.date()),
      minimumValueExclusive: constraintSchema(joi.date()),
      maximumValue: constraintSchema(joi.date()),
      maximumValueExclusive: constraintSchema(joi.date())
    },
    date: {
      minimumValue: constraintSchema(dateOnly),
      minimumValueExclusive: constraintSchema(dateOnly),
      maximumValue: constraintSchema(dateOnly),
      maximumValueExclusive: constraintSchema(dateOnly)
    },
    enum: {
      predefinedValues: constraintSchema(joi.array().required().min(1).items([ integer, joi.string() ]))
    },
    uuid: {
      minimumValue: constraintSchema(joi.string().uuid()),
      minimumValueExclusive: constraintSchema(joi.string().uuid()),
      maximumValue: constraintSchema(joi.string().uuid()),
      maximumValueExclusive: constraintSchema(joi.string().uuid())
    },
    attachmentReference: {
      maximumSize: constraintSchema(integer.min(1).max(20971520)),
      supportedExtensions: constraintSchema(joi.array().min(1).items(joi.string())),
      supportedContentTypes: constraintSchema(joi.array().min(1).items(joi.string().min(1)))
    },
    array: {
      mustNotBeEmpty: constraintSchema(joi.boolean()),
      minimumLength: constraintSchema(integer.min(0)),
      maximumLength: maximumSizeConstraint('minimumLength'),
      arrayElementsValidator: constraintSchema(joi.lazy(function() { return schema; }))
    },
    object: {
      allowUnknownProperties: constraintSchema(joi.boolean()),
      propertyValidators: constraintSchema(joi.object().min(1).pattern(/^.+$/, joi.lazy(function() { return schema; })))
    },
    hashtable: {
      minimumSize: constraintSchema(integer.min(0)),
      maximumSize: maximumSizeConstraint('minimumSize'),
      hashtableKeysValidator: constraintSchema(joi.object().keys({
        mustNotBeEmpty: constraintSchema(joi.boolean()),
        regexPattern: constraintSchema(joi.object().type(RegExp))
      })),
      hashtableValuesValidator: constraintSchema(joi.lazy(function() { return schema; }))
    }
  };
}

// Creates a validation schema for the constraints of the specified type
function typeConstraintsSchema(typeName) {
  var allTypeConstraints = typeSpecificConstraints();
  var constraints = Object.assign({ }, universalConstraints, allTypeConstraints[typeName]);

  return joi.object().keys(constraints)
    // Prevent the use of more than one constraint from the "required value" category
    .without('required', [ 'mustNotBeMissing', 'mustNotBeNull' ])
    .without('mustNotBeMissing', [ 'required', 'mustNotBeNull' ])
    .without('mustNotBeNull', [ 'required', 'mustNotBeMissing' ])

    // Prevent the use of more than one constraint from the "equality" category
    .without('mustEqual', [ 'mustEqualStrict' ])

    // Prevent the use of more than one constraint from the "minimum value" category
    .without('minimumValue', [ 'minimumValueExclusive', 'mustEqual', 'mustEqualStrict' ])
    .without('minimumValueExclusive', [ 'minimumValue', 'mustEqual', 'mustEqualStrict' ])

    // Prevent the use of more than one constraint from the "maximum value" category
    .without('maximumValue', [ 'maximumValueExclusive', 'mustEqualStrict', 'mustEqual' ])
    .without('maximumValueExclusive', [ 'maximumValue', 'mustEqualStrict', 'mustEqual' ])

    // Prevent the use of more than one constraint from the "immutability" category
    .without('immutable', [ 'immutableStrict', 'immutableWhenSet', 'immutableWhenSetStrict' ])
    .without('immutableStrict', [ 'immutable', 'immutableWhenSet', 'immutableWhenSetStrict' ])
    .without('immutableWhenSet', [ 'immutable', 'immutableStrict', 'immutableWhenSetStrict' ])
    .without('immutableWhenSetStrict', [ 'immutable', 'immutableStrict', 'immutableWhenSet' ]);
}

// Generates a schema that can be used for property validator constraints
function constraintSchema(wrappedSchema) {
  // The function schema this creates will support no more than four parameters (doc, oldDoc, value, oldValue)
  return makeConstraintSchemaDynamic(wrappedSchema, 4);
}

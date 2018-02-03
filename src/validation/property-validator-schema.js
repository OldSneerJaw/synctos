var joi = require('joi');
var makeConstraintSchemaDynamic = require('./dynamic-constraint-schema-maker');

var integerSchema = joi.number().integer();
var datetimeSchema = joi.date().options({ convert: true });
var dateOnlySchema = joi.any().when(
  joi.string(),
  {
    then: joi.string().regex(/^(([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))$/),
    otherwise: joi.date().options({ convert: false })
  });
var uuidSchema = joi.string().uuid();

var typeComparisonSchemas = {
  string: joi.string(),
  integer: integerSchema,
  float: joi.number(),
  boolean: joi.boolean(),
  datetime: datetimeSchema,
  date: dateOnlySchema,
  enum: joi.any().when(
    joi.string(),
    {
      then: joi.string(),
      otherwise: integerSchema
    }
  ),
  uuid: uuidSchema,
  attachmentReference: joi.string(),
  array: joi.array(),
  object: joi.object().unknown(),
  hashtable: joi.object().unknown()
};

var validPropertyTypes = Object.keys(typeComparisonSchemas).map(function(key) { return key; });

var schema = joi.object().keys({
  type: constraintSchema(joi.string().only(validPropertyTypes)).required()
})
  .when(
    joi.object().unknown().keys({ type: 'string' }),
    { then: makeTypeConstraintsSchema('string') })
  .when(
    joi.object().unknown().keys({ type: 'integer' }),
    { then: makeTypeConstraintsSchema('integer') })
  .when(
    joi.object().unknown().keys({ type: 'float' }),
    { then: makeTypeConstraintsSchema('float') })
  .when(
    joi.object().unknown().keys({ type: 'boolean' }),
    { then: makeTypeConstraintsSchema('boolean') })
  .when(
    joi.object().unknown().keys({ type: 'datetime' }),
    { then: makeTypeConstraintsSchema('datetime') })
  .when(
    joi.object().unknown().keys({ type: 'date' }),
    { then: makeTypeConstraintsSchema('date') })
  .when(
    joi.object().unknown().keys({ type: 'enum' }),
    { then: makeTypeConstraintsSchema('enum') })
  .when(
    joi.object().unknown().keys({ type: 'uuid' }),
    { then: makeTypeConstraintsSchema('uuid') })
  .when(
    joi.object().unknown().keys({ type: 'attachmentReference' }),
    { then: makeTypeConstraintsSchema('attachmentReference') })
  .when(
    joi.object().unknown().keys({ type: 'array' }),
    { then: makeTypeConstraintsSchema('array') })
  .when(
    joi.object().unknown().keys({ type: 'object' }),
    { then: makeTypeConstraintsSchema('object') })
  .when(
    joi.object().unknown().keys({ type: 'hashtable' }),
    { then: makeTypeConstraintsSchema('hashtable') })
  .when(
    joi.object().unknown().keys({ type: joi.func() }),
    { then: joi.object().unknown() });

/**
 * A partial schema for a single entry in a "propertyValidators" object at either the top level of a document definition
 * or nested within an "object" validator.
 */
module.exports = exports = schema;

// Defined as a function rather than a plain object because it contains lazy references that result in recursive
// references between the complex types (e.g. "array", "object", "hashtable") and the main "propertyValidators" schema
function typeSpecificConstraints() {
  return {
    string: {
      mustNotBeEmpty: constraintSchema(joi.boolean()),
      regexPattern: constraintSchema(joi.object().type(RegExp)),
      minimumLength: constraintSchema(integerSchema.min(0)),
      maximumLength: maximumSizeConstraint('minimumLength'),
      minimumValue: constraintSchema(joi.string()),
      minimumValueExclusive: constraintSchema(joi.string()),
      maximumValue: constraintSchema(joi.string()),
      maximumValueExclusive: constraintSchema(joi.string())
    },
    integer: {
      minimumValue: constraintSchema(integerSchema),
      minimumValueExclusive: constraintSchema(integerSchema),
      maximumValue: maximumValueInclusiveNumberConstraint(integerSchema),
      maximumValueExclusive: maximumValueExclusiveNumberConstraint(integerSchema)
    },
    float: {
      minimumValue: constraintSchema(joi.number()),
      minimumValueExclusive: constraintSchema(joi.number()),
      maximumValue: maximumValueInclusiveNumberConstraint(joi.number()),
      maximumValueExclusive: maximumValueExclusiveNumberConstraint(joi.number())
    },
    boolean: { },
    datetime: {
      minimumValue: constraintSchema(datetimeSchema),
      minimumValueExclusive: constraintSchema(datetimeSchema),
      maximumValue: constraintSchema(datetimeSchema),
      maximumValueExclusive: constraintSchema(datetimeSchema)
    },
    date: {
      minimumValue: constraintSchema(dateOnlySchema),
      minimumValueExclusive: constraintSchema(dateOnlySchema),
      maximumValue: constraintSchema(dateOnlySchema),
      maximumValueExclusive: constraintSchema(dateOnlySchema)
    },
    enum: {
      predefinedValues: constraintSchema(joi.array().required().min(1).items([ integerSchema, joi.string() ]))
    },
    uuid: {
      minimumValue: constraintSchema(uuidSchema),
      minimumValueExclusive: constraintSchema(uuidSchema),
      maximumValue: constraintSchema(uuidSchema),
      maximumValueExclusive: constraintSchema(uuidSchema)
    },
    attachmentReference: {
      maximumSize: constraintSchema(integerSchema.min(1).max(20971520)),
      supportedExtensions: constraintSchema(joi.array().min(1).items(joi.string())),
      supportedContentTypes: constraintSchema(joi.array().min(1).items(joi.string().min(1)))
    },
    array: {
      mustNotBeEmpty: constraintSchema(joi.boolean()),
      minimumLength: constraintSchema(integerSchema.min(0)),
      maximumLength: maximumSizeConstraint('minimumLength'),
      arrayElementsValidator: constraintSchema(joi.lazy(function() { return schema; }))
    },
    object: {
      allowUnknownProperties: constraintSchema(joi.boolean()),
      propertyValidators: constraintSchema(joi.object().min(1).pattern(/^.+$/, joi.lazy(function() { return schema; })))
    },
    hashtable: {
      minimumSize: constraintSchema(integerSchema.min(0)),
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
function makeTypeConstraintsSchema(typeName) {
  var allTypeConstraints = typeSpecificConstraints();
  var constraints = Object.assign({ }, universalConstraints(typeComparisonSchemas[typeName]), allTypeConstraints[typeName]);

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

function mustEqualConstraint(comparisonSchema) {
  return joi.any().when(joi.any().only(null), { otherwise: comparisonSchema });
}

function universalConstraints(comparisonSchema) {
  return {
    type: constraintSchema(joi.string()).required(),
    required: constraintSchema(joi.boolean()),
    mustNotBeMissing: constraintSchema(joi.boolean()),
    mustNotBeNull: constraintSchema(joi.boolean()),
    immutable: constraintSchema(joi.boolean()),
    immutableStrict: constraintSchema(joi.boolean()),
    immutableWhenSet: constraintSchema(joi.boolean()),
    immutableWhenSetStrict: constraintSchema(joi.boolean()),
    mustEqual: constraintSchema(mustEqualConstraint(comparisonSchema)),
    mustEqualStrict: constraintSchema(mustEqualConstraint(comparisonSchema)),
    customValidation: joi.func().maxArity(4) // Function parameters: doc, oldDoc, currentItemElement, validationItemStack
  };
}

function maximumSizeConstraint(minimumSizePropertyName) {
  return joi.any().when(
    minimumSizePropertyName,
    {
      is: joi.number().exist(),
      then: constraintSchema(integerSchema.min(joi.ref(minimumSizePropertyName))),
      otherwise: constraintSchema(integerSchema.min(0))
    });
}

function maximumValueInclusiveNumberConstraint(numberType) {
  return joi.any().when(
    'minimumValue',
    {
      is: joi.number().exist(),
      then: constraintSchema(numberType.min(joi.ref('minimumValue'))),
      otherwise: joi.any().when(
        'minimumValueExclusive',
        {
          is: joi.number().exist(),
          then: constraintSchema(numberType.greater(joi.ref('minimumValueExclusive'))),
          otherwise: constraintSchema(numberType)
        })
    });
}

function maximumValueExclusiveNumberConstraint(numberType) {
  return joi.any().when(
    'minimumValue',
    {
      is: joi.number().exist(),
      then: constraintSchema(numberType.greater(joi.ref('minimumValue'))),
      otherwise: joi.any().when(
        'minimumValueExclusive',
        {
          is: joi.number().exist(),
          then: constraintSchema(numberType.greater(joi.ref('minimumValueExclusive'))),
          otherwise: constraintSchema(numberType)
        })
    });
}

// Generates a schema that can be used for property validator constraints
function constraintSchema(wrappedSchema) {
  // The function schema this creates will support no more than four parameters (doc, oldDoc, value, oldValue)
  return makeConstraintSchemaDynamic(wrappedSchema, 4);
}

const joi = require('../../lib/joi/joi.bundle');
const makeConstraintSchemaDynamic = require('./dynamic-constraint-schema-maker');

const integerSchema = joi.number().integer();
const uuidSchema = joi.string().uuid();
const regexSchema = joi.object().type(RegExp);

// NOTE: When Joi runs, it does so in a Node.js process, which may support a different subset of the ISO 8601 date-time
// string format than Sync Gateway's JavaScript interpreter does. To prevent the validator from allowing date or
// date-time strings that cannot be parsed when a generated sync function is used in Sync Gateway, strings with explicit
// regular expression definitions are used for the "date" and "datetime" types rather than `joi.date().iso()`.
const datetimeStringSchema = joi.string()
  .regex(/^([+-]\d{6}|\d{4})(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?(T((([01]\d|2[0-3])(:[0-5]\d)(:[0-5]\d(\.\d{1,3})?)?)|(24:00(:00(\.0{1,3})?)?))(Z|([+-])([01]\d|2[0-3]):([0-5]\d))?)?$/);
const datetimeSchema = joi.any().when(
  joi.string(),
  {
    then: datetimeStringSchema,
    otherwise: joi.date().options({ convert: false })
  });

const dateOnlyStringSchema = joi.string().regex(/^([+-]\d{6}|\d{4})(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/);
const dateOnlySchema = joi.any().when(
  joi.string(),
  {
    then: dateOnlyStringSchema,
    otherwise: joi.date().options({ convert: false })
  });

const timeOnlySchema = joi.string().regex(/^((([01]\d|2[0-3])(:[0-5]\d)(:[0-5]\d(\.\d{1,3})?)?)|(24:00(:00(\.0{1,3})?)?))$/);
const timezoneSchema = joi.string().regex(/^(Z|([+-])([01]\d|2[0-3]):([0-5]\d))$/);

const typeEqualitySchemas = {
  any: joi.any(),
  string: joi.string(),
  integer: integerSchema,
  float: joi.number(),
  boolean: joi.boolean(),
  datetime: datetimeStringSchema,
  date: dateOnlyStringSchema,
  time: timeOnlySchema,
  timezone: timezoneSchema,
  enum: joi.alternatives().try([ joi.string(), integerSchema ]),
  uuid: uuidSchema,
  attachmentReference: joi.string(),
  array: joi.array(),
  object: joi.object().unknown(),
  hashtable: joi.object().unknown(),
  conditional: joi.any()
};

const validPropertyTypes = Object.keys(typeEqualitySchemas).sort();

const schema = joi.object().keys({
  type: dynamicConstraintSchema(joi.string().only(validPropertyTypes)).required()
})
  .when(
    joi.object().unknown().keys({ type: 'any' }),
    { then: makeTypeConstraintsSchema('any') })
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
    joi.object().unknown().keys({ type: 'time' }),
    { then: makeTypeConstraintsSchema('time') })
  .when(
    joi.object().unknown().keys({ type: 'timezone' }),
    { then: makeTypeConstraintsSchema('timezone') })
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
    joi.object().unknown().keys({ type: 'conditional' }),
    { then: makeTypeConstraintsSchema('conditional') })
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
function typeSpecificConstraintSchemas() {
  return {
    any: { },
    string: {
      mustNotBeEmpty: dynamicConstraintSchema(joi.boolean()),
      mustBeTrimmed: dynamicConstraintSchema(joi.boolean()),
      regexPattern: dynamicConstraintSchema(regexSchema),
      minimumLength: dynamicConstraintSchema(integerSchema.min(0)),
      maximumLength: maximumSizeConstraintSchema('minimumLength'),
      minimumValue: dynamicConstraintSchema(joi.string()),
      minimumValueExclusive: dynamicConstraintSchema(joi.string()),
      maximumValue: dynamicConstraintSchema(joi.string()),
      maximumValueExclusive: dynamicConstraintSchema(joi.string()),
      mustEqualIgnoreCase: dynamicConstraintSchema(joi.string())
    },
    integer: {
      minimumValue: dynamicConstraintSchema(integerSchema),
      minimumValueExclusive: dynamicConstraintSchema(integerSchema),
      maximumValue: maximumValueInclusiveNumberConstraintSchema(integerSchema),
      maximumValueExclusive: maximumValueExclusiveNumberConstraintSchema(integerSchema)
    },
    float: {
      minimumValue: dynamicConstraintSchema(joi.number()),
      minimumValueExclusive: dynamicConstraintSchema(joi.number()),
      maximumValue: maximumValueInclusiveNumberConstraintSchema(joi.number()),
      maximumValueExclusive: maximumValueExclusiveNumberConstraintSchema(joi.number())
    },
    boolean: { },
    datetime: {
      minimumValue: dynamicConstraintSchema(datetimeSchema),
      minimumValueExclusive: dynamicConstraintSchema(datetimeSchema),
      maximumValue: dynamicConstraintSchema(datetimeSchema),
      maximumValueExclusive: dynamicConstraintSchema(datetimeSchema)
    },
    date: {
      minimumValue: dynamicConstraintSchema(dateOnlySchema),
      minimumValueExclusive: dynamicConstraintSchema(dateOnlySchema),
      maximumValue: dynamicConstraintSchema(dateOnlySchema),
      maximumValueExclusive: dynamicConstraintSchema(dateOnlySchema)
    },
    time: {
      minimumValue: dynamicConstraintSchema(timeOnlySchema),
      minimumValueExclusive: dynamicConstraintSchema(timeOnlySchema),
      maximumValue: dynamicConstraintSchema(timeOnlySchema),
      maximumValueExclusive: dynamicConstraintSchema(timeOnlySchema)
    },
    timezone: {
      minimumValue: dynamicConstraintSchema(timezoneSchema),
      minimumValueExclusive: dynamicConstraintSchema(timezoneSchema),
      maximumValue: dynamicConstraintSchema(timezoneSchema),
      maximumValueExclusive: dynamicConstraintSchema(timezoneSchema)
    },
    enum: {
      predefinedValues: dynamicConstraintSchema(joi.array().required().min(1).items([ integerSchema, joi.string() ]))
    },
    uuid: {
      minimumValue: dynamicConstraintSchema(uuidSchema),
      minimumValueExclusive: dynamicConstraintSchema(uuidSchema),
      maximumValue: dynamicConstraintSchema(uuidSchema),
      maximumValueExclusive: dynamicConstraintSchema(uuidSchema)
    },
    attachmentReference: {
      maximumSize: dynamicConstraintSchema(integerSchema.min(1).max(20971520)),
      supportedExtensions: dynamicConstraintSchema(joi.array().min(1).items(joi.string())),
      supportedContentTypes: dynamicConstraintSchema(joi.array().min(1).items(joi.string().min(1))),
      regexPattern: dynamicConstraintSchema(regexSchema)
    },
    array: {
      mustNotBeEmpty: dynamicConstraintSchema(joi.boolean()),
      minimumLength: dynamicConstraintSchema(integerSchema.min(0)),
      maximumLength: maximumSizeConstraintSchema('minimumLength'),
      arrayElementsValidator: dynamicConstraintSchema(joi.lazy(() => schema))
    },
    object: {
      allowUnknownProperties: dynamicConstraintSchema(joi.boolean()),
      propertyValidators: dynamicConstraintSchema(joi.object().min(1).pattern(/^.+$/, joi.lazy(() => schema)))
    },
    hashtable: {
      minimumSize: dynamicConstraintSchema(integerSchema.min(0)),
      maximumSize: maximumSizeConstraintSchema('minimumSize'),
      hashtableKeysValidator: dynamicConstraintSchema(joi.object().keys({
        mustNotBeEmpty: dynamicConstraintSchema(joi.boolean()),
        regexPattern: dynamicConstraintSchema(regexSchema)
      })),
      hashtableValuesValidator: dynamicConstraintSchema(joi.lazy(() => schema))
    },
    conditional: {
      validationCandidates: dynamicConstraintSchema(conditionalValidationCandidatesSchema()).required()
    }
  };
}

// Creates a validation schema for the constraints of the specified type
function makeTypeConstraintsSchema(typeName) {
  const allTypeConstraints = typeSpecificConstraintSchemas();
  const constraints = Object.assign({ }, universalConstraintSchemas(typeEqualitySchemas[typeName]), allTypeConstraints[typeName]);

  return joi.object().keys(constraints)
    // Prevent the use of more than one constraint from the "required value" category
    .without('required', [ 'mustNotBeMissing', 'mustNotBeNull' ])
    .without('mustNotBeMissing', [ 'required', 'mustNotBeNull' ])
    .without('mustNotBeNull', [ 'required', 'mustNotBeMissing' ])

    // Prevent the use of more than one constraint from the "equality" category
    .without('mustEqual', [ 'mustEqualStrict', 'mustEqualIgnoreCase' ])
    .without('mustEqualStrict', [ 'mustEqual', 'mustEqualIgnoreCase' ])
    .without('mustEqualIgnoreCase', [ 'mustEqual', 'mustEqualStrict' ])

    // Prevent the use of more than one constraint from the "minimum value" category
    .without('minimumValue', [ 'minimumValueExclusive', 'mustEqual', 'mustEqualStrict', 'mustEqualIgnoreCase' ])
    .without('minimumValueExclusive', [ 'minimumValue', 'mustEqual', 'mustEqualStrict', 'mustEqualIgnoreCase' ])

    // Prevent the use of more than one constraint from the "maximum value" category
    .without('maximumValue', [ 'maximumValueExclusive', 'mustEqualStrict', 'mustEqual', 'mustEqualIgnoreCase' ])
    .without('maximumValueExclusive', [ 'maximumValue', 'mustEqualStrict', 'mustEqual', 'mustEqualIgnoreCase' ])

    // Prevent the use of more than one constraint from the "immutability" category
    .without('immutable', [ 'immutableStrict', 'immutableWhenSet', 'immutableWhenSetStrict' ])
    .without('immutableStrict', [ 'immutable', 'immutableWhenSet', 'immutableWhenSetStrict' ])
    .without('immutableWhenSet', [ 'immutable', 'immutableStrict', 'immutableWhenSetStrict' ])
    .without('immutableWhenSetStrict', [ 'immutable', 'immutableStrict', 'immutableWhenSet' ])

    // Prevent the use of more than one constraint from the "skip validation" category
    .without('skipValidationWhenValueUnchanged', [ 'skipValidationWhenValueUnchangedStrict' ]);
}

function mustEqualConstraintSchema(comparisonSchema) {
  return joi.any().when(joi.any().only(null), { otherwise: comparisonSchema });
}

function universalConstraintSchemas(typeEqualitySchema) {
  return {
    type: dynamicConstraintSchema(joi.string()).required(),
    required: dynamicConstraintSchema(joi.boolean()),
    mustNotBeMissing: dynamicConstraintSchema(joi.boolean()),
    mustNotBeNull: dynamicConstraintSchema(joi.boolean()),
    immutable: dynamicConstraintSchema(joi.boolean()),
    immutableStrict: dynamicConstraintSchema(joi.boolean()),
    immutableWhenSet: dynamicConstraintSchema(joi.boolean()),
    immutableWhenSetStrict: dynamicConstraintSchema(joi.boolean()),
    mustEqual: dynamicConstraintSchema(mustEqualConstraintSchema(typeEqualitySchema)),
    mustEqualStrict: dynamicConstraintSchema(mustEqualConstraintSchema(typeEqualitySchema)),
    skipValidationWhenValueUnchanged: dynamicConstraintSchema(joi.boolean()),
    skipValidationWhenValueUnchangedStrict: dynamicConstraintSchema(joi.boolean()),
    customValidation: joi.func().maxArity(4) // Function parameters: doc, oldDoc, currentItemEntry, validationItemStack
  };
}

function maximumSizeConstraintSchema(minimumSizePropertyName) {
  return joi.any().when(
    minimumSizePropertyName,
    {
      is: joi.number().exist(),
      then: dynamicConstraintSchema(integerSchema.min(joi.ref(minimumSizePropertyName))),
      otherwise: dynamicConstraintSchema(integerSchema.min(0))
    });
}

function maximumValueInclusiveNumberConstraintSchema(numberType) {
  return joi.any().when(
    'minimumValue',
    {
      is: joi.number().exist(),
      then: dynamicConstraintSchema(numberType.min(joi.ref('minimumValue'))),
      otherwise: joi.any().when(
        'minimumValueExclusive',
        {
          is: joi.number().exist(),
          then: dynamicConstraintSchema(numberType.greater(joi.ref('minimumValueExclusive'))),
          otherwise: dynamicConstraintSchema(numberType)
        })
    });
}

function maximumValueExclusiveNumberConstraintSchema(numberType) {
  return joi.any().when(
    'minimumValue',
    {
      is: joi.number().exist(),
      then: dynamicConstraintSchema(numberType.greater(joi.ref('minimumValue'))),
      otherwise: joi.any().when(
        'minimumValueExclusive',
        {
          is: joi.number().exist(),
          then: dynamicConstraintSchema(numberType.greater(joi.ref('minimumValueExclusive'))),
          otherwise: dynamicConstraintSchema(numberType)
        })
    });
}

function conditionalValidationCandidatesSchema() {
  return joi.array().min(1).items([
    joi.object().keys({
      condition: joi.func().maxArity(4).required(),
      validator: joi.lazy(() => schema).required()
    })
  ]);
}

// Generates a schema that can be used for property validator constraints
function dynamicConstraintSchema(wrappedSchema) {
  // The function schema this creates will support no more than four parameters (doc, oldDoc, value, oldValue)
  return makeConstraintSchemaDynamic(wrappedSchema, 4);
}

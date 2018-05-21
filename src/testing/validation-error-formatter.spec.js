const { expect } = require('chai');
const errorFormatter = require('./validation-error-formatter');

describe('Validation error formatter', () => {
  describe('at the document level', () => {
    it('produces allowAttachments violation messages', () => {
      expect(errorFormatter.allowAttachmentsViolation()).to.equal('document type does not support attachments');
    });

    it('produces attachmentFilenameRegexPatternViolation messages', () => {
      const attachmentName = 'my-attachment-name';
      const regexPattern = /^my-regex-pattern$/;
      expect(errorFormatter.attachmentFilenameRegexPatternViolation(attachmentName, regexPattern))
        .to.equal(`attachment "${attachmentName}" must conform to expected pattern ${regexPattern}`);
    });

    it('produces cannotDelete violation messages', () => {
      expect(errorFormatter.cannotDeleteDocViolation()).to.equal('documents of this type cannot be deleted');
    });

    it('produces cannotReplace violation messages', () => {
      expect(errorFormatter.cannotReplaceDocViolation()).to.equal('documents of this type cannot be replaced');
    });

    it('produces documentIdRegexPattern violation messages', () => {
      const expectedRegex = /\d+/;
      expect(errorFormatter.documentIdRegexPatternViolation(expectedRegex))
        .to.equal(`document ID must conform to expected pattern ${expectedRegex}`);
    });

    it('produces immutable violation messages', () => {
      expect(errorFormatter.immutableDocViolation()).to.equal('documents of this type cannot be replaced or deleted');
    });

    it('produces maximumAttachmentCount violation messages', () => {
      const maximumAttachmentCount = 2;
      expect(errorFormatter.maximumAttachmentCountViolation(maximumAttachmentCount))
        .to.equal(`documents of this type must not have more than ${maximumAttachmentCount} attachments`);
    });

    it('produces attachments maximumIndividualSize violation messages', () => {
      const fileName = 'my-attachment-file.jpg';
      const maximumAttachmentSize = 2;
      expect(errorFormatter.maximumIndividualAttachmentSizeViolation(fileName, maximumAttachmentSize))
        .to.equal(`attachment ${fileName} must not exceed ${maximumAttachmentSize} bytes`);
    });

    it('produces attachments maximumTotalSize violation messages', () => {
      const maximumSize = 2;
      expect(errorFormatter.maximumTotalAttachmentSizeViolation(maximumSize))
        .to.equal(`documents of this type must not have a combined attachment size greater than ${maximumSize} bytes`);
    });

    it('produces requireAttachmentReferences violation messages', () => {
      const fileName = 'my-attachment-file.txt';
      expect(errorFormatter.requireAttachmentReferencesViolation(fileName))
        .to.equal(`attachment ${fileName} must have a corresponding attachment reference property`);
    });

    it('produces attachments supportedContentTypes violation messages', () => {
      const fileName = 'my-attachment-file.svg';
      const contentTypes = [ 'image/png' ];
      expect(errorFormatter.supportedContentTypesRawAttachmentViolation(fileName, contentTypes))
        .to.equal(`attachment "${fileName}" must have a supported content type (${contentTypes})`);
    });

    it('produces attachments supportedExtensions violation messages', () => {
      const fileName = 'my-attachment-file.jpg';
      const extensions = [ 'png' ];
      expect(errorFormatter.supportedExtensionsRawAttachmentViolation(fileName, extensions))
        .to.equal(`attachment "${fileName}" must have a supported file extension (${extensions})`);
    });

    it('produces an unknown document type message', () => {
      expect(errorFormatter.unknownDocumentType()).to.equal('Unknown document type');
    });
  });

  describe('at the property/element level', () => {
    const fakeItemPath = 'my.fake[item]';

    it('produces invalid date format messages', () => {
      expect(errorFormatter.dateFormatInvalid(fakeItemPath))
        .to.equal(`item "${fakeItemPath}" must be an ECMAScript simplified ISO 8601 date string with no time or time zone components`);
    });

    it('produces invalid date/time format messages', () => {
      expect(errorFormatter.datetimeFormatInvalid(fakeItemPath))
        .to.equal(`item "${fakeItemPath}" must be an ECMAScript simplified ISO 8601 date string with optional time and time zone components`);
    });

    it('produces invalid time format messages', () => {
      expect(errorFormatter.timeFormatInvalid(fakeItemPath))
        .to.equal(`item "${fakeItemPath}" must be an ECMAScript simplified ISO 8601 time string with no date or time zone components`);
    });

    it('produces invalid time zone format messages', () => {
      expect(errorFormatter.timezoneFormatInvalid(fakeItemPath))
        .to.equal(`item "${fakeItemPath}" must be an ECMAScript simplified ISO 8601 time zone string`);
    });

    it('produces invalid enum value messages', () => {
      const fakeEnumValues = [ 'foo', 'bar', -5 ];
      expect(errorFormatter.enumPredefinedValueViolation(fakeItemPath, fakeEnumValues))
        .to.equal(`item "${fakeItemPath}" must be one of the predefined values: ${fakeEnumValues}`);
    });

    it('produces empty hashtable key violation messages', () => {
      expect(errorFormatter.hashtableKeyEmpty(fakeItemPath))
        .to.equal(`hashtable "${fakeItemPath}" must not have an empty key`);
    });

    it('produces hashtable maximumSize violation messages', () => {
      const maximumSize = 8;
      expect(errorFormatter.hashtableMaximumSizeViolation(fakeItemPath, maximumSize))
        .to.equal(`hashtable "${fakeItemPath}" must not be larger than ${maximumSize} elements`);
    });

    it('produces hashtable minimumSize violation messages', () => {
      const minimumSize = 1;
      expect(errorFormatter.hashtableMinimumSizeViolation(fakeItemPath, minimumSize))
        .to.equal(`hashtable "${fakeItemPath}" must not be smaller than ${minimumSize} elements`);
    });

    it('produces immutable value violation messages', () => {
      expect(errorFormatter.immutableItemViolation(fakeItemPath)).to.equal(`item "${fakeItemPath}" cannot be modified`);
    });

    it('produces maximumLength violation messages', () => {
      const maximumLength = 1;
      expect(errorFormatter.maximumLengthViolation(fakeItemPath, maximumLength))
        .to.equal(`length of item "${fakeItemPath}" must not be greater than ${maximumLength}`);
    });

    it('produces attachment reference maximumSize violation messages', () => {
      const maximumSize = 1;
      expect(errorFormatter.maximumSizeAttachmentViolation(fakeItemPath, maximumSize))
        .to.equal(`attachment reference "${fakeItemPath}" must not be larger than ${maximumSize} bytes`);
    });

    it('produces maximumValue violation messages', () => {
      const maximumValue = 1;
      expect(errorFormatter.maximumValueViolation(fakeItemPath, maximumValue))
        .to.equal(`item "${fakeItemPath}" must not be greater than ${maximumValue}`);
    });

    it('produces maximumValueExclusive violation messages', () => {
      const maximumValue = 1;
      expect(errorFormatter.maximumValueExclusiveViolation(fakeItemPath, maximumValue))
        .to.equal(`item "${fakeItemPath}" must not be greater than or equal to ${maximumValue}`);
    });

    it('produces minimumLength violation messages', () => {
      const minimumLength = 1;
      expect(errorFormatter.minimumLengthViolation(fakeItemPath, minimumLength))
        .to.equal(`length of item "${fakeItemPath}" must not be less than ${minimumLength}`);
    });

    it('produces minimumValue violation messages', () => {
      const minimumValue = 1;
      expect(errorFormatter.minimumValueViolation(fakeItemPath, minimumValue))
        .to.equal(`item "${fakeItemPath}" must not be less than ${minimumValue}`);
    });

    it('produces minimumValueExclusive violation messages', () => {
      const minimumValue = 1;
      expect(errorFormatter.minimumValueExclusiveViolation(fakeItemPath, minimumValue))
        .to.equal(`item "${fakeItemPath}" must not be less than or equal to ${minimumValue}`);
    });

    it('produces mustBeTrimmed violation messages', () => {
      expect(errorFormatter.mustBeTrimmedViolation(fakeItemPath))
        .to.equal(`item "${fakeItemPath}" must not have any leading or trailing whitespace`);
    });

    it('produces mustEqual violation messages', () => {
      const value = { foo: [ 'bar' ] };
      expect(errorFormatter.mustEqualViolation(fakeItemPath, value))
        .to.equal(`value of item "${fakeItemPath}" must equal ${JSON.stringify(value)}`);
    });

    it('produces mustEqualIgnoreCase violation messages', () => {
      const value = 'FOO';
      expect(errorFormatter.mustEqualIgnoreCaseViolation(fakeItemPath, value))
        .to.equal(`value of item "${fakeItemPath}" must equal (case insensitive) "${value}"`);
    });

    it('produces mustNotBeEmpty violation messages', () => {
      expect(errorFormatter.mustNotBeEmptyViolation(fakeItemPath)).to.equal(`item "${fakeItemPath}" must not be empty`);
    });

    it('produces mustNotBeMissing violation messages', () => {
      expect(errorFormatter.mustNotBeMissingValueViolation(fakeItemPath)).to.equal(`item "${fakeItemPath}" must not be missing`);
    });

    it('produces mustNotBeNull violation messages', () => {
      expect(errorFormatter.mustNotBeNullValueViolation(fakeItemPath)).to.equal(`item "${fakeItemPath}" must not be null`);
    });

    it('produces hashtable key regexPattern violation messages', () => {
      const regex = /^foo-bar$/;
      expect(errorFormatter.regexPatternHashtableKeyViolation(fakeItemPath, regex))
        .to.equal(`hashtable key "${fakeItemPath}" must conform to expected format ${regex}`);
    });

    it('produces regexPattern violation messages', () => {
      const regex = /^bar-baz$/;
      expect(errorFormatter.regexPatternItemViolation(fakeItemPath, regex))
        .to.equal(`item "${fakeItemPath}" must conform to expected format ${regex}`);
    });

    it('produces required value violation messages', () => {
      expect(errorFormatter.requiredValueViolation(fakeItemPath)).to.equal(`item "${fakeItemPath}" must not be null or missing`);
    });

    it('produces attachment reference supportedContentTypes violation messages', () => {
      const contentTypes = [ 'text/html', 'image/jpeg' ];
      expect(errorFormatter.supportedContentTypesAttachmentReferenceViolation(fakeItemPath, contentTypes))
        .to.equal(`attachment reference "${fakeItemPath}" must have a supported content type (${contentTypes.join(',')})`);
    });

    it('produces attachment reference supportedExtensions violation messages', () => {
      const extensions = [ 'htm', 'jpg' ];
      expect(errorFormatter.supportedExtensionsAttachmentReferenceViolation(fakeItemPath, extensions))
        .to.equal(`attachment reference "${fakeItemPath}" must have a supported file extension (${extensions.join(',')})`);
    });

    it('produces an unsupported property message', () => {
      expect(errorFormatter.unsupportedProperty(fakeItemPath)).to.equal(`property "${fakeItemPath}" is not supported`);
    });

    it('produces invalid UUID format messages', () => {
      expect(errorFormatter.uuidFormatInvalid(fakeItemPath)).to.equal(`item "${fakeItemPath}" must be a UUID string`);
    });

    describe('type constraint violations', () => {
      it('formats messages for general types', () => {
        const typeDescriptions = {
          'array': 'an array',
          'attachmentReference': 'an attachment reference string',
          'boolean': 'a boolean',
          'date': 'an ECMAScript simplified ISO 8601 date string with no time or time zone components',
          'datetime': 'an ECMAScript simplified ISO 8601 date string with optional time and time zone components',
          'enum': 'an integer or a string',
          'float': 'a floating point or integer number',
          'hashtable': 'an object/hashtable',
          'integer': 'an integer',
          'object': 'an object',
          'string': 'a string',
          'time': 'an ECMAScript simplified ISO 8601 time string with no date or time zone components',
          'timezone': 'an ECMAScript simplified ISO 8601 time zone string',
          'uuid': 'a UUID string'
        };

        Object.keys(typeDescriptions).forEach((typeName) => {
          expect(errorFormatter.typeConstraintViolation(fakeItemPath, typeName))
            .to.equal(`item "${fakeItemPath}" must be ${typeDescriptions[typeName]}`);
        });
      });

      it('throws an error if an unrecognized type is encountered', () => {
        const invalidType = 'foo-type';
        expect(() => {
          errorFormatter.typeConstraintViolation(fakeItemPath, invalidType);
        }).to.throw(`Unrecognized validation type: ${invalidType}`);
      });
    });
  });
});

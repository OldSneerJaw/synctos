var expect = require('chai').expect;
var errorFormatter = require('./validation-error-formatter');

describe('Validation error formatter', function() {
  describe('at the document level', function() {
    it('produces allowAttachments violation messages', function() {
      expect(errorFormatter.allowAttachmentsViolation()).to.equal('document type does not support attachments');
    });

    it('produces cannotDelete violation messages', function() {
      expect(errorFormatter.cannotDeleteDocViolation()).to.equal('documents of this type cannot be deleted');
    });

    it('produces cannotReplace violation messages', function() {
      expect(errorFormatter.cannotReplaceDocViolation()).to.equal('documents of this type cannot be replaced');
    });

    it('produces immutable violation messages', function() {
      expect(errorFormatter.immutableDocViolation()).to.equal('documents of this type cannot be replaced or deleted');
    });

    it('produces maximumAttachmentCount violation messages', function() {
      var maximumAttachmentCount = 2;
      expect(errorFormatter.maximumAttachmentCountViolation(maximumAttachmentCount))
        .to.equal('the total number of attachments must not exceed ' + maximumAttachmentCount);
    });

    it('produces attachments maximumIndividualSize violation messages', function() {
      var fileName = 'my-attachment-file.jpg';
      var maximumAttachmentSize = 2;
      expect(errorFormatter.maximumIndividualAttachmentSizeViolation(fileName, maximumAttachmentSize))
        .to.equal('attachment ' + fileName + ' must not exceed ' + maximumAttachmentSize + ' bytes');
    });

    it('produces attachments maximumTotalSize violation messages', function() {
      var maximumSize = 2;
      expect(errorFormatter.maximumTotalAttachmentSizeViolation(maximumSize))
        .to.equal('the total size of all attachments must not exceed ' + maximumSize + ' bytes');
    });

    it('produces requireAttachmentReferences violation messages', function() {
      var fileName = 'my-attachment-file.txt';
      expect(errorFormatter.requireAttachmentReferencesViolation(fileName))
        .to.equal('attachment ' + fileName + ' must have a corresponding attachment reference property');
    });

    it('produces attachments supportedContentTypes violation messages', function() {
      var fileName = 'my-attachment-file.svg';
      var contentTypes = [ 'image/png' ];
      expect(errorFormatter.supportedContentTypesRawAttachmentViolation(fileName, contentTypes))
        .to.equal('attachment "' + fileName + '" must have a supported content type (' + contentTypes + ')');
    });

    it('produces attachments supportedExtensions violation messages', function() {
      var fileName = 'my-attachment-file.jpg';
      var extensions = [ 'png' ];
      expect(errorFormatter.supportedExtensionsRawAttachmentViolation(fileName, extensions))
        .to.equal('attachment "' + fileName + '" must have a supported file extension (' + extensions + ')');
    });

    it('produces an unknown document type message', function() {
      expect(errorFormatter.unknownDocumentType()).to.equal('Unknown document type');
    });
  });

  describe('at the property/element level', function() {
    var fakeItemPath = 'my.fake[item]';

    it('produces invalid date format messages', function() {
      expect(errorFormatter.dateFormatInvalid(fakeItemPath))
        .to.equal('item "' + fakeItemPath + '" must be an ISO 8601 date string with no time or time zone components');
    });

    it('produces invalid date/time format messages', function() {
      expect(errorFormatter.datetimeFormatInvalid(fakeItemPath))
        .to.equal('item "' + fakeItemPath + '" must be an ISO 8601 date string with optional time and time zone components');
    });

    it('produces invalid enum value messages', function() {
      var fakeEnumValues = [ 'foo', 'bar', -5 ];
      expect(errorFormatter.enumPredefinedValueViolation(fakeItemPath, fakeEnumValues))
        .to.equal('item "' + fakeItemPath + '" must be one of the predefined values: ' + fakeEnumValues.join(','));
    });

    it('produces empty hashtable key violation messages', function() {
      expect(errorFormatter.hashtableKeyEmpty(fakeItemPath))
        .to.equal('empty hashtable key in item "' + fakeItemPath + '" is not allowed');
    });

    it('produces hashtable maximumSize violation messages', function() {
      var maximumSize = 8;
      expect(errorFormatter.hashtableMaximumSizeViolation(fakeItemPath, maximumSize))
        .to.equal('hashtable "' + fakeItemPath + '" must not be larger than ' + maximumSize + ' elements');
    });

    it('produces hashtable minimumSize violation messages', function() {
      var minimumSize = 1;
      expect(errorFormatter.hashtableMinimumSizeViolation(fakeItemPath, minimumSize))
        .to.equal('hashtable "' + fakeItemPath + '" must not be smaller than ' + minimumSize + ' elements');
    });

    it('produces immutable value violation messages', function() {
      expect(errorFormatter.immutableItemViolation(fakeItemPath)).to.equal('value of item "' + fakeItemPath + '" may not be modified');
    });

    it('produces maximumLength violation messages', function() {
      var maximumLength = 1;
      expect(errorFormatter.maximumLengthViolation(fakeItemPath, maximumLength))
        .to.equal('length of item "' + fakeItemPath + '" must not be greater than ' + maximumLength);
    });

    it('produces attachment reference maximumSize violation messages', function() {
      var maximumSize = 1;
      expect(errorFormatter.maximumSizeAttachmentViolation(fakeItemPath, maximumSize))
        .to.equal('attachment reference "' + fakeItemPath + '" must not be larger than ' + maximumSize + ' bytes');
    });

    it('produces maximumValue violation messages', function() {
      var maximumValue = 1;
      expect(errorFormatter.maximumValueViolation(fakeItemPath, maximumValue))
        .to.equal('item "' + fakeItemPath + '" must not be greater than ' + maximumValue);
    });

    it('produces maximumValueExclusive violation messages', function() {
      var maximumValue = 1;
      expect(errorFormatter.maximumValueExclusiveViolation(fakeItemPath, maximumValue))
        .to.equal('item "' + fakeItemPath + '" must not be greater than or equal to ' + maximumValue);
    });

    it('produces minimumLength violation messages', function() {
      var minimumLength = 1;
      expect(errorFormatter.minimumLengthViolation(fakeItemPath, minimumLength))
        .to.equal('length of item "' + fakeItemPath + '" must not be less than ' + minimumLength);
    });

    it('produces minimumValue violation messages', function() {
      var minimumValue = 1;
      expect(errorFormatter.minimumValueViolation(fakeItemPath, minimumValue))
        .to.equal('item "' + fakeItemPath + '" must not be less than ' + minimumValue);
    });

    it('produces minimumValueExclusive violation messages', function() {
      var minimumValue = 1;
      expect(errorFormatter.minimumValueExclusiveViolation(fakeItemPath, minimumValue))
        .to.equal('item "' + fakeItemPath + '" must not be less than or equal to ' + minimumValue);
    });

    it('produces mustBeTrimmed violation messages', function() {
      expect(errorFormatter.mustBeTrimmedViolation(fakeItemPath))
        .to.equal('item "' + fakeItemPath + '" must not have any leading or trailing whitespace');
    });

    it('produces mustEqual violation messages', function() {
      var value = { foo: [ 'bar' ] };
      expect(errorFormatter.mustEqualViolation(fakeItemPath, value))
        .to.equal('value of item "' + fakeItemPath + '" must equal ' + JSON.stringify(value));
    });

    it('produces mustNotBeEmpty violation messages', function() {
      expect(errorFormatter.mustNotBeEmptyViolation(fakeItemPath)).to.equal('item "' + fakeItemPath + '" must not be empty');
    });

    it('produces mustNotBeMissing violation messages', function() {
      expect(errorFormatter.mustNotBeMissingValueViolation(fakeItemPath)).to.equal('item "' + fakeItemPath + '" must not be missing');
    });

    it('produces mustNotBeNull violation messages', function() {
      expect(errorFormatter.mustNotBeNullValueViolation(fakeItemPath)).to.equal('item "' + fakeItemPath + '" must not be null');
    });

    it('produces hashtable key regexPattern violation messages', function() {
      var regex = /^foo-bar$/;
      expect(errorFormatter.regexPatternHashtableKeyViolation(fakeItemPath, regex))
        .to.equal('hashtable key "' + fakeItemPath + '" does not conform to expected format ' + regex);
    });

    it('produces regexPattern violation messages', function() {
      var regex = /^bar-baz$/;
      expect(errorFormatter.regexPatternItemViolation(fakeItemPath, regex))
        .to.equal('item "' + fakeItemPath + '" must conform to expected format ' + regex);
    });

    it('produces required value violation messages', function() {
      expect(errorFormatter.requiredValueViolation(fakeItemPath)).to.equal('required item "' + fakeItemPath + '" is missing');
    });

    it('produces attachment reference supportedContentTypes violation messages', function() {
      var contentTypes = [ 'text/html', 'image/jpeg' ];
      expect(errorFormatter.supportedContentTypesAttachmentReferenceViolation(fakeItemPath, contentTypes))
        .to.equal('attachment reference "' + fakeItemPath + '" must have a supported content type (' + contentTypes.join(',') + ')');
    });

    it('produces attachment reference supportedExtensions violation messages', function() {
      var extensions = [ 'htm', 'jpg' ];
      expect(errorFormatter.supportedExtensionsAttachmentReferenceViolation(fakeItemPath, extensions))
        .to.equal('attachment reference "' + fakeItemPath + '" must have a supported file extension (' + extensions.join(',') + ')');
    });

    it('produces an unsupported property message', function() {
      expect(errorFormatter.unsupportedProperty(fakeItemPath)).to.equal('property "' + fakeItemPath + '" is not supported');
    });

    it('produces invalid UUID format messages', function() {
      expect(errorFormatter.uuidFormatInvalid(fakeItemPath)).to.equal('item "' + fakeItemPath + '" is not a valid UUID');
    });

    describe('type constraint violations', function() {
      it('formats messages for general types', function() {
        var typeDescriptions = {
          'array': 'an array',
          'boolean': 'a boolean',
          'date': 'an ISO 8601 date string with no time or time zone components',
          'datetime': 'an ISO 8601 date string with optional time and time zone components',
          'enum': 'an integer or a string',
          'float': 'a floating point or integer number',
          'hashtable': 'an object/hashtable',
          'integer': 'an integer',
          'object': 'an object',
          'string': 'a string',
          'uuid': 'a string'
        };

        for (var typeName in typeDescriptions) {
          expect(errorFormatter.typeConstraintViolation(fakeItemPath, typeName))
            .to.equal('item "' + fakeItemPath + '" must be ' + typeDescriptions[typeName]);
        }
      });

      it('formats messages for attachment references', function() {
        // Attachment reference type violations have a custom format
        expect(errorFormatter.typeConstraintViolation(fakeItemPath, 'attachmentReference'))
          .to.equal('attachment reference "' + fakeItemPath + '" must be a string');
      });

      it('throws an error if an unrecognized type is encountered', function() {
        var invalidType = 'foo-type';
        expect(function() {
          errorFormatter.typeConstraintViolation(fakeItemPath, invalidType);
        }).to.throw('Unrecognized validation type: ' + invalidType);
      });
    });
  });
});

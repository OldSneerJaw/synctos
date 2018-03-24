# Change Log
This project adheres to [Semantic Versioning](http://semver.org/). All notable changes will be documented in this file.

## [Unreleased]
### Added
- [#278](https://github.com/Kashoo/synctos/issues/278): Extended year format in date strings

### Fixed
- [#276](https://github.com/Kashoo/synctos/issues/276): Date range validation is incorrect for dates between years 0 and 99

## [2.2.1] - 2018-03-21
### Fixed
- [#270](https://github.com/Kashoo/synctos/issues/270): JavaScript error on document write in Sync Gateway 1.x

## [2.2.0] - 2018-03-20
### Added
- [#35](https://github.com/Kashoo/synctos/issues/35): Option to output a generated sync function as a single-line JSON string
- [#252](https://github.com/Kashoo/synctos/issues/252): Isolate test fixtures
- [#257](https://github.com/Kashoo/synctos/issues/257): Regular expression pattern constraint for document ID
- [#259](https://github.com/Kashoo/synctos/issues/259): Ensure compatibility with Sync Gateway 2.x

### Deprecated
- `src/testing/test-helper.js` module

## [2.1.0] - 2018-03-08
### Added
- [#250](https://github.com/Kashoo/synctos/issues/250): Allow a document with an unknown type to be deleted via the admin API
- [#188](https://github.com/Kashoo/synctos/issues/188): Support dynamic definition of channel/role access assignments

### Fixed:
- [#243](https://github.com/Kashoo/synctos/issues/243): The test-helper module incorrectly represents an old document that does not exist as undefined

## [2.0.2] - 2018-03-02
### Security
- [#246](https://github.com/Kashoo/synctos/issues/246): Access assignments are not revoked when the corresponding document is deleted

## [2.0.1] - 2018-02-19
### Fixed
- [#98](https://github.com/Kashoo/synctos/issues/98): Final argument of custom validation constraint receives incorrect value

## [2.0.0] - 2018-02-16
### Added
- [#43](https://github.com/Kashoo/synctos/issues/43): Tool to validate structure and semantics of a document definitions file
- [#189](https://github.com/Kashoo/synctos/issues/189): Automatically create the output sync function file directory if it does not exist
- [#207](https://github.com/Kashoo/synctos/issues/207): Ignore all top-level document properties that start with an underscore
- [#204](https://github.com/Kashoo/synctos/issues/204): Constraint that requires string values to be trimmed
- [#215](https://github.com/Kashoo/synctos/issues/215): Allow document definition fragments to be nested
- [#197](https://github.com/Kashoo/synctos/issues/197): Make month and day components of date validation type optional
- [#180](https://github.com/Kashoo/synctos/issues/180): Data validation type for time of day
- [#202](https://github.com/Kashoo/synctos/issues/202): Time zone data validation type
- [#225](https://github.com/Kashoo/synctos/issues/225): Use intelligent equality comparisons for specialized string types
- [#227](https://github.com/Kashoo/synctos/issues/227): Use intelligent immutability comparisons for specialized string types

### Changed
- [#212](https://github.com/Kashoo/synctos/issues/212): Improve document validation error messages
- [#185](https://github.com/Kashoo/synctos/issues/185): Upgrade minimum supported Node.js version to latest Long Term Support release
- [#186](https://github.com/Kashoo/synctos/issues/186): Remove deprecated Node.js modules

### Fixed
- [#190](https://github.com/Kashoo/synctos/issues/190): JavaScript error when mustEqual constraint is violated
- [#196](https://github.com/Kashoo/synctos/issues/196): Date-time validation type supports invalid time components
- [#199](https://github.com/Kashoo/synctos/issues/199): Date and date-time validation types permit dates that are invalid
- [#203](https://github.com/Kashoo/synctos/issues/203): Date range validation fails for values far in the past or future

### Removed
- `etc/test-helper.js` module
- `etc/validation-error-message-formatter.js` module

## [1.10.0] - 2018-01-24
### Added
- [#146](https://github.com/Kashoo/synctos/issues/146): Underscore.js support
- [#110](https://github.com/Kashoo/synctos/issues/110): Item constraint that requires an exact value match
- [#108](https://github.com/Kashoo/synctos/issues/108): Finer grained control over whether null and missing values are accepted
- [#127](https://github.com/Kashoo/synctos/issues/127): Immutable constraints that treat null and missing values as different
- [#128](https://github.com/Kashoo/synctos/issues/128): Equality constraint that treats null and missing values as different
- [#176](https://github.com/Kashoo/synctos/issues/176): UUID data validation type

### Changed
- [#118](https://github.com/Kashoo/synctos/issues/118): Embed indent.js as a static dependency
- [#174](https://github.com/Kashoo/synctos/issues/174): Reorganize project source structure

### Deprecated
- `etc/test-helper.js` module
- `etc/validation-error-message-formatter.js` module

## [1.9.4] - 2018-01-04
### Changed
- [#157](https://github.com/Kashoo/synctos/issues/157): Swap in Chai as the assertion library used in specs throughout the project
- [#163](https://github.com/Kashoo/synctos/issues/163): Embed simple-mock as a static development dependency

### Fixed
- [#160](https://github.com/Kashoo/synctos/issues/160): Unable to import document if it was deleted via Couchbase SDK

### Security
- [#156](https://github.com/Kashoo/synctos/issues/156): Users with a replace role may erroneously gain the privilege of removing a document under certain conditions

## [1.9.3] - 2017-10-23
### Fixed
- [#152](https://github.com/Kashoo/synctos/issues/152): Cannot append a new object with immutable properties to an array

## [1.9.2] - 2017-10-02
### Security
- [#149](https://github.com/Kashoo/synctos/issues/149): Permissions for add operations sometimes applied to other operation types

## [1.9.1] - 2017-05-01
### Fixed
- [#116](https://github.com/Kashoo/synctos/issues/116): Syntax error when the Sync Gateway admin UI loads a generated sync function

## [1.9.0] - 2017-04-26
### Added
- [#94](https://github.com/Kashoo/synctos/issues/94): Support dynamic item validation constraints
- [#95](https://github.com/Kashoo/synctos/issues/95): Accept Date object for date/time constraint parameters
- [#97](https://github.com/Kashoo/synctos/issues/97): Support dynamic document constraints
- [#100](https://github.com/Kashoo/synctos/issues/100): Option to initialize test helper module with document definition file

### Fixed
- [#113](https://github.com/Kashoo/synctos/issues/113): Backticks in document definitions cause syntax errors

## [1.8.0] - 2017-03-21
### Added
- [#90](https://github.com/Kashoo/synctos/issues/90): Document-wide constraints on file attachments

### Changed
- [#80](https://github.com/Kashoo/synctos/issues/80): Decompose specifications file for sample document definitions
- [#88](https://github.com/Kashoo/synctos/issues/88): Move test-helper module documentation to the top of the file

## [1.7.0] - 2017-01-26
### Added
- [#73](https://github.com/Kashoo/synctos/issues/73): Include an implicit type property when a simple type filter is used
- [#78](https://github.com/Kashoo/synctos/issues/78): Enum property validation type
- [#79](https://github.com/Kashoo/synctos/issues/79): Support minimum/maximum size constraint on hashtable validation type
- [#75](https://github.com/Kashoo/synctos/issues/75): Decompose the sync function template

## [1.6.0] - 2017-01-18
### Added
- [#66](https://github.com/Kashoo/synctos/issues/66): Modular document definition files
- [#69](https://github.com/Kashoo/synctos/issues/69): Helper function to determine whether a document is missing or deleted
- [#72](https://github.com/Kashoo/synctos/issues/72): New property validation type for type identifier properties

## [1.5.0] - 2016-12-14
### Added
- [#25](https://github.com/Kashoo/synctos/issues/25): Support custom actions to be executed on a document type
- [#61](https://github.com/Kashoo/synctos/issues/61): Support dynamic assignment of roles to users

## [1.4.0] - 2016-11-30
### Added
- [#22](https://github.com/Kashoo/synctos/issues/22): Support document authorization by role
- [#23](https://github.com/Kashoo/synctos/issues/23): Support document authorization by specific users

## [1.3.1] - 2016-11-24
### Changed
- [#52](https://github.com/Kashoo/synctos/issues/52): Upgrade development dependencies

### Fixed
- [#54](https://github.com/Kashoo/synctos/issues/54): Access assignments should receive null when old document is deleted

## [1.3.0] - 2016-11-23
### Added
- [#28](https://github.com/Kashoo/synctos/issues/28): Parameter to allow unknown properties in a document or object
- [#49](https://github.com/Kashoo/synctos/issues/49): Explicitly declare JSHint rules
- [#24](https://github.com/Kashoo/synctos/issues/24): Support dynamic assignment of channels to roles and users

## [1.2.0] - 2016-07-21
### Added
- [#29](https://github.com/Kashoo/synctos/issues/29): Parameter to indicate that an item cannot be modified if it has a value
- [#30](https://github.com/Kashoo/synctos/issues/30): Parameter to prevent documents from being replaced
- [#31](https://github.com/Kashoo/synctos/issues/31): Parameter to prevent documents from being deleted
- [#32](https://github.com/Kashoo/synctos/issues/32): Range validation parameters that exclude the minimum/maximum values
- [#39](https://github.com/Kashoo/synctos/issues/39): Test helper convenience functions to build validation error messages

### Fixed
- [#42](https://github.com/Kashoo/synctos/issues/42): Arrays can be assigned to items that expect object or hashtable

## [1.1.0] - 2016-07-15
### Added
- [#26](https://github.com/Kashoo/synctos/issues/26): Provide default type filter function

### Fixed
- [#36](https://github.com/Kashoo/synctos/issues/36): Does not return a non-zero exit status when sync function generation fails

## [1.0.0] - 2016-07-12
First public release

[Unreleased]: https://github.com/Kashoo/synctos/compare/v2.2.1...HEAD
[2.2.1]: https://github.com/Kashoo/synctos/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/Kashoo/synctos/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/Kashoo/synctos/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/Kashoo/synctos/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/Kashoo/synctos/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/Kashoo/synctos/compare/v1.10.0...v2.0.0
[1.10.0]: https://github.com/Kashoo/synctos/compare/v1.9.4...v1.10.0
[1.9.4]: https://github.com/Kashoo/synctos/compare/v1.9.3...v1.9.4
[1.9.3]: https://github.com/Kashoo/synctos/compare/v1.9.2...v1.9.3
[1.9.2]: https://github.com/Kashoo/synctos/compare/v1.9.1...v1.9.2
[1.9.1]: https://github.com/Kashoo/synctos/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/Kashoo/synctos/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/Kashoo/synctos/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/Kashoo/synctos/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/Kashoo/synctos/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/Kashoo/synctos/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Kashoo/synctos/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/Kashoo/synctos/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/Kashoo/synctos/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Kashoo/synctos/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Kashoo/synctos/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Kashoo/synctos/compare/57a18bd...v1.0.0

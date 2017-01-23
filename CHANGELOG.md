# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- [#73](https://github.com/Kashoo/synctos/issues/73): Include an implicit type property when a simple type filter is used
- [#78](https://github.com/Kashoo/synctos/issues/78): Enum property validation type

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

[Unreleased]: https://github.com/Kashoo/synctos/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/Kashoo/synctos/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/Kashoo/synctos/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Kashoo/synctos/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/Kashoo/synctos/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/Kashoo/synctos/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Kashoo/synctos/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Kashoo/synctos/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Kashoo/synctos/compare/57a18bd...v1.0.0

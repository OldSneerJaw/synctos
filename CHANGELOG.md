# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- [#28](https://github.com/Kashoo/synctos/issues/28): Parameter to allow unknown properties in a document or object
- [#49](https://github.com/Kashoo/synctos/issues/49): Explicitly declare JSHint rules

## [1.2.0]
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

[Unreleased]: https://github.com/Kashoo/synctos/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/Kashoo/synctos/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Kashoo/synctos/compare/v1.0.0...v1.1.0

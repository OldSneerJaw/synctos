# Introduction

Synctos is an open source project. Contributions, whether as bug reports, feature requests or code, are welcomed and encouraged. Before you begin, please take a few moments to read and understand the guidelines for contribution below.

# Requesting Changes

Every bug or feature request should have a corresponding issue logged in the GitHub project's [Issues](https://github.com/Kashoo/synctos/issues) tab.

For bugs, be sure to include clear steps to reproduce the issue, including which versions of synctos are affected, as well as which versions of Couchbase Server and Sync Gateway the issue is reproducible with. When a bug has been reviewed by a project contributor, it will be assigned the [bug](https://github.com/Kashoo/synctos/issues?utf8=%E2%9C%93&q=is%3Aissue+label%3Abug) label.

For feature requests, describe the desired behaviour and provide examples of valid and invalid document definition configuration, where applicable. When a feature request has been reviewed and accepted by a project contributor, it will be assigned the [enhancement](https://github.com/Kashoo/synctos/issues?utf8=%E2%9C%93&q=is%3Aissue+label%3Aenhancement) label.

# Implementing Changes

This section contains information on how to implement new features or fix bugs in the project.

### Getting Started

1. Install [Node.js](https://nodejs.org/) (the latest Long Term Support release or better is recommended) to build and run the project
2. Fork the synctos repository on GitHub
3. Clone your fork of the synctos repository
4. Install the project's local dependencies (run from the project root directory): `npm install`
5. Execute the project's tests (also run from the project root directory): `npm test`

### Project Structure

Files in the project are organized into the following directories:

* `/`: Reserved for project configuration files (e.g. `.gitignore`, `.travis.yml`, `package.json`), documentation (e.g. `README.md`, `CHANGELOG.md`, `LICENSE`) and executable command line scripts that are part of the package's public interface (e.g. `make-sync-function`, `validate-document-definitions`).
* `etc`: Any development script or other type of file that is not part of the package's public interface (e.g. build scripts).
* `lib`: Reserved for external packages (i.e. libraries) to be embedded as static dependencies in the project.
* `samples`: A collection of document definitions that are purely for example purposes. Specifications for these document definitions are stored in the top level `test` directory. Code must be written to the **ECMAScript 3** specification for compatibility with Sync Gateway.
* `src`: JavaScript code that is executable by Node.js. Specifications should be stored in files alongside the code under test in this directory. Code may be written to the subset of the **ECMAScript 2015** and later specifications that is supported by Node.js v8.9.0.
* `templates`: JavaScript templates for sync functions/document definitions. Notably, the code in this directory is _not_ intended to be executable by Node.js. Specifications are stored in the top level `test` directory. Code must be written to the **ECMAScript 3** specification for compatibility with Sync Gateway.
* `test`: Test cases for document definition configuration elements from the top level `templates` directory and example document definitions from the top level `samples` directory. Code may be written to the subset of the **ECMAScript 2015** and later specifications that is supported by Node.js v8.9.0.

### Commits

Individual commits for an issue should reference the GitHub issue's ticket number in the commit message and provide a brief description of what has changed. For example:

```
Issue #100: Allow test-helper module to initialize from document definitions
```

### Testing

Every change should include comprehensive test cases. There are two different categories for specifications/tests in the project:

- Document definition configuration: Specifications for configuration elements that are defined in the `templates` directory are stored in the `test` directory. Document definitions that are to be referenced in such test cases should be stored in the `test/resources` directory. For example, the specifications for the `mustEqual` constraint are stored at `test/must-equal.spec.js` and the corresponding test document definitions are stored at `test/resources/must-equal-doc-definitions.js`. Be sure to make use of the built-in test-helper module to simplify test cases wherever possible. See the synctos [Testing](https://github.com/Kashoo/synctos/blob/master/README.md#testing) documentation for more info.
- Node.js supporting code: Specifications for Node.js code that is defined in the `src` directory are stored alongside the corresponding source code files in the `src` directory. Except in special cases, the specifications file's name should match that of the file under test. For example, the specifications for `src/loading/sync-function-loader.js` are stored at `src/loading/sync-function-loader.spec.js`.

In either case, specification files must be denoted by the `.spec.js` filename suffix to be executed by the [Mocha](http://mochajs.org/) test runner. Test cases should use the [Chai](http://chaijs.com/) assertion library's [expect](http://chaijs.com/api/bdd/) assertion style.

To execute the full test suite and lint the project's JS files with JSHint, run `npm test` from the project's root directory. A detailed, human-readable code coverage report is generated at `build/coverage/lcov-report/index.html`.

### Document definitions schema validator

Whenever configuration elements are added or updated, the document definitions schema (see the `src/validation/document-definition-schema` and `src/validation/property-validator-schema` modules) must also be updated for use by the document-definitions-validator module. The schema is defined according to the [Joi](https://github.com/hapijs/joi) library's API. See the project's official API [documentation](https://github.com/hapijs/joi/blob/v13.1.2/API.md) for more info.

### Content validation

Where possible, make use of the `importSyncFunctionFragment` macro to split new type validation logic out of the `templates/sync-function/validation-module` module into its own submodule. Furthermore, the addition of a new property/element validation type must be accompanied by an entry in the `src/testing/validation-error-formatter` module's `getTypeDescription` function.

### Documentation

The project includes comprehensive end user documentation and, to ensure it stays that way over time, every new feature must be described in detail in the project's `README.md`. In many cases (e.g. when adding a new validation type) you should be able to simply follow the documentation examples provided for existing features. Be sure to update the table of contents whenever new headings are added and include code/configuration samples wherever it is appropriate to do so.

Bugs do not generally need to be documented in `README.md` unless there is some caveat that users should be aware of. For example, the need to double-escape backslashes in document definitions for older versions of Sync Gateway (see sync_gateway issue [#1866](https://github.com/couchbase/sync_gateway/issues/1866)).

A change that addresses a GitHub issue with either of the [bug](https://github.com/Kashoo/synctos/issues?q=is%3Aissue+label%3Abug) or [enhancement](https://github.com/Kashoo/synctos/issues?q=is%3Aissue+label%3Aenhancement) labels must include an entry in `CHANGELOG.md`'s "Unreleased" section according to the guidelines at [Keep a Changelog](http://keepachangelog.com). Whenever a component is marked for deprecation, its name must be listed under the "Deprecated" heading (e.g. "`etc/test-helper` module"). Likewise, when a component has been deleted, its name must be listed under the "Removed" heading. Other issue types that do not have a functional impact on the application's behaviour (e.g. a [task](https://github.com/Kashoo/synctos/issues?&q=is%3Aissue+label%3Atask)) generally should not be listed in the changelog.

### Example document definitions

The project's `samples` directory contains a number of document definitions as examples for end users (originally based on Kashoo's official [document definitions](https://github.com/Kashoo/kashoo-document-definitions)). Configuration elements introduced by new features should also be added as examples to these sample document definitions for illustrative purposes.

### Backward compatibility

The project's public API will evolve over time, but it is important to avoid changes that break the behaviour of validation types, document type definition properties, helper functions, etc. that are referenced in `README.md` and the functions and variables that are defined in the package's main module (i.e. `index.js`) and any other Node.js modules that may be introduced as public components over time. Only under special circumstances and with prior deliberation and approval from official project contributors will breaking changes be considered for inclusion.

### Package dependencies

The project does not and should not include any external Node.js package dependencies. In fact, in most cases it should not be necessary to add any new dependencies since the project is constrained to run within the limited JavaScript context provided by Sync Gateway, which does not allow for external packages to be imported. But in those cases where a particular utility is absolutely critical, it should be embedded statically in the project's `lib` directory, as long as it is available under a license that is compatible with this project's MIT license (e.g. Apache License 2.0, BSD, Mozilla Public License 2.0).

In that event, create a new directory for the dependency in the `lib` directory and be sure to include an unaltered copy of the dependency's license file, a new file called `VERSION` that specifies the exact version number of the dependency, a new file called `REPOSITORY` that specifies the URL of the source code repository, along with only the files from the dependency that are absolutely necessary for the desired feature to work correctly in synctos (e.g. don't include `.gitignore`, `package.json`, `README`, etc.). If upgrading an existing embedded dependency, be sure to update the `VERSION` file as well. See `lib/indent.js` and `lib/simple-mock` for examples.

Note that development dependencies (i.e. `devDependencies` in `package.json`) _may be_ allowed since they are not transitive, but one should exercise good judgement and only include dependencies that provide vital and non-trivial functionality.

Dependencies of either type may be rejected at the discretion of official project contributors if they are deemed unnecessary.

### Package versioning

The project follows the principle of [Semantic Versioning](https://semver.org/). However, the package's version is updated **only** as part of the release process. Commits for bugs and features should not modify the "version" property in `package.json`. In other words, unless you are personally responsible for publishing a release of synctos, leave the version number as is.

### Pull requests

Each change must be implemented in its own feature branch and submitted via a GitHub [pull request](https://help.github.com/articles/about-pull-requests/) for code review by a synctos project contributor. Generally, unless you are a project contributor with write access to the repo, this will require you to fork the repo, create a new branch for the feature/bug, commit the changes to the branch on your fork and then open a pull request on the original synctos repo from your fork's branch.

The project's Travis CI [build job](https://travis-ci.org/Kashoo/synctos) will be triggered automatically to execute all test cases and lint the code whenever there is a new or updated pull request. If the build fails, it is your responsibility to fix the problem and update the pull request with new commits.

# Reviewing Changes

Once a change has been posted as a GitHub pull request, a synctos project contributor other than the change's author needs to examine the code for style, correctness, test coverage, documentation and semantics. As part of your due diligence, verify that the Travis CI build job successfully ran to completion for the pull request.

Special care should be taken to ensure that each submission is captured as a GitHub issue, thoroughly documented in `README.md` and in `CHANGELOG.md`'s "Unreleased" section, comprehensively covered by test cases, includes examples in the sample document definitions directory, does not introduce breaking changes to public APIs, does not introduce new package dependencies and does not make use of advanced JavaScript/ECMAScript language features that are not supported by the [version](https://github.com/robertkrimen/otto/tree/5282a5a45ba989692b3ae22f730fa6b9dd67662f) of the otto JavaScript engine/interpreter that is used by Sync Gateway.

If/when a change is deemed satisfactory, it is the responsibility of the reviewer to merge the pull request and delete its feature branch, where possible.

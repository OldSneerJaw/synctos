# Getting Started

1. Install [Node.js](https://nodejs.org/) (the latest Long Term Support release or better is recommended) to build and run the project
2. Fork the synctos repository
3. Clone your fork of the synctos repository
4. Install the project's local dependencies (run from the project root directory): `npm install`
5. Execute the project's tests (also run from the project root directory): `npm test`

# Requesting Changes

Every bug or feature should have a corresponding issue logged in the GitHub project's [Issues](https://github.com/Kashoo/synctos/issues) tab.

For bugs, be sure to include clear steps to reproduce the issue, including which versions of synctos are affected, as well as which versions of Couchbase Server and Sync Gateway the issue is reproducible with. When a bug has been reviewed by a project contributor, it will be assigned the [bug](https://github.com/Kashoo/synctos/issues?utf8=%E2%9C%93&q=is%3Aissue+label%3Abug) label.

For feature requests, describe the desired behaviour and provide examples of valid and invalid document definition configuration, where applicable. When a feature request has been reviewed and accepted by a project contributor, it will be assigned the [enhancement](https://github.com/Kashoo/synctos/issues?utf8=%E2%9C%93&q=is%3Aissue+label%3Aenhancement) label.

# Implementing Changes

This section contains information on how to implement new features or fix bugs in the project.

### Commits

Individual commits for an issue should reference the GitHub issue's ticket number in the commit message and provide a brief description of what has changed. For example:

```
Issue #100: Allow test-helper module to initialize from document definitions
```

### Testing

Every change should include comprehensive test cases defined in the `test` directory using the [Chai](http://chaijs.com/) assertion library's [expect](http://chaijs.com/api/bdd/) assertion style. Tests are executed by the [Mocha](http://mochajs.org/) test runner. Be sure to make use of the built-in test-helper module to simplify test cases wherever possible. See the synctos [Testing](https://github.com/Kashoo/synctos/blob/master/README.md#testing) documentation for more info.

To execute the full test suite and lint the project's JS files with JSHint, run `npm test` from the project's root directory.

### Documentation

The project includes comprehensive end user documentation and, to ensure it stays that way over time, every new feature must be described in detail in the project's `README.md`. In many cases (e.g. when adding a new validation type) you should be able to simply follow the documentation examples provided for existing features. Be sure to include code/configuration samples wherever it is appropriate to do so.

Bugs do not generally need to be documented in `README.md` unless there is some caveat that users should be aware of. For example, the need to double-escape backslashes in document definitions for older versions of Sync Gateway (see sync_gateway issue [#1866](https://github.com/couchbase/sync_gateway/issues/1866)).

In either case, include an entry for each change in `CHANGELOG.md`'s "Unreleased" section according to the guidelines at [Keep a CHANGELOG](http://keepachangelog.com).

### Example document definitions

The project's `samples` directory contains a number of document definitions as examples for end users (originally based on Kashoo's official [document definitions](https://github.com/Kashoo/kashoo-document-definitions)). Features that introduce new configuration elements should also be added as examples to these sample document definitions for illustrative purposes.

### Backward compatibility

The project's public API will evolve over time, but it is important to avoid changes that break the behaviour of validation types, document type definition properties, helper functions, etc. that are referenced in `README.md` and functions and variables that are defined in the test-helper and validation-error-message-formatter modules (and any others that may be introduced as public components over time). Only under special circumstances and with prior deliberation and approval from official project contributors will breaking changes be considered for inclusion.

Note: Since the project follows the principle of Semantic Versioning, a breaking change will make it necessary to update the next release's major version number component (e.g. from `1.x.y` to `2.0.0`).

### Package dependencies

The project does not and should not include any external Node.js package dependencies. In fact, in most cases it should not be necessary to add any new dependencies since the project is constrained to run within the limited JavaScript context provided by Sync Gateway, which does not allow for external packages to be imported. But in those cases where a particular utility is absolutely critical, it should be embedded statically in the project's `lib` directory, as long as it is available under a license that is compatible with this project's MIT license (e.g. Apache License 2.0, BSD, Mozilla Public License 2.0). In that event, create a new directory for the project in the `lib` directory and be sure to include an unaltered copy of the project's license file, a file called `VERSION` that specifies the exact version number that is included and only the files from the project that are absolutely necessary for the desired feature to work correctly in synctos (e.g. don't include `.gitignore`, `package.json`, `README`, etc.). If upgrading an embedded dependency, be sure to updating the `VERSION` file as well. See `lib/indent.js` and `lib/simple-mock` for examples.

### Pull requests

Each change must be implemented in its own feature branch and submitted via a GitHub [pull request](https://help.github.com/articles/about-pull-requests/) for code review by a synctos project contributor. Generally, unless you are a project contributor with write access to the repo, this will require you to fork the repo, create a new branch for the feature/bug, commit the changes to the branch on your fork and then open a pull request on the original synctos repo from your fork's branch.

The project's Travis CI [build job](https://travis-ci.org/Kashoo/synctos) will be triggered automatically to execute all test cases and lint the code whenever there is a new or updated pull request. If the build fails, it is your responsibility to fix the problem and update the pull request with new commits.

# Reviewing Changes

Once a change has been posted as a GitHub pull request, a project contributor other than the change's author needs to examine the code for style, correctness, test coverage, documentation and semantics. As part of your due diligence, verify that the Travis CI build job successfully ran to completion for the pull request.

Special care should be taken to ensure that each submission is captured as a GitHub issue, thoroughly documented in `README.md` and in `CHANGELOG.md`'s "Unreleased" section, comprehensively covered by test cases, includes examples in the sample document definitions, does not introduce breaking changes to public APIs, does not introduce new package dependencies and does not make use of advanced JavaScript/ECMAScript language features that are not supported by the [version](https://github.com/robertkrimen/otto/tree/5282a5a45ba989692b3ae22f730fa6b9dd67662f) of the otto JavaScript engine/interpreter that is used by Sync Gateway.

If/when a change is deemed satisfactory, it is the responsibility of the reviewer to merge the pull request and delete its feature branch, where possible.

# Development SOP

This document outlines the "standard operating procedures" for this repository concerning the development process.  For more general information see the [README](README.md) doc.

## Development process.

  * Create a local feature branch `git checkout -b <mybranch>`
  * Edit your local copy
  * Write tests
  * Run `yarn test` to ensure your code passes all tests before pushing changes.
  * Stage changes to commit `git add <filename>`
  * Commit changes locally `git commit -m "fixes #12"`  Please use short descriptive commit messages.  Included referneces to tickets you are working on.
  * Push your changes to a remote branch `git push`
  * Create a pull request on github, ensure you choose `develop` as your base and not `main`
      * Ensure all tests have passed and branch is has no conflicts.
      * Select someone to review your code.  All code must have **at lease one approval** from another team member before merging.
  * Wait for a code review.  If the reviewer requests changes make sure that they are addressed before merging.
  * Once the code has been approved and has passed all checks you may merge your branch.
  * Delete old feature branch on Github

## Environment variables

The .env file store the default values for environment variables. 
These values can be easily overridden by creating .env.local file. 
The application recognises NODE_ENV variable and load .env files depends on this value. 
For example if we run `yarn test`, the NODE_ENV value is `test`.
The application will load `.env.test` file.
These test values can be overridden in `.env.test.local` file. 
The hierarchy of loading .env files looks as below:

- `.env.${process.env.NODE_ENV}.local`
- `.env.${process.env.NODE_ENV}`
- `.env.local`
- `.env`

## Migrations

Code that makes changes to entity files will need to enclude migration scripts before merging and those scripts will have to be tested in staging before being promoted to the main branch.

## Linting

This project uses _prettier_ and _eslint_.  Code that doesn't pass linting is not acceptable for merging.  In some cases the linting rules are prohibitive or just plain dumb.  In those cases disabling linting for a particular line or block of code is acceptable, but use sparingly.

## Data Models

We are using TypeORM with NestJs, but prefer the **Active Record** pattern over Data Mapper.

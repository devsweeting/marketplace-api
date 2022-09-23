# Marketplace Backend

## Development

Before contributing code to this repository please review the [Development SOP](DEVELOP.md)

## Configuration

You can override your environment variables in file `.env.local`, but it's not necessary for development environment

## Running the app

### Prerequisites

 1. Docker
 2. VSCode (see below)
     - The [Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

### Run

 1. Open this repository in VSCode
 2. Follow the VSCode prompt to "Reopen in container"
 3. Using the VSCode terminal (which is attached to the container):
     - `yarn build`
     - `yarn migration:up`
     - `yarn fixtures`
     - `yarn start:dev`

### Devcontainers

This repository uses [devcontainers](https://code.visualstudio.com/docs/remote/containers) to bootstrap the development environment. Because this is a VSCode-specific feature, that is what's expected here. If you prefer another editor, you will need to figure out the docker-compose setup yourself.

See `.devcontainer/devcontainer.json` for specifics.

### Migrations

- Use `yarn migration:create <migration name>` to create an empty migration
- Use `yarn migration:generate <migration name>` to automatically generate a migration based on source code changes
- After creating/generating a migration you'll have to manually import it in `src/database/migrations/index.ts` and add it to the `migrations` array for TypeOrm to detect it

## API Docs

Swagger docs available at
http://localhost:3001/docs

## Terminology

- **Asset** - A physical object or digital representation (NFT) of that object.
- **Attribute** - A key / value consisting of data describing an asset / NFT that is intrinsic to that asset and is immutable.
- **Label** - A label attached to an asset by Jump for grouping that asset into a particular class or category.  e.g.  featured
- **NFT** - Non-Fungible Token.  A digital receipt representing the a physical asset stored in a partners vault.
- **Contract** - The distributed program on the blockchain responsible for tracking ownership of NFTS.

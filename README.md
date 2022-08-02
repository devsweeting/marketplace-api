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
     - `yarn bundle`
     - `yarn migration:up`
     - `yarn fixtures`
     - `yarn start:dev`

### Devcontainers

This repository uses [devcontainers](https://code.visualstudio.com/docs/remote/containers) to bootstrap the development environment. Because this is a VSCode-specific feature, that is what's expected here. If you prefer another editor, you will need to figure out the docker-compose setup yourself.

See `.devcontainer/devcontainer.json` for specifics.

## API Docs

Swagger docs available at
http://localhost:3001/docs

## Blockchain

### Accounts

The following test accounts are funded with Ropsten test net ether.  Add these to your
Metamask for testing locally and via staging.

Keep in mind that this ether has to mined and most test transactions can be done with .01 - .05 eth

Jump Test 1 (Super Admin)
```
address: 0xF467Fb921d2EEb81961057d82Bb0350f688398e8
     pk: afba7de138c51b95fece9d5893ee1b9cee41ba00d6839ccc55563d79ce5341b8
```

Jump Test 2
```
address: 0xEd90010E9F6af8367A0ea3f54900c2dA09E00777
     pk: 2de73ed8b3e7b1378677b0f74004f7da48da23187cdda23b40e5566362b1a89b
```

Jump Text 3
```
address: 0xB4eE90a462559600dFe34AAa30Ac7dC3d28e3d5d
     pk: e70206e2ba62124531bada75cd23b45d847840e950de07fb73088ac92c3027c6
```

## Terminology

- **Asset** - A physical object or digital representation (NFT) of that object.
- **Attribute** - A key / value consisting of data describing an asset / NFT that is intrinsic to that asset and is immutable.
- **Label** - A label attached to an asset by Jump for grouping that asset into a particular class or category.  e.g.  featured
- **NFT** - Non-Fungible Token.  A digital receipt representing the a physical asset stored in a partners vault.
- **Contract** - The distributed program on the blockchain responsible for tracking ownership of NFTS.

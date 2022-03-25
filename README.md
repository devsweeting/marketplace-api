# Marketplace Backend

## Development

Before contributing code to this repository please review the [Development SOP](DEVELOP.md)

## Installation

```bash
yarn
```

## Configuration

You can override your environment variables in file `.env.local`, but it's not necessary for development environment

## Running the app
Start Postgres and mail server (mailhog) locally
```bash
docker-compose up -d
```

Add test data to database (optional)
```
yarn fixtures
```

Bundle custom login page
```bash
yarn bundle
```

Start development server
```bash
yarn start:dev
```

## API Docs

Swagger docs available at 
http://localhost:3001/docs

## Terminology

- **Asset** - A physical object or digital representation (NFT) of that object.
- **Attribute** - A key / value consisting of data describing an asset / NFT that is intrinsic to that asset and is immutable.
- **Label** - A label attached to an asset by Jump for grouping that asset into a particular class or category.  e.g.  featured
- **NFT** - Non-Fungible Token.  A digital receipt representing the a physical asset stored in a partners vault.
- **Contract** - The distributed program on the blockchain responsible for tracking ownership of NFTS.

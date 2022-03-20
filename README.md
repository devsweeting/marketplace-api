# Marketplace Backend

## Development

Before contributing code to this repository please review the [Development SOP](DEVELOP.md)

## Installation

```bash
yarn
```

## Configuration

Create your .env configuration file.  You may need additional crednetials
here depending on what you are testing.

```bash
cp .env.template .env
```

## Running the app
Start Postgres locally
```bash
docker-compose up -d
```

Add test data to database (optional)
```
yarn fixtures
```

Start development server
```bash
yarn dev
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

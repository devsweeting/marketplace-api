# Marketplace Backend

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

Start development server
```bash
yarn start:dev
```

## API Docs

Swagger docs available at 
http://localhost:3001/docs

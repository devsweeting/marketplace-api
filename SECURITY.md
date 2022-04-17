# Application Security

## Security related environment variables

For any secrets that require a "random string" a secure method of generation should be used.  For example:

```bash
openssl rand -base64 60
```

### Application environments
- `NODE_ENV` - determine the application environment e.g. `DEVELOP`, `ADMIN` 
- `TYPEORM_PASSWORD` - database password e.g. `password`

### AdminJS environments
- `COOKIE_PASSWORD` - this is secret password for AdminJS cookie session. Should be some random string
- `ADMIN_ADDRESS` - the wallet address wit which the administrator will be created, if there is no one in the database e.g. `0xF467Fb921d2EEb81961057d82Bb0350f688398e8`
- `SESSION_SECRET` - password that is used to encode the user's session, which is stored in the database in the `sessions`. This should be some random string

### API environments
- `JWT_SECRET` - the password that is used to encode the JWT token. This should be some random string
- `JWT_EXPIRATION_TIME` - jwt token expiration time in ms e.g. `3600`

### AWS environments
- `AWS_ACCESS_KEY` - AWS ACCESS KEY for uploading images
- `AWS_SECRET_KEY` - AWS SECRET KEY for uploading images

### Rollbar environments
This tool is enabled for NODE_ENV `STAGING` or `PRODUCTION`
- `ROLLBAR_TOKEN` - rollbar token for reporting errors

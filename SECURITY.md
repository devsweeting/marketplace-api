# Application Security

## Security related environment variables

For any secrets that require a "random string" a secure method of generation should be used.  For example:

```bash
openssl rand -base64 60
```

### Application environments
- `NODE_ENV` - The application environment e.g. `DEVELOP`, `ADMIN` 
- `TYPEORM_PASSWORD` - Database password e.g. `password`

### AdminJS environments
- `ADMIN_ADDRESS` - Super admin wallet address e.g. `0xF467Fb921d2EEb81961057d82Bb0350f688398e8`
- `COOKIE_PASSWORD` - Secret password for AdminJS cookie session. Should be some random string
- `SESSION_SECRET` - Random string that is used to encode the user's session, which is stored in the database in the `sessions`.

### API environments
- `JWT_SECRET` - Random string assword that is used to encode the JWT token.
- `JWT_EXPIRATION_TIME` - jwt token expiration time in ms e.g. `3600`

### AWS environments
- `AWS_ACCESS_KEY` - AWS ACCESS KEY for uploading images
- `AWS_SECRET_KEY` - AWS SECRET KEY for uploading images

### Rollbar environments
This tool is enabled for NODE_ENV `STAGING` or `PRODUCTION`
- `ROLLBAR_TOKEN` - Rollbar token for reporting errors

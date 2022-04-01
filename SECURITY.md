# Environment variables in `.env` file

### Application environments
- `NODE_ENV` - determine the application environment e.g. `DEVELOP`, `ADMIN` 
- `SERVER_PORT` - port that the application will running on e.g. `3001`

### Database environments
- `TYPEORM_CONNECTION` - database type e.g. `postgres`
- `TYPEORM_HOST` - database host e.g. `127.0.0.1`
- `TYPEORM_PORT` - database port e.g. `7432`
- `TYPEORM_USERNAME` - database user e.g. `postgres`
- `TYPEORM_PASSWORD` - database password e.g. `password`
- `TYPEORM_DATABASE` - database name e.g `marketplace`
- `TYPEORM_SYNCHRONIZE` - determine if database should be automaticaly created and synced basing on entities or not e.g. `true`
- `TYPEORM_LOGGING` - determine if every database query should be logged to the application stream e.g. `true` 
- `TYPEORM_ENTITIES`- regex path to entities. This is important if we want to run cli typeorm command e.g. `./dist/**/*.entity.js`

### AdminJS environments
- `COOKIE_PASSWORD` - this is secret password for AdminJS cookie session. Should be some random string
- `COOKIE_NAME` - name of the cookie that AdminJS will store encrypted information about logged in user e.g. `adminjs`
- `ADMIN_EMAIL` - the e-mail address with which the administrator will be created, if there is no one in the database e.g. `admin@example.com`
- `ADMIN_ADDRESS` - the wallet address wit which the administrator will be created, if there is no one in the database e.g. `0xF467Fb921d2EEb81961057d82Bb0350f688398e8`
- `SESSION_SECRET` - password that is used to encode the user's session, which is stored in the database in the `sessions`. This should be some random string

### API environments
- `JWT_SECRET` - the password that is used to encode the JWT token. This should be some random string
- `JWT_EXPIRATION_TIME` - jwt token expiration time in ms e.g. `3600`

### Mailer environments
- `MAILER_HOST` - SMTP host. for development this is `mailhog`
- `MAILER_PORT` - SMTP port. for development this is `1025`
- `MAILER_SECURE` - determine if SMTP should be connected via SSL e.g. `true`
- `MAILER_USER` - SMTP user. for development this is empty
- `MAILER_PASSWORD` - SMTP password. for development this is empty
- `MAILER_FROM` - mail `FROM` field. user that sends the email

### AWS environments
- `AWS_ACCESS_KEY` - AWS ACCESS KEY for uploading images
- `AWS_SECRET_KEY` - AWS SECRET KEY for uploading images
- `AWS_S3_BUCKET` - AWS S3 BUCKET for uploading images
- `AWS_REGION`- AWS REGION for uploading images e.g. `us-west-2`
- `CLOUDFRONT_DOMAIN` - cloudfront domain for files e.g. `https://cdn.staging.jump.co`

### Rollbar environments

This tool is enabled for NODE_ENV `STAGING` or `PRODUCTION`

- `ROLLBAR_TOKEN` - rollbar token for reporting errors
- `ROLLBAR_ENVIRONMENT` - rollbar environment for reporting errors

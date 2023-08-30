## Running Locally

Create a file in this directory called `.env` with the following values:

```sh
PORT=3001
CLIENT_ID=xxx
CLIENT_SECRET=xxx
JWT_SIGNING_HASH=xxx
REDIRECT_URI=https://localhost:3001/callback
POST_LOGIN_URL=http://localhost:3000/login_success?
REDIS_HOSTNAME=redis://local.playtunedin-test.com:6379
```

Run `require('crypto').randomBytes(64).toString('hex')` and save the output as the value of JWT_SIGNING_HASH, this will
be used to sign and verify the JWT used for auth.

Run `npm start` and go to http://localhost:3000/login in your browser

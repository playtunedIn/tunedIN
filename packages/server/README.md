## Running Locally

Create a file in this directory called `.env` with the following values:

```sh
PORT=3001
CLIENT_ID=xxx
CLIENT_SECRET=xxx
JWT_SIGNING_HASH=xxx
REDIRECT_URI=https://local.playtunedin-test.com:3001/callback
POST_LOGIN_URL=https://local.playtunedin-test.com:19006/?
REDIS_HOSTNAME=redis://local.playtunedin-test.com:6379
WS_HEARTBEAT_INTERVAL=30000
IGNORE_HEARTBEAT_INTERVAL=false # Set to true only when testing websockets in postman locally
```

Run `require('crypto').randomBytes(64).toString('hex')` and save the output as the value of JWT_SIGNING_HASH, this will
be used to sign and verify the JWT used for auth.

Run `pnpm dev` and go to https://local.playtunedin-test.com:16009/login in your browser

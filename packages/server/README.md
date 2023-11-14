## Running Locally

Create a file in this directory called `.env` with the following values:

```sh
PORT=3001
CLIENT_ID=xxx
CLIENT_SECRET=xxx
JWT_SIGNING_HASH=xxx
REDIRECT_URI=https://localhost:3001/callback
POST_LOGIN_URL=https://localhost:19006/?
REDIS_HOSTNAME=redis://localhost:6379
WS_HEARTBEAT_INTERVAL=30000
IGNORE_HEARTBEAT_INTERVAL=false # Set to true only when testing websockets in postman locally
```

Run `require('crypto').randomBytes(64).toString('hex')` and save the output as the value of JWT_SIGNING_HASH, this will
be used to sign and verify the JWT used for auth.

Run `pnpm dev` and go to https://localhost:16009/login in your browser

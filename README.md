# SpotiSpy

SpotiSpy is an app that combines trivia gaming with Spotify data. It provides a fun way to test your music knowledge
based on your personal Spotify data.

## Getting Started

Follow the instructions below to get the SpotiSpy app up and running on your local machine.

### Prerequisites

To run the SpotiSpy app, you'll need the following installed on your machine:

- Node.js (v20 or higher)
- PNPM

### Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/SpotiSpy.git
```

2. Navigate to the project's root directory:

```bash
cd SpotiSpy
```

3. Install the dependencies:

```bash
pnpm install
```

4. Generate Server SSL Cert:

```bash
pnpm -F server generate-cert
```

5. Setup Redis instance (**note** you will need docker, docker runtime, and the redis image setup):

```bash
docker run -d -p 6379:6379 --name myredis redis
```

6. Start project:

```bash
pnpm dev
```

### Usage

Once the app is running, you can explore the SpotiSpy trivia game and enjoy testing your music knowledge based on your
Spotify data. Follow the on-screen instructions to play the game and have fun!

To access the following services in your local environment use the following links:

- client - http://localhost:3000
- server - http://localhost:3001

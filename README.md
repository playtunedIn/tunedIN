# TunedIN

TunedIN is an app that combines trivia gaming with Spotify data. It provides a fun way to test your music knowledge
based on your personal Spotify data.

## Getting Started

Follow the instructions below to get the TunedIN app up and running on your local machine.

### Prerequisites

To run the TunedIN app, you'll need the following installed on your machine:

- Node.js (v20 or higher)
- PNPM

### Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/playtunedIn/tunedIN.git
```

2. Navigate to the project's root directory:

```bash
cd tunedIN
```

3. Install the dependencies:

```bash
pnpm install
```

5. Update your host file

[How to update host file](https://www.hostinger.com/tutorials/how-to-edit-hosts-file)

add an entry for local tunedin:

```
127.0.0.1 local.playtunedin-test.com
```

6. Generate Server SSL Certs:

```bash
sudo pnpm generate-certs

# You may need to change file permissions to allow node to read certs
chmod +wrx packages/client/.cert/*
chmod +wrx packages/server/.cert/*
```

7. Setup Docker

To Setup Docker you must install a docker runtime

[Docker Desktop](https://www.docker.com/)


8. Run Docker


Launch Docker Desktop application


9. Ensure Environments are setup for client and server

[Client README.md](https://github.com/playtunedIn/tunedIN/blob/main/packages/client/README.md)

[Server README.md](https://github.com/playtunedIn/tunedIN/blob/main/packages/server/README.md)

10. Start project:

```bash
pnpm dev
```

### Usage

Once the app is running, you can explore the TunedIN trivia game and enjoy testing your music knowledge based on your
Spotify data. Follow the on-screen instructions to play the game and have fun!

To access the following services in your local environment use the following links:

- client - https://local.playtunedin-test.com:8080/
- server - https://local.playtunedin-test.com:3001/

### FAQ

For more information on the game state and redis see this confluence doc: https://spotispy.atlassian.net/l/cp/Sy0QuvWs

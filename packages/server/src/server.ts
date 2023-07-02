import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (_, res) => {
  res.send('Hello, Express!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

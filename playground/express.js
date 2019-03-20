const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/', async (req, res) => {
  console.log(req.headers.location);
});

app.listen(5000, () => {
  console.log('Listening on port 5000');
});

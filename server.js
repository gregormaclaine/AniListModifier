const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const get_scores = require('./anilist_api');

app.post('/get_scores_for_feed', async (req, res) => {
  console.log('Getting the scores for the following feed items:');
  console.log(req.body);

  if (!req.body || !req.body.slice)
    return res.status(400).send('Bad body request');

  if (!req.body.length) return res.json([]);

  const result = await get_scores(req.body);
  res.json(result);
  console.log('Successfully replied with scores\n');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

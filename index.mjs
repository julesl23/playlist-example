import express from 'express';

const app = express();

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('list-addresses');
});

app.listen(5002, '0.0.0.0', () => console.log('Server running on port 5002'));

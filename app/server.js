const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Poll = require('./models/poll');
const app = express();
const seedDB = require('./seed');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/votingapp');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

seedDB();

app.get('/', (req, res) => {
  Poll.find({}).then(
    (polls) => {
      res.render('index', {polls: polls});
    });
});

app.get('/polls/new', (req, res) => {
  res.render('new');
});

app.get('/polls/:id', (req, res) => {
  const id = req.params.id;

  Poll.findById(id, (err, poll) => {
    res.render('show', {poll: poll});
  });
});

app.post('/polls', (req, res) => {
  const title = req.body.title;
  const options = req.body.options.split(',').map((option) => {
    return option.trim();
  });

  const pollOptions = options.map((opt) => {
    return {content: opt, votes: 0};
  });

  Poll.create({
    user: 'anon',
    title: title,
    options: pollOptions,
  }, (err, poll) => {
    if (err) {
      console.error(err);
    }

    res.redirect('/');
  });
});

app.post('/polls/:id', (req, res) => {
  const id = req.params.id;

  if (req.body.option) {
    const option = req.body.option;

    Poll.findById(id, (err, poll) => {
      if (err) {
        console.error(err);
      }

      poll.options[option].votes += 1;
      poll.save((err, data) => {
        console.log('successful update');
      });
    });
  }

  if (req.body.content) {
    const content = req.body.content;

    Poll.findById(id, (err, poll) => {
      if (err) {
        console.error(err);
      }

      poll.options.push({content: content, votes: 0});
      poll.save(() => {
        res.redirect('/polls/' + id);
      });
    });
  }
});

app.delete('/polls/:id', (req, res) => {
  // delete
});

module.exports = app;

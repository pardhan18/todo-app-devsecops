const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

let todos = [];

app.get('/', (req, res) => {
    res.render('index', { todos });
});

app.post('/add', (req, res) => {
    const task = req.body.task;

    if (task) {
        todos.push(task);
    }

    res.redirect('/');
});

app.listen(3000, () => {
    console.log('App running on port 3000');
});

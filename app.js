// CREATE DATABASE IF NOT EXISTS test;
// USE test;

// CREATE TABLE users (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   username VARCHAR(100),
//   email VARCHAR(100),
//   password VARCHAR(255)
// );

// CREATE TABLE contact_messages (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name VARCHAR(100),
//   email VARCHAR(100),
//   message TEXT
// );


const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

const app = express();

// === MySQL Connection ===
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // default for XAMPP
    password: '',
    database: 'test'    // change to 'node_app' if you followed earlier instructions
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected');
});

// === Middlewares ===
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
}));

// === Routes ===

app.get('/', (req, res) => res.sendFile(__dirname + '/views/login.html'));
app.get('/register', (req, res) => res.sendFile(__dirname + '/views/register.html'));
app.get('/contact', (req, res) => res.sendFile(__dirname + '/views/contact.html'));
app.get('/welcome', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/views/welcome.html');
    } else {
        res.redirect('/');
    }
});

// Register
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 8);

    db.query('INSERT INTO users SET ?', { username, email, password: hash }, (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) throw err;

        if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
            req.session.user = results[0];
            res.redirect('/welcome');
        } else {
            res.send('Invalid email or password');
        }
    });
});

// Contact Form
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    db.query('INSERT INTO contact_messages SET ?', { name, email, message }, (err) => {
        if (err) throw err;
        res.send('Thank you! Your message has been received.');
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

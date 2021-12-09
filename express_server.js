const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser'); //library that converts request body from a buffer to a string.
const cookieParser = require('cookie-parser'); // library to use cookies
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.set('view engine', 'ejs');
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "ga7399"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "ga7399"
  }
};

const users = {
  "ga7399": {
    id: "ga7399",
    email: "qwe@example.com",
    password:"$2a$10$ZrCI4M.T6SFuFMunW2eIcuaJAiJyfWXZN4HfCrkGN3FSncJpf2.rS"

  },
  "Sw28e5": {
    id: "Sw28e5",
    email: "asd@example.com",
    password: "$2a$10$J4ELF1aCD/cN12K66YQCKueIKXrG9I7Lad75OxBubZFMvLrC/.GXa"
  }
};
//helper function to find emails
const findUserByEmail = function(email) {
  for (const userID in users) { //userID is the id random
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// http://localhost:8080/ -> Hello!
app.get('/', (req, res) => {
  res.send('Hello!');
});

// http://localhost:8080/urls -> webpage showing the index and using username stored in cookies
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id ),
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

// http://localhost:8080/urls/news -> webpage showing the textbox to input a new URL and using username stored in cookies
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id ]
  };
  if (templateVars.user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// random string 6 characters, alphanumeric, lower and upper case
const generateRandomString = function() {
  const randomString = Math.random().toString(36).substring(2,8);
  return randomString;
};

// create a new short URL and redirect the user to /urls page, with shortURL and longURL
const urlsForUser = function(id) {
  let newDatabase = {};
  for (const shorts in urlDatabase) {
    if (urlDatabase[shorts].userID === id) {
      newDatabase[shorts] = urlDatabase[shorts];
    }
  }
  return newDatabase;
};

app.post('/urls', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
      
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL : req.body.longURL,
      userID: templateVars.user.id};
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send('Please Register and Login to have access to this magic app');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send('ShortURL invalid');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  
  if (!req.session.user_id) { //user is not logged in
    res.send('User is not logged in');
  } else { //user is logged in
    if (urlDatabase[shortURL]) { //shortURL exists in the urlDatabase
      const newDatabase = urlsForUser(req.session.user_id);
      if (Object.prototype.hasOwnProperty.call(newDatabase, shortURL)) { //shortURL is authorized for the user
        const templateVars = { shortURL: req.params.shortURL,
          longURL: urlDatabase[shortURL].longURL,
          user: users[req.session.user_id]
        };
        res.render('urls_show', templateVars);
      } else {//shortURL is not authorized for the user
        res.send('You are not authorized to see it');
      }
    } else { //shortURL does not exists in the urlDatabase
      res.send('ShortURL invalid');
    }
  }
});

//delete a set shortURL and longURL
app.post('/urls/:shortURL/delete', (req, res)=> {
  const shortURL = req.params.shortURL;
  const newDatabase = urlsForUser(req.session.user_id);
  if (Object.prototype.hasOwnProperty.call(newDatabase, shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send('You are not authorized to delete it');
  }
});

//edit a longURL
app.post('/urls/:shortURL/edit', (req, res)=> { // from server-side
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  const newDatabase = urlsForUser(req.session.user_id);//const newDatabase = urlsForUser(req.cookies['user_id']);

  if (Object.prototype.hasOwnProperty.call(newDatabase, shortURL)) {
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect('/urls');
  } else {
    res.send('You are not authorized to edit it');
  }
});

//creating a register page with email and password
app.get('/register', (req, res) => {
  const templateVars = {
    user: null
  };
  res.render('urls_regUser', templateVars);
});

//creating a register page with email and password
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) { //avoiding empty emails or empty emails
    return res.status(400).send('Hey! email or password can not be empty!');
  }
  const user = findUserByEmail(email); //calling the helper function
  if (user) { // user.email === email, return user
    return res.status(400).send('Ops! An user with same email already exists!');
  }
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  console.log(password, hashedPassword)
  req.session.user_id = users[id].id;
  // res.cookie('user_id', users[id].id); //user.id = id inside the users[id] stored in the cookie
  res.redirect('/urls');
});

//login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: null
  };
  res.render('urls_login', templateVars);
});

//login in with email and password
app.post('/login', (req, res)=> {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  const validatePassword = bcrypt.compareSync(password, user.password);
  if (!user) {
    res.status(403).send('User can not be found');
  } else if (user && validatePassword) {
    req.session.user_id = user.id; //res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(403).send('Wrong Password! Try it again!');
  }
});

// email logout and storing in cookies
app.post('/logout', (req, res)=> { // username
  res.clearCookie('session');
  res.redirect('/urls');
});

// print the object urlDatabase
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n'); //World - bold as html
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
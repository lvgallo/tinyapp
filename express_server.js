const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser'); //library that converts request body from a buffer to a string.
const cookieParser = require('cookie-parser'); // library to use cookies
const { application } = require('express');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "ga7399": {
    id: "qwe", 
    email: "qwe@example.com", 
    password: "123"
  },
 "Sw28e5": {
    id: "asd", 
    email: "asd@example.com", 
    password: "abc"
  }
};
//helper function to find emails
const findUserByEmail = function(email) {
  for(const userID in users) { //userID is the id random
    const user = users[userID];
      if(user.email !== email) {
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
  const templateVars = { urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render('urls_index', templateVars);
});

// http://localhost:8080/urls/news -> webpage showing the textbox to input a new URL and using username stored in cookies
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('urls_new', templateVars);
});

// random string 6 characters, alphanumeric, lower and upper case
const generateRandomString = function() {
  const randomString = Math.random().toString(36).substring(2,8);
  return randomString;
};

// create a new short URL and redirect the user to /urls page, with shortURL and longURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
});

app.get('/u/:shortURL', (req, res) => {
  //if(urlDatabase.hasOwnProperty(req.params.shortURL)) {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
  //} else { }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL],
    user: users[req.cookies['user_id']]
  };
  res.render('urls_show', templateVars);
});

//delete a set shortURL and longURL
app.post('/urls/:shortURL/delete', (req, res)=> {
  const shortURL = req.params.shortURL;
  //const longURL = urlDatabase[shortURL];
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//edit a longURL
app.post('/urls/:shortURL/edit', (req, res)=> { // from server-side
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});

// input username login and storing in cookies
app.post('/login', (req, res)=> {
  
  // const username = req.body.username;
  const username = res.cookie('username', req.body.username); //switch cookie - username for cookie - user id
  res.redirect('/urls');
});

// username logout and storing in cookies
app.post('/logout', (req, res)=> { // username
  res.clearCookie('username');
  res.redirect('/urls');
});

//creating a register page with email and password
app.get('/register', (req, res) => {
  res.render('urls_regUser')
})

//creating a register page with email and password
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: email,
    password: password
  };
  if (!email || !password) { //avoiding empty emails or empty emails
    res.status(400).send('Hey! email or password can not be empty!');
  }
  const user = findUserByEmail(email); //calling the helper function
    if (user) { // user.email === email, return user
      return res.status(400).send('Ops! An user with same email already exists!');
    }
  res.cookie('user_id', users[id].id); //user.id = id inside the users[id] stored in the cookie
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
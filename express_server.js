const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); //library that converts request body from a buffer to a string. 
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => { 
  const templateVars = { urls: urlDatabase };  // we can use urlDatabase instead templateVars on line 18 as well
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2,8);
  return randomString;
};
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString() // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  //if(urlDatabase.hasOwnProperty(req.params.shortURL)) {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
  //} else { }
});
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = { shortURL: req.params.shortURL, longURL:
  urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
  });
app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase); // print the object urlDatabase
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); //World - bold as html 
});
app.post('/urls/:shortURL/delete', (req, res)=> {
  const shortURL = req.params.shortURL;
  //const longURL = urlDatabase[shortURL];
  delete urlDatabase[shortURL];
  res.redirect('/urls')
});
// app.get('/urls/:shortURL', (req, res)=> { //from client side i dont need this because it is working on before
//    res.redirect('/urls:shortURL')
// });

app.post('/urls/:shortURL/edit', (req, res)=> { // from server-side
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});
app.post('/login', (req, res)=> { // username
  const username = req.body.username;
  res.cookie('username', username);
  console.log(username)
  res.redirect('/urls');
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
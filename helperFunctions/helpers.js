// random string 6 characters, alphanumeric, lower and upper case
const generateRandomString = function() {
  const randomString = Math.random().toString(36).substring(2,8);
  return randomString;
};

//helper function to find if an emails exists and return an user
const getUserByEmail = function(email, users) {
  for (const userID in users) { //userID is the id random
    const user = users[userID];
    if (email === user.email) {
      return users[userID];
    }
  }
  return;
};

// create a new short URL and redirect the user to /urls page, with shortURL and longURL
const urlsForUser = function(id, urlDatabase) {
  let newDatabase = {};
  for (const shorts in urlDatabase) {
    const newShort = urlDatabase[shorts];
    if (newShort.userID === id) {
      newDatabase[shorts] = urlDatabase[shorts];
    }
  }
  return {err:null, newDatabase};
};

module.exports = { getUserByEmail, generateRandomString , urlsForUser};
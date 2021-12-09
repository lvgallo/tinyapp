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
let newDatabase = {};
for (const shorts in urlDatabase){
		if(urlDatabase[shorts].userID === "ga7399"){
			newDatabase[shorts]=urlDatabase[shorts]
			}
			}
			
			console.log(newDatabase);

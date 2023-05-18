const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

const alphaNumericArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const generateRandomString = () => {
  let randStr = '';
  while (randStr.length < 6) {
    const randNum = Math.floor(Math.random() * alphaNumericArr.length);
    randStr += alphaNumericArr[randNum];
  }
  return randStr;
};

const checkIfUserExists = (userEmail, users) => {
  for (const user in users) {
    if (users[user].email === userEmail) return true;
  }
  return false;
};

const checkIfPasswordsMatch = (userPassword, userEmail) => {
  let hashedPassword;
  for (const user in users) {
    if (users[user].email === userEmail) hashedPassword = users[user].password;
  }
  console.log(hashedPassword)
  if (bcrypt.compareSync(userPassword, hashedPassword)) return true;
  return false;
};

const returnUsersId = (userEmail) => {
  for (const user in users) {
    if (users[user].email === userEmail) return users[user].id;
  }
};

const urlsForUser = (id) => {
  const filteredObj = {};

  for (const obj in urlDatabase) {
    if (urlDatabase[obj].userID === id) filteredObj[obj] = urlDatabase[obj];
  }
  
  return filteredObj;
};

//Enabling middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

//Database objects
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: bcrypt.hashSync("1111", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: bcrypt.hashSync("2222", 10),
  },
};

// ----------------- Routes ----------------- //
// ----------------- Homepage ----------------- //

app.get("/", (req, res) => {
  res.send("Hello!");
});

// ----------------- Login/Logout ----------------- //

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  
  if (userId && users[userId]) return res.redirect("/urls");

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const userEmail =  req.body.email;
  const userPassword = req.body.password;
  if (!checkIfUserExists(userEmail, users)) return res.status(403).send("This email doesn't exist please register an account");
  if (!checkIfPasswordsMatch(userPassword, userEmail)) return res.status(403).send("The password does not match the existing one.");

  const userId = returnUsersId(userEmail);

  req.session.user_id = userId;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// ----------------- Register ----------------- //

app.get("/register", (req, res) => {
  const userId = req.session.user_id;

  if (userId && users[userId]) return res.redirect("/urls");

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  if (userEmail === "" || userPass === "") return res.status(400).send("Missing email or password");
  if (checkIfUserExists(userEmail, users)) return res.status(400).send("This email already exists in the database.");

  const usersRandomId = generateRandomString();
  users[usersRandomId] = {
    id: usersRandomId,
    email: userEmail,
    password: bcrypt.hashSync(userPass, 10),
  };

  req.session.user_id = usersRandomId;
  res.redirect("/urls");
});

// ----------------- URLS ----------------- //

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const filteredObj = urlsForUser(userId);

  const templateVars = {
    user: users[userId],
    urls: filteredObj,
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) return res.send("You can not create new short URLs unless you are logged in");

  const key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect(`/urls/${key}`);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) return res.redirect("/login");

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) return res.status(401).send("Please log in to view URL page.");
  if (urlDatabase[req.params.id] === undefined) return res.status(404).send("This URL does not exist in the database.");
  if (userId !== urlDatabase[req.params.id].userID) return res.status(401).send("You do not own this URL, please create your own.");

  const templateVars = {
    user: users[userId],
    short: req.params.id,
    long: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) return res.status(400).send("Please log in, in order to create shortened URLS");
  if (urlDatabase[req.params.id] === undefined) return res.status(404).send("This url does not exist");
  if (urlDatabase[req.params.id].userID !== userId) return res.status(401).send("You do not own this URL, so you cannot access it.");

  urlDatabase[req.params.id].longURL = req.body.longURLEdit;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) return res.status(400).send("Please log in, in order to delete URL");
  if (urlDatabase[req.params.id] === undefined) return res.status(404).send("This url does not exist");
  if (urlDatabase[req.params.id].userID !== userId) return res.status(401).send("You do not own this URL, so you cannot delete it.");

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  for (const url in urlDatabase) {
    if (url === req.params.id) {
      const longURL = urlDatabase[req.params.id].longURL;
      return res.redirect(longURL);
    }
  }
  
  res.status(404).send("This URL does not exist in our database");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});
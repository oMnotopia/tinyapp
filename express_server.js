const { getUserByEmail, urlsForUser, getCurrentDate, generateRandomString } = require("./helpers");
const express = require("express");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

//Enabling middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(methodOverride('_method'));
app.use(morgan('common'));
app.set("view engine", "ejs");

//Database objects
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    timesVisited: 0,
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    timesVisited: 0,
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
  const userId = req.session.userId;
  if (userId) return res.redirect("/urls");
  res.redirect("/login");
});

// ----------------- Login/Logout ----------------- //

app.get("/login", (req, res) => {
  const userId = req.session.userId;
  //Check if user exists and cookie of user exists
  if (userId && users[userId]) return res.redirect("/urls");

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const userEmail =  req.body.email;
  const userPassword = req.body.password;
  const userId = getUserByEmail(userEmail, users);
  let hashedPassword;

  //Filters for no email, or bad password associated to email
  if (!userId) return res.status(403).send(`<h1>This email doesn't exist please register an account</h1>`);
  if (users[userId].email === userEmail) hashedPassword = users[userId].password;
  if (!bcrypt.compareSync(userPassword, hashedPassword)) return res.status(403).send(`<h1>The password does not match the existing one.</h1>`);

  req.session.userId = userId;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// ----------------- Register ----------------- //

app.get("/register", (req, res) => {
  const userId = req.session.userId;
  //Check if user exists and cookie of user exists
  if (userId && users[userId]) return res.redirect("/urls");

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  //Filters for not inputting email/password or existing email
  if (userEmail === "" || userPass === "") return res.status(400).send(`<h1>Missing email or password</h1>`);
  if (getUserByEmail(userEmail, users)) return res.status(400).send(`<h1>This email already exists in the database.</h1>`);

  //Create new user object for users database
  const usersRandomId = generateRandomString();
  users[usersRandomId] = {
    id: usersRandomId,
    email: userEmail,
    password: bcrypt.hashSync(userPass, 10),
  };

  req.session.userId = usersRandomId;
  res.redirect("/urls");
});

// ----------------- URLS ----------------- //

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const filteredObj = urlsForUser(userId, urlDatabase);

  const templateVars = {
    user: users[userId],
    urls: filteredObj,
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).send(`<h1>You can not create new short URLs unless you are logged in</h1>`);

  const key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: userId,
    timesVisited: 0,
    dateCreated: "",
  };
  res.redirect(`/urls/${key}`);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.redirect("/login");


  const templateVars = {
    user: users[userId],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.id;
  //Filters for not being logged in, no existing URL, and not owning the URL being used.
  if (!userId) return res.status(401).send(`<h1>Please log in, in order to edit URLS</h1>`);
  if (urlDatabase[shortURL] === undefined) return res.status(404).send(`<h1>This URL does not exist in the database.</h1>`);
  if (userId !== urlDatabase[shortURL].userID) return res.status(401).send(`<h1>You do not own this URL, please create your own.</h1>`);

  //If it doesnt already exist make a creation date and add it to the item in the urlDatabase object.
  if (!urlDatabase[shortURL]["dateCreated"]) {
    urlDatabase[shortURL]["dateCreated"] = getCurrentDate();
  }

  const templateVars = {
    user: users[userId],
    short: shortURL,
    long: urlDatabase[shortURL].longURL,
    timesVisited: urlDatabase[shortURL].timesVisited,
    dateCreated: urlDatabase[shortURL].dateCreated,
  };
  res.render("urls_show", templateVars);
});

app.put("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  //Filters for not being logged in, no existing URL, and not owning the URL being used.
  if (!userId) return res.status(401).send(`<h1>Please log in, in order to create shortened URLS</h1>`);
  if (urlDatabase[req.params.id] === undefined) return res.status(404).send(`<h1>This url does not exist</h1>`);
  if (urlDatabase[req.params.id].userID !== userId) return res.status(401).send(`<h1>You do not own this URL, so you cannot access it.</h1>`);

  urlDatabase[req.params.id].longURL = req.body.longURLEdit;
  res.redirect("/urls");
});

app.delete("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
  //Filters for not being logged in, no existing URL, and not owning the URL being used.
  if (!userId) return res.status(401).send(`<h1>Please log in, in order to delete URL</h1>`);
  if (urlDatabase[req.params.id] === undefined) return res.status(404).send(`<h1>This url does not exist</h1>`);
  if (urlDatabase[req.params.id].userID !== userId) return res.status(401).send(`<h1>You do not own this URL, so you cannot delete it.</h1>`);

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  //Filter for non-existant url in database.
  if (urlDatabase[req.params.id] === undefined) return res.status(404).send(`<h1>This URL does not exist in our database</h1>`);

  urlDatabase[req.params.id].timesVisited++;
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});
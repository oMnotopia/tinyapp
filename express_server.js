const express = require("express");
const cookieParser = require('cookie-parser');
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

const checkIfUserExists = (userEmail) => {
  for (const user in users) {
    if (users[user].email === userEmail) {
      return true;
    }
  }
  return false;
};

//Enabling middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

//Database objects
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// ----------------- Login/Logout ----------------- //

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user.email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// ----------------- Register ----------------- //

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  if (userEmail === "" || userPass === "") {
    return res.status(400).send("Missing email or password");
  }

  if (checkIfUserExists(userEmail)) {
    return res.status(400).send("This email already exists in the database.");
  }

  const usersRandomId = generateRandomString();
  users[usersRandomId] = {
    id: usersRandomId,
    email: userEmail,
    password: userPass,
  };
  res.cookie("user_id", usersRandomId);
  res.redirect("/urls");
});

// ----------------- URLS ----------------- //

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
    short: req.params.id,
    long: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURLEdit;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});
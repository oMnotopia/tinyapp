const getUserByEmail = (userEmail, users) => {
  for (const user in users) {
    if (users[user].email === userEmail) return users[user].id;
  }
};

const urlsForUser = (id, urlDatabase) => {
  const filteredObj = {};

  for (const obj in urlDatabase) {
    if (urlDatabase[obj].userID === id) filteredObj[obj] = urlDatabase[obj];
  }
  
  return filteredObj;
};

const getCurrentDate = () => {
  const monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

  const newDate = new Date();
  const formattedDate = `${monthNames[newDate.getMonth()]} ${newDate.getDate()}, ${newDate.getFullYear()}`;
  return formattedDate;
};

const generateRandomString = () => {
  const alphaNumericArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  let randStr = '';
  while (randStr.length < 6) {
    const randNum = Math.floor(Math.random() * alphaNumericArr.length);
    randStr += alphaNumericArr[randNum];
  }
  return randStr;
};

module.exports = { getUserByEmail, urlsForUser, getCurrentDate, generateRandomString };
const checkIfUserExists = (userEmail, users) => {
  for (const user in users) {
    if (users[user].email === userEmail) return true;
  }
  return false;
};

module.exports = { checkIfUserExists };
const { assert } = require('chai');

const { getUserByEmail, urlsForUser, generateRandomString, getCurrentDate } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.equal(user, expectedUserID);
  });

  it('should return undefined if user email doesn\'t exist in database', () => {
    const user = getUserByEmail("user34@example.com", testUsers);
    const expectedUserID = undefined;

    assert.equal(user, expectedUserID);
  });

  it('should return undefined if user does not include an email parameter', () => {
    const user = getUserByEmail("", testUsers);
    const expectedUserID = undefined;

    assert.equal(user, expectedUserID);
  });
});

describe('urlsForUser', () => {
  it('should return an object', () => {
    const urlObject = urlsForUser("aJ48lW", testDatabase);

    assert.isObject(urlObject);
  });

  it('should return an object even if parameters are undefined', () => {
    const urlObject = urlsForUser(undefined, undefined);

    assert.isObject(urlObject);
  });

});

describe('generateRandomString', () => {
  it('should return a string', () => {
    const randStr = generateRandomString();

    assert.isString(randStr);
  });

  it('should return a string of 6 characters', () => {
    const randStrLength = generateRandomString().length;

    assert.equal(randStrLength, 6);
  });
});


describe('getCurrentDate', () => {
  it('should return a string', () => {
    const dateStr = getCurrentDate();

    assert.isString(dateStr);
  });
});
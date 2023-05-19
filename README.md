# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). Allows registered users to create and share shortened links to anyone.

## Features

Users that register an account can create and share links. Every link they create becomes visible in a table where they can view the shortened URL, long URL, date it was created, and number of page visits. They also have the ability to modify and delete individual links.

## Final Product

!["Register an account"](https://github.com/oMnotopia/tinyapp/blob/main/docs/register.png?raw=true)
!["Login to account"](https://github.com/oMnotopia/tinyapp/blob/main/docs/login.png?raw=true)
!["Create URL"](https://github.com/oMnotopia/tinyapp/blob/main/docs/create-url.png?raw=true)
!["Edit a URL"](https://github.com/oMnotopia/tinyapp/blob/main/docs/url-edit.png?raw=true)
!["List of URLs"](https://github.com/oMnotopia/tinyapp/blob/main/docs/urls.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- method-override
- morgan

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
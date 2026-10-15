# ICSI 418Y - Programming Assignment 3

## About

This project is an updated version of PA2. It allows users to create projects and manage project members.

## Features

- Sign up and log in
- Create and view projects
- Choose a project lead
- Add and remove project members
- Prevent duplicate members
- Prevent removing the project lead

## Tools Used

- React
- Node.js and Express
- MongoDB Atlas
- Mongoose

## How to Run

1. Open the project in VS Code.
2. Open a terminal and go to the `server` folder.
3. Run `npm install`.
4. Add a `.env` file with your `MONGO_URI` connection string.
5. Run `node server.js`.
6. Open another terminal and go to the `client` folder.
7. Run `npm install`, then `npm run dev`.
8. Open `http://localhost:5173` in your browser.

## Database

The application uses three collections:

- **users** - Stores user accounts.
- **projects** - Stores project information.
- **projectmemberships** - Connects users to projects using MongoDB ObjectIds.

## Author

Armaan Nasri
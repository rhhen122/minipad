# minipad Server Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
yarn install
```

### 2. Set Up Environment Variables
Edit the `.env` file with your configuration:
- `MONGODB_URI`: Your MongoDB connection string (local or remote)
- `JWT_SECRET`: A secure secret key for JWT tokens (change this!)
- `PORT`: Server port (default: 3000)

### 3. Start the Server
```bash
yarn start
```

The server will run on `http://localhost:3000`

### 4. Open in Browser
Open `index.html` in your browser. The app will be available with full authentication and note-taking features.

## Features

### Authentication
- **Register**: Create a new account with username and password
- **Login**: Sign in to access your notes
- **Secure Tokens**: JWT-based authentication

### Notes Management
- **Create Notes**: Add new notes with title and content
- **Edit Notes**: Click on any note to edit it
- **Delete Notes**: Remove notes you don't need
- **Cloud Sync**: All notes are stored in MongoDB

### Local Features
- **Text Editor**: Write notes directly in the textarea
- **Auto-save**: Content is automatically saved to cookies
- **Theme Toggle**: Switch between light and dark mode
- **Text Size Control**: Adjust font size with the controls
- **Text Alignment**: Toggle between left and right alignment
- **Export/Import**: Download and upload text files

## Database Setup

### Option 1: Local MongoDB
Install MongoDB and run it locally:
```bash
mongod
```

In `.env`, use:
```
MONGODB_URI=mongodb://localhost:27017
```

### Option 2: MongoDB Atlas (Cloud)
Create a free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)

Update `.env` with your connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/minipad
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login and get JWT token

### Notes (Requires Authentication)
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Troubleshooting

### Connection Error
Make sure:
1. Node.js server is running (`yarn start`)
2. MongoDB is running (local or cloud)
3. `.env` file is correctly configured
4. Port 3000 is not blocked

### "Server not running" message
The browser is trying to connect to `http://localhost:3000`. Make sure:
1. You've started the server with `yarn start`
2. CORS is properly configured
3. No firewall is blocking port 3000

### Notes not saving
- Check MongoDB connection in `.env`
- Make sure you're logged in
- Check browser console for error messages

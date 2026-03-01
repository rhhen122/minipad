import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('.'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';
const PORT = process.env.PORT || 3000;

const client = new MongoClient(MONGODB_URI);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    await connectDB();
    const db = client.db('minipad');

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.collection('users').insertOne({
      username,
      password: hashed,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    await connectDB();
    const db = client.db('minipad');

    const user = await db.collection('users').findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id.toString(), username: user.username }, JWT_SECRET);
    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all notes for authenticated user
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    await connectDB();
    const db = client.db('minipad');

    const notes = await db.collection('notes').find({
      userId: req.user.id
    }).sort({ createdAt: -1 }).toArray();

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a new note
app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    await connectDB();
    const db = client.db('minipad');

    const result = await db.collection('notes').insertOne({
      userId: req.user.id,
      username: req.user.username,
      title: title || 'Untitled',
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({ 
      id: result.insertedId.toString(),
      message: 'Note created'
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { content, title } = req.body;
    const noteId = req.params.id;

    await connectDB();
    const db = client.db('minipad');
    const { ObjectId } = await import('mongodb');

    const result = await db.collection('notes').updateOne(
      { _id: new ObjectId(noteId), userId: req.user.id },
      {
        $set: {
          content,
          title: title || 'Untitled',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note updated' });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const noteId = req.params.id;

    await connectDB();
    const db = client.db('minipad');
    const { ObjectId } = await import('mongodb');

    const result = await db.collection('notes').deleteOne({
      _id: new ObjectId(noteId),
      userId: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});

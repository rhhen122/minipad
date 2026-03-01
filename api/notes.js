import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('minipad');

    // GET all notes
    if (req.method === 'GET') {
      const notes = await db.collection('notes').find({
        userId: user.id
      }).sort({ createdAt: -1 }).toArray();

      await client.close();
      return res.json(notes);
    }

    // POST create note
    if (req.method === 'POST') {
      const { content, title } = req.body;

      if (!content) {
        await client.close();
        return res.status(400).json({ error: 'Content required' });
      }

      const result = await db.collection('notes').insertOne({
        userId: user.id,
        username: user.username,
        title: title || 'Untitled',
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await client.close();
      return res.status(201).json({ 
        id: result.insertedId.toString(),
        message: 'Note created'
      });
    }

    // PUT update note
    if (req.method === 'PUT') {
      const { content, title } = req.body;
      const noteId = req.query.id;

      if (!noteId || !content) {
        await client.close();
        return res.status(400).json({ error: 'Note ID and content required' });
      }

      const result = await db.collection('notes').updateOne(
        { _id: new ObjectId(noteId), userId: user.id },
        {
          $set: {
            content,
            title: title || 'Untitled',
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        await client.close();
        return res.status(404).json({ error: 'Note not found' });
      }

      await client.close();
      return res.json({ message: 'Note updated' });
    }

    // DELETE note
    if (req.method === 'DELETE') {
      const noteId = req.query.id;

      if (!noteId) {
        await client.close();
        return res.status(400).json({ error: 'Note ID required' });
      }

      const result = await db.collection('notes').deleteOne({
        _id: new ObjectId(noteId),
        userId: user.id
      });

      if (result.deletedCount === 0) {
        await client.close();
        return res.status(404).json({ error: 'Note not found' });
      }

      await client.close();
      return res.json({ message: 'Note deleted' });
    }

    await client.close();
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

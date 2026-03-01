import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).end();

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  await client.connect();
  const db = client.db("minipad");

  if (req.method === "GET") {
    const notes = await db.collection("notes").find({
      userId: decoded.id
    }).toArray();

    return res.json(notes);
  }

  if (req.method === "POST") {
    const { content } = req.body;

    await db.collection("notes").insertOne({
      userId: decoded.id,
      content
    });

    return res.status(200).end();
  }
}
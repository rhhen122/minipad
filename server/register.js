import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;

  await client.connect();
  const db = client.db("minipad");

  const hashed = await bcrypt.hash(password, 10);

  await db.collection("users").insertOne({
    username,
    password: hashed
  });

  res.status(200).json({ message: "User created" });
}
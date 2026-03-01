# Quick Vercel Deployment Checklist

## 1️⃣ MongoDB Setup (2 minutes)
- [ ] Create MongoDB Atlas account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- [ ] Create a free M0 cluster
- [ ] Create a database user
- [ ] Copy your connection string: `mongodb+srv://username:password@...`

## 2️⃣ Generate JWT Secret
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output - you'll need it for Vercel.

## 3️⃣ Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## 4️⃣ Connect to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Click **"Deploy"**

## 5️⃣ Add Environment Variables in Vercel
1. Project Dashboard → **Settings** → **Environment Variables**
2. Add these variables:
   - **MONGODB_URI**: Your MongoDB connection string
   - **JWT_SECRET**: The generated secret from step 2
3. Click **"Save"**

## 6️⃣ Redeploy
1. Go to **Deployments**
2. Click the three dots on the latest deployment
3. Select **"Redeploy"**
4. Wait for deployment to complete ✅

## 7️⃣ Test It Out
1. Visit your Vercel URL (copy from deployment page)
2. Click the logo icon
3. Register an account
4. Create a test note
5. Everything should work! 🎉

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check MongoDB connection string in Vercel variables |
| "Invalid secret" | Verify JWT_SECRET matches what you generated |
| "404 on /api/" | Ensure vercel.json is correct, redeploy |
| "Notes not saving" | Check MongoDB network access is set to 0.0.0.0/0 |

---

## Files Structure Explanation

```
minipad/
├── api/                    # ← Vercel serverless functions
│   ├── register.js        # User registration
│   ├── login.js           # User login
│   └── notes.js           # Note CRUD operations
├── script/main.js         # ← Auto-detects prod vs local
├── vercel.json            # ← Deployment config
├── .env                   # ← Local development (don't commit)
└── .env.example           # ← Reference file
```

The app automatically uses `/api` endpoints in production and `localhost:3000/api` for local development.

---

## Need Help?
- [Full Deployment Guide](VERCEL_DEPLOYMENT.md)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Help](https://docs.atlas.mongodb.com/)

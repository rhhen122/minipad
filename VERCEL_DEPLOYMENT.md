# Vercel Deployment Guide for minipad

## Prerequisites
- Vercel account (free at [vercel.com](https://vercel.com))
- MongoDB Atlas account (free tier at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas))
- Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (remember username/password)
4. Get your connection string in format: 
   ```
   mongodb+srv://username:password@cluster.mongodb.net/minipad
   ```

---

## Step 2: Push Your Code to GitHub

```bash
git add .
git commit -m "Setup for Vercel deployment"
git push origin main
```

---

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and select your GitHub repository.

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect settings
5. Click "Deploy"

---

## Step 4: Configure Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A secure random string (e.g., generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |

4. Click "Save"

---

## Step 5: Redeploy

After adding environment variables:
1. Go to **Deployments**
2. Click the three dots on the latest deployment
3. Select "Redeploy"

---

## Troubleshooting

### "API not found" or 404 errors
- Make sure the `/api` folder exists
- Check that environment variables are set in Vercel
- Verify your Vercel URL in the app's network requests (DevTools)

### "Unauthorized" or auth errors
- Verify `JWT_SECRET` is set correctly in Vercel
- Check MongoDB connection string is correct
- Ensure MongoDB network access is allowed from anywhere (0.0.0.0/0)

### Notes not saving
1. Check browser console for errors
2. Verify MongoDB Atlas cluster is running
3. Check Vercel function logs:
   - Dashboard → Deployments → Click latest → Functions
   - Select the failing function to see logs

### CORS errors
- The API functions already have CORS enabled
- If still having issues, check that requests are going to your Vercel URL

---

## Testing Your Deployment

1. Visit your Vercel URL (e.g., `https://minipad.vercel.app`)
2. Click the logo icon
3. Register a new account
4. Create a test note
5. Refresh the page - note should still be there
6. Check Vercel logs if anything fails

---

## Security Notes

- ✅ Never commit `.env` file to Git (it's in `.gitignore`)
- ✅ Store `JWT_SECRET` as a secure environment variable in Vercel
- ✅ Keep your MongoDB password in Atlas environment variable only
- ✅ Restrict MongoDB network access if possible (whitelist IPs)

---

## Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [MongoDB Atlas Connection](https://docs.atlas.mongodb.com/driver-connection)
- [Serverless Functions with Vercel](https://vercel.com/docs/concepts/functions/serverless-functions)

---

## API Endpoints on Vercel

When deployed, your API endpoints will be:

- `POST /api/register` - Register user
- `POST /api/login` - Login user  
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create note
- `PUT /api/notes?id=<noteId>` - Update note
- `DELETE /api/notes?id=<noteId>` - Delete note

The frontend automatically detects production and uses the correct URLs.

---

## Local Development

To test locally before deploying:

```bash
# Make sure MongoDB is running locally
# Create/update .env with:
# MONGODB_URI=mongodb://localhost:27017
# JWT_SECRET=dev-secret-key

yarn start
# Visit http://localhost:3000
```

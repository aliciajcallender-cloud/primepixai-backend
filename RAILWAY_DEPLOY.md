# 🚀 Deploy to Railway - Quick Guide

## Step 1: Upload to GitHub

1. Go to your GitHub repository: `primepixai-backend`
2. Upload these files:
   - `primepixai-backend.js`
   - `package.json`
   - `.gitignore`
   - `.env.example`
   - `RAILWAY_DEPLOY.md` (this file)

## Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `primepixai-backend`
5. Railway will start deploying

## Step 3: Add Environment Variables

Once deployed, click on your project, then:

1. Go to **"Variables"** tab
2. Click **"Add Variable"**
3. Add these:

**Required:**
```
STRIPE_SECRET_KEY = sk_test_YOUR_STRIPE_SECRET_KEY_HERE
```
(Use the key from your Stripe dashboard - it starts with `sk_test_`)

**Optional (for later):**
```
STRIPE_WEBHOOK_SECRET = (get from Stripe dashboard after deployment)
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-gmail-app-password
```

## Step 4: Get Your Server URL

1. Go to **"Settings"** tab
2. Find **"Domains"** section
3. Copy the URL (looks like: `https://primepixai-backend.up.railway.app`)

## Step 5: Update Your Website

1. Go to your GitHub repository: `primepixai`
2. Edit `index.html`
3. Find line 628 (around there)
4. Change:
   ```javascript
   const BACKEND_URL = '';
   ```
   To:
   ```javascript
   const BACKEND_URL = 'https://your-railway-url-here';
   ```
5. Commit the change
6. Vercel will auto-deploy the update

## ✅ Done!

Your payment system is now fully automated!

Test with Stripe test card: `4242 4242 4242 4242`

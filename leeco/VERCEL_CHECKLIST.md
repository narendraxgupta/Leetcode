# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Setup (Completed)

### Configuration Files
- [x] `vercel.json` - Vercel configuration created
- [x] `.vercelignore` - Ignore file created
- [x] `server.js` - Updated to export Express app for serverless
- [x] `package.json` - Added build scripts
- [x] `.gitignore` - Updated to exclude `.vercel` folder
- [x] `README.md` - Updated with deployment info
- [x] `README_DEPLOYMENT.md` - Comprehensive deployment guide created

### Code Changes
- [x] Server exports `module.exports = app`
- [x] Server only listens when NOT in Vercel environment
- [x] All routes configured in `vercel.json`
- [x] Static file serving configured

---

## 📋 Deployment Steps

### Step 1: MongoDB Atlas Configuration
```
□ Log in to MongoDB Atlas
□ Navigate to: Network Access → IP Access List
□ Click "Add IP Address"
□ Select "Allow Access from Anywhere" (0.0.0.0/0)
□ Click "Confirm"
□ Copy your connection string (replace <password> with your actual password)
```

### Step 2: Gmail App Password Setup
```
□ Enable 2-Factor Authentication on Google Account
□ Go to: https://myaccount.google.com/apppasswords
□ Select: App = "Mail", Device = "Other (Custom name)"
□ Enter name: "LeetCode Vercel"
□ Click "Generate"
□ Copy the 16-character password
□ Store it securely for Step 4
```

### Step 3: Push to GitHub (if not already)
```bash
□ git add .
□ git commit -m "Configure for Vercel deployment"
□ git push origin main
```

### Step 4: Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)
```
□ Go to: https://vercel.com/dashboard
□ Click: "Add New..." → "Project"
□ Click: "Import" next to your repository
□ Configure Project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: (leave empty)
□ Click "Deploy"
```

#### Option B: Vercel CLI
```bash
□ npm install -g vercel
□ vercel login
□ vercel
□ Follow prompts
□ vercel --prod
```

### Step 5: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```
Variable Name          | Value                                    | Environment
-----------------------|------------------------------------------|-------------
MONGODB_URI            | mongodb+srv://user:pass@cluster...       | Production
JWT_SECRET             | your-super-secret-jwt-key-here          | Production
EMAIL_USER             | your-email@gmail.com                    | Production
EMAIL_PASSWORD         | your-16-char-app-password               | Production
CLIENT_URL             | https://your-project.vercel.app         | Production
NODE_ENV               | production                              | Production
```

**Important Notes:**
- JWT_SECRET: Use a strong random string (at least 32 characters)
  - Generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- EMAIL_PASSWORD: Use the Gmail App Password (not your regular password)
- CLIENT_URL: Will be provided after first deployment, then update this variable

### Step 6: Redeploy After Adding Environment Variables
```
□ Go to: Deployments tab
□ Click: "..." on latest deployment
□ Click: "Redeploy"
□ Wait for deployment to complete
```

### Step 7: Test Your Deployment
```
□ Visit: https://your-project.vercel.app
□ Test: Registration (create account)
□ Test: Login
□ Test: Password reset (check email)
□ Test: Mark problem as solved
□ Test: Add notes to a problem
□ Test: Bookmark a problem
□ Test: View analytics dashboard
□ Test: Add code snippet
□ Test: Custom background
□ Test: Profile picture change
```

---

## 🔍 Verification Commands

### Check if deployment is ready:
```bash
# Verify vercel.json exists and is valid
cat vercel.json

# Verify environment variables template exists
cat .env.example

# Check if server exports correctly
node -c server.js

# Test local server still works
npm start
```

---

## 🐛 Troubleshooting

### Issue: Build Fails
**Solution:**
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Issue: 502 Bad Gateway
**Solution:**
- Check MongoDB connection string in environment variables
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check Vercel function logs for errors

### Issue: Email Not Sending
**Solution:**
- Verify EMAIL_USER is correct
- Ensure using Gmail App Password (not regular password)
- Check 2FA is enabled on Google Account
- Test email credentials locally first

### Issue: JWT Authentication Fails
**Solution:**
- Verify JWT_SECRET is set in Vercel environment variables
- Check CLIENT_URL matches your Vercel deployment URL
- Clear browser cache and cookies

### Issue: Static Files Not Loading
**Solution:**
- Check `vercel.json` routes configuration
- Verify file paths are correct
- Check browser console for 404 errors

---

## 📊 Post-Deployment

### Monitor Your App
```
□ Set up Vercel Analytics
□ Enable Error Tracking in Vercel
□ Monitor MongoDB Atlas metrics
□ Set up email alerts for deployment failures
```

### Custom Domain (Optional)
```
□ Go to: Vercel Dashboard → Settings → Domains
□ Click: "Add"
□ Enter your domain
□ Update DNS records as instructed
□ Update CLIENT_URL environment variable
□ Redeploy
```

### Performance Optimization
```
□ Enable Vercel Edge Network
□ Set up proper caching headers
□ Monitor function execution time
□ Optimize database queries if needed
```

---

## 📝 Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Vercel Documentation**: https://vercel.com/docs
- **Support**: https://vercel.com/support

---

## ✅ Final Checklist

```
□ MongoDB Atlas configured (IP whitelist)
□ Gmail App Password generated
□ Code pushed to GitHub
□ Vercel project created
□ Environment variables configured
□ First deployment successful
□ CLIENT_URL updated with actual Vercel URL
□ Redeployed after URL update
□ All features tested and working
□ Documentation updated with live URL
```

---

**Your project is now live on Vercel! 🎉**

Share your deployment URL: `https://your-project.vercel.app`

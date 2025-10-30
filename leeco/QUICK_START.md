# 🚀 Quick Start - Deploy to Vercel in 5 Minutes

## Prerequisites
✅ GitHub account  
✅ Vercel account (free)  
✅ MongoDB Atlas account (free)  
✅ Gmail account  

---

## Step 1: MongoDB Setup (2 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free cluster (if you don't have one)
3. Click **"Network Access"** → **"Add IP Address"** → **"Allow Access from Anywhere"** → **Confirm**
4. Click **"Database Access"** → Create a user with password
5. Click **"Connect"** → **"Connect your application"** → Copy connection string
6. Replace `<password>` in connection string with your actual password
7. **Save this connection string** - you'll need it in Step 4

---

## Step 2: Gmail App Password (2 minutes)

1. Enable [2-Factor Authentication](https://myaccount.google.com/security) on your Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Select: **Mail** → **Other (Custom)** → Enter "LeetCode Vercel"
4. Click **Generate**
5. **Copy the 16-character password** - you'll need it in Step 4

---

## Step 3: Push to GitHub (30 seconds)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

## Step 4: Deploy to Vercel (1 minute)

### Click this button:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Or manually:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your repository
4. Click **"Deploy"**

---

## Step 5: Add Environment Variables (1 minute)

After deployment completes:

1. Go to: **Settings** → **Environment Variables**
2. Add these variables (one by one):

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `MONGODB_URI` | `mongodb+srv://...` | From Step 1 |
| `JWT_SECRET` | Generate below ⬇️ | See command below |
| `EMAIL_USER` | `your-email@gmail.com` | Your Gmail |
| `EMAIL_PASSWORD` | `16-char password` | From Step 2 |
| `CLIENT_URL` | `https://your-project.vercel.app` | From Vercel deployment |
| `NODE_ENV` | `production` | Type manually |

### Generate JWT_SECRET:
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use it as `JWT_SECRET`

---

## Step 6: Redeploy (30 seconds)

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for completion

---

## Step 7: Test Your App! 🎉

Visit your Vercel URL and test:
- ✅ Register a new account
- ✅ Login
- ✅ Mark problems as solved
- ✅ Add notes to problems
- ✅ Test password reset

---

## 🆘 Troubleshooting

### Can't connect to database?
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify `MONGODB_URI` has correct password
- Check MongoDB Atlas cluster is running

### Email not working?
- Verify 2FA is enabled on Google Account
- Use App Password, not regular password
- Check `EMAIL_USER` and `EMAIL_PASSWORD` are correct

### Still having issues?
- Check Vercel function logs: **Deployments** → Click deployment → **Functions** tab
- Check browser console for errors (F12)
- See detailed guide: [README_DEPLOYMENT.md](./README_DEPLOYMENT.md)

---

## 📋 Full Checklist

```
□ MongoDB Atlas configured with 0.0.0.0/0 whitelist
□ Gmail App Password generated
□ Code pushed to GitHub
□ Deployed to Vercel
□ All 6 environment variables added
□ Redeployed after adding variables
□ Tested registration and login
□ Tested password reset email
```

---

## 🎓 What's Next?

### Custom Domain
1. Go to: **Settings** → **Domains**
2. Add your domain
3. Update DNS records
4. Update `CLIENT_URL` environment variable
5. Redeploy

### Monitor Your App
- Enable Vercel Analytics
- Set up email alerts for errors
- Monitor MongoDB Atlas metrics

---

**That's it! Your LeetCode tracker is now live! 🚀**

Share your app: `https://your-project.vercel.app`

Need help? Check [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) for detailed instructions.

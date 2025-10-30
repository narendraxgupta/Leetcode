# Vercel Deployment Guide

## Prerequisites
1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli) installed (optional but recommended)
3. MongoDB Atlas database (already configured)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect settings

3. **Configure Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables, add:
   ```
   MONGODB_URI = your_mongodb_connection_string
   JWT_SECRET = your_jwt_secret_key
   EMAIL_USER = your_email@gmail.com
   EMAIL_PASSWORD = your_app_password
   CLIENT_URL = https://your-project.vercel.app
   NODE_ENV = production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASSWORD
   vercel env add CLIENT_URL
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Important Notes

### Environment Variables Required:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASSWORD` - Gmail app password (not regular password)
- `CLIENT_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)
- `NODE_ENV` - Set to "production"

### Gmail App Password Setup:
1. Enable 2-Factor Authentication on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Create an app password for "Mail"
4. Use this password in `EMAIL_PASSWORD` variable

### MongoDB Atlas Setup:
1. Go to MongoDB Atlas Dashboard
2. Navigate to: Network Access
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - **Important**: Vercel uses dynamic IPs, so you need to allow all IPs
5. Click "Confirm"

### Custom Domain (Optional):
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CLIENT_URL` environment variable with your custom domain

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure MongoDB Atlas allows connections from anywhere
- Review build logs in Vercel Dashboard

### 502 Error
- MongoDB connection issue - check MONGODB_URI
- Check MongoDB Atlas IP whitelist

### Email Not Sending
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Ensure you're using Gmail App Password, not regular password
- Check 2FA is enabled on Google Account

### API Routes Not Working
- Ensure `vercel.json` routes are configured correctly
- Check server.js exports the Express app: `module.exports = app`

## Post-Deployment

1. **Test Your App**
   - Visit your Vercel URL
   - Test login/register
   - Test password reset email
   - Test problem tracking features

2. **Monitor Performance**
   - Check Vercel Dashboard for analytics
   - Monitor MongoDB Atlas for database usage

3. **Set Up Alerts**
   - Enable email notifications in Vercel for deployment failures

## Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel list

# Remove deployment
vercel remove [deployment-url]

# View project settings
vercel env ls
```

## Support
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/

---
**Your app is now ready to deploy to Vercel!** 🚀

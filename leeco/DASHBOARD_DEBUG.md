# Dashboard Debugging Guide

## Steps to Fix "Failed to load dashboard data"

### 1. **Restart the Server**
Make sure to stop any existing server and restart it:

```powershell
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
cd leeco
npm start
```

### 2. **Check Browser Console**
Open browser console (F12) and look for errors when clicking Dashboard button.

Common errors and solutions:

#### Error: "Token: missing"
- **Problem**: Not logged in
- **Solution**: Login first, then try opening dashboard

#### Error: "HTTP error! status: 404"
- **Problem**: API endpoint not found
- **Solution**: Server needs to be restarted to load new routes

#### Error: "HTTP error! status: 401"
- **Problem**: Invalid or expired token
- **Solution**: Logout and login again

#### Error: "HTTP error! status: 500"
- **Problem**: Server error (check server console)
- **Solution**: Check server terminal for error messages

### 3. **Verify Server Routes**
Check that server console shows:
```
Server running on port 3000
MongoDB Connected
```

### 4. **Test the API Manually**
Open a new tab and try:
```
http://localhost:3000/api/progress/analytics
```
You should see an authentication error (401) - this means the route exists.

### 5. **Check Network Tab**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Click Dashboard button
4. Look for `/api/progress/analytics` request
5. Check the response

### 6. **Common Issues**

#### Dashboard button not visible
- Make sure you're logged in
- Check that `dashboard-btn` exists in HTML
- Verify `showUserInfo()` in auth.js is showing the button

#### No data showing
- You haven't solved any problems yet
- Try clicking "Mark Solved" on a few problems first
- Then open dashboard

#### Charts not rendering
- Check that Chart.js is loaded
- Look for Chart.js errors in console
- Verify canvas elements exist in dashboard modal

### 7. **Test Mark Solved Feature**
1. Login
2. Select a company (e.g., Google)
3. Select a duration (e.g., 6 months)
4. Click "Mark Solved" on a problem
5. Should see success notification
6. Then open Dashboard to see the problem counted

### 8. **Server Console Debugging**
Check server terminal for:
```
POST /api/progress/mark-solved 200
GET /api/progress/analytics 200
```

If you see 500 errors, there might be a database issue.

### 9. **MongoDB Connection**
Verify .env has correct MongoDB URI:
```
MONGODB_URI=mongodb+srv://...
```

### 10. **Clear Cache and Refresh**
Sometimes browser cache causes issues:
1. Ctrl+Shift+R (hard refresh)
2. Or clear site data in DevTools

## Quick Test Commands

### Test if server is running:
```powershell
curl http://localhost:3000/api/auth/me
```

### Check MongoDB connection:
Look for "MongoDB Connected" in server console

## Still Not Working?

Share these details:
1. Browser console error messages
2. Server console error messages
3. Network tab screenshot showing the API request/response
4. Are you logged in?
5. Have you marked any problems as solved?

# Company-wise LeetCode Website

This repository hosts the code for the Company-wise LeetCode Website, a tool that provides access to LeetCode interview questions from over 100 companies sorted by frequency and difficulty. The website categorizes questions based on their timeline (last 6 months, 1 year, or 2 years) and is based on data provided in the repo: [LeetCode Questions Company Wise](https://github.com/krishnadey30/LeetCode-Questions-CompanyWise.git).

## Features
- 🔐 **User Authentication** - Secure login/register with JWT tokens
- 🔑 **Password Reset** - Email-based password recovery
- 📊 **Progress Tracking** - Track solved problems across companies
- 📝 **Notes & Bookmarks** - Add notes and bookmark important problems
- 💾 **Code Snippets** - Save your solutions with syntax highlighting
- 🔄 **Revision Queue** - Spaced repetition system for problem revision
- 📈 **Analytics Dashboard** - Visualize your solving patterns and streaks
- 🎨 **Customizable UI** - Custom backgrounds and profile pictures
- 🔍 **Advanced Search** - Filter by difficulty, company, and timeline
- ✅ **Problem Tracking** - Mark problems as solved/unsolved

## Tech Stack
- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer (Gmail)
- **Deployment**: Vercel

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Gmail account (for email features)

### Installation
```bash
# Clone the repository
git clone https://github.com/narendraxgupta/Leetcode.git
cd leeco

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables in .env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
CLIENT_URL=http://localhost:3000

# Start the server
npm start
```

### Development Mode
```bash
npm run dev
```

Visit: `http://localhost:3000`

## Deployment

This project is configured for **Vercel** deployment.

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/narendraxgupta/Leetcode)

### Manual Deployment
See [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) for detailed deployment instructions.

### Environment Variables Required
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASSWORD` - Gmail app password
- `CLIENT_URL` - Your deployment URL
- `NODE_ENV` - Set to "production"

## Project Structure
```
leeco/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── middleware/      # Auth middleware
├── data/                # Company-wise problem data
├── index.html           # Main application page
├── auth.js              # Authentication UI logic
├── dashboard.js         # Dashboard & analytics
├── script.js            # Main application logic
├── style.css            # Styles
├── server.js            # Express server
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Progress Tracking
- `GET /api/progress/:company/:duration` - Get company problems
- `POST /api/progress/solved` - Mark problem as solved
- `DELETE /api/progress/solved/:problemId` - Unmark problem
- `GET /api/progress/check-solved/:problemId` - Check if solved
- `GET /api/progress/stats/all` - Get user statistics
- `GET /api/progress/analytics` - Get analytics data

### Notes & Bookmarks
- `PUT /api/progress/notes/:problemId` - Save/update notes
- `POST /api/progress/toggle-bookmark/:problemId` - Toggle bookmark
- `GET /api/progress/bookmarks` - Get all bookmarks
- `POST /api/progress/snippet/:problemId` - Add code snippet
- `DELETE /api/progress/snippet/:problemId/:snippetId` - Delete snippet

## Access
Visit the website: [Company-wise LeetCode](https://company-wise-leetcode-narendra.netlify.app/)

## Collaboration
For collaboration inquiries, contact Narendra.

## License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Licensed under the MIT License.

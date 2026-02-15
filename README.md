The backend is an express.js api that can post/get recommendations and managed them through an admin only website. The frontend communicates
with the backend using fetch. The backend runs leveraging Vercel and MongoDB with 6 stored Environment Variables for the following: MONGODB_URI,
EMAIL_USER, EMAIL_PASSWORD, ADMIN_EMAIL, ADMIN_KEY, ADMIN_URL. Authentication on another page, but it can only be accessed by an ADMIN_KEY, 
even if the website URL is exposed, it is still secure and unexposed in the frontend.

(I was planning on adding an email integration, so I got an email every time someone submitted a recommendation but wasn't able to finish)

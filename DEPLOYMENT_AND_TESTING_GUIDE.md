# Deployment and Testing Guide for Polis Project

## Deployment

### Backend Deployment

1. **Prepare Backend for Deployment**
   - Ensure `backend/package.json` has all dependencies listed.
   - Use environment variables for sensitive data (e.g., MongoDB URI, JWT secret).
   - Update `backend/index.js` to read MongoDB URI and JWT secret from environment variables.

2. **MongoDB Setup**
   - Option 1: Use MongoDB Atlas (cloud-hosted)
     - Create a free cluster at https://www.mongodb.com/cloud/atlas
     - Create a database user and whitelist your IP or allow access from anywhere.
     - Get the connection string URI.
   - Option 2: Self-host MongoDB on your server or local machine.

3. **Configure Backend to Use MongoDB URI**
   - Set environment variable `MONGODB_URI` with your connection string.
   - Modify `backend/index.js` to use `process.env.MONGODB_URI` for connection.

4. **Deploy Backend**
   - Choose a hosting provider (Heroku, AWS Elastic Beanstalk, DigitalOcean, etc.)
   - Push your backend code to the provider.
   - Set environment variables on the provider.
   - Start the backend server.

### Frontend Deployment

1. **Static Hosting**
   - The frontend consists of static HTML, CSS, and JS files in the `frontend/` directory.
   - Host on platforms like Netlify, Vercel, GitHub Pages, or your own web server.
   - Ensure frontend API calls point to the deployed backend URL.

2. **Configure Frontend API URLs**
   - Update API URLs in `frontend/script.js` to point to the deployed backend domain.

## Testing

### Backend API Testing

1. **Manual Testing**
   - Use tools like Postman or Insomnia.
   - Test endpoints:
     - `POST /api/users/register`
     - `POST /api/users/login`
     - `POST /api/cases`
     - `GET /api/cases/:caseNumber`
     - `POST /api/documents/upload`
     - `GET /api/admin/dashboard`

2. **Automated Testing**
   - Write tests using Jest or Mocha.
   - Test route handlers, authentication, and database operations.

### Frontend Testing

1. **Manual Testing**
   - Open frontend pages in a browser.
   - Test user registration, login, case submission, document upload, and admin dashboard.

2. **Automated Testing**
   - Use Cypress or Selenium for end-to-end testing.
   - Write tests to simulate user interactions and verify UI behavior.

## Additional Notes

- Use HTTPS in production for security.
- Use process managers like PM2 to keep backend running.
- Monitor logs and errors in production.

---

If you want, I can help you create deployment scripts, environment variable configurations, or sample test cases.

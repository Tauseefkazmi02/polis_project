# 🚔 POLIS - Police Case Management System

A comprehensive web-based police case management system built with Node.js, Express, SQLite, and modern HTML/CSS/JavaScript.

## 🌟 Features

### 🔐 Authentication & User Management
- **Secure Login/Registration** with JWT tokens
- **Role-based Access Control** (Admin, Officer, User)
- **Password Reset** functionality
- **User Profile Management**

### 📋 Case Management
- **Create & Track Cases** with unique case numbers
- **Case Assignment** to officers
- **Status Tracking** (Open, Pending, Closed)
- **Priority Levels** (High, Medium, Low)
- **Case Updates & Comments**
- **Evidence Management**

### 👮 Officer Management
- **Officer Account Creation** (Admin only)
- **Case Assignment** system
- **Department Management**
- **Badge Number Tracking**

### 📊 Analytics & Reporting
- **Dashboard Statistics**
- **Case Analytics** by type, status, priority
- **User Performance Metrics**
- **System Overview** for admins
- **Data Export** (JSON/CSV)

### 🛡️ Security Features
- **JWT Authentication**
- **Password Hashing** (bcrypt)
- **Input Validation**
- **CORS Protection**
- **Helmet Security Headers**

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd polis_project
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-restart
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:8080
   - API: http://localhost:8080/api
   - Health Check: http://localhost:8080/api/health

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
polis_project/
├── backend/
│   ├── database/
│   │   ├── database.js          # Database setup and helpers
│   │   └── polis.db            # SQLite database file
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── cases.js            # Case management routes
│   │   ├── users.js            # User management routes
│   │   └── admin.js            # Admin-specific routes
│   ├── server.js               # Main Express server
│   ├── package.json            # Backend dependencies
│   └── config.env              # Environment configuration
├── frontend files/
│   ├── home.html               # Landing page
│   ├── login.html              # Login page
│   ├── registration.html       # User registration
│   ├── dashboard.html          # User dashboard
│   ├── admin-dashboard.html    # Admin dashboard
│   ├── case_registration.html  # Case creation
│   ├── track_case.html         # Case tracking
│   ├── script.js               # Frontend JavaScript
│   └── styles.css              # Styling
└── README.md                   # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Cases
- `GET /api/cases` - Get all cases (with filters)
- `GET /api/cases/:id` - Get specific case
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case
- `POST /api/cases/:id/updates` - Add case update
- `GET /api/cases/stats/overview` - Get case statistics

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/officers` - Get all officers
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/:id/cases` - Get user's assigned cases
- `GET /api/users/:id/stats` - Get user statistics

### Admin
- `GET /api/admin/overview` - System overview
- `GET /api/admin/stats` - Detailed statistics
- `POST /api/admin/officers` - Create officer account
- `POST /api/admin/assign-case` - Assign case to officer
- `GET /api/admin/unassigned-cases` - Get unassigned cases
- `GET /api/admin/logs` - System logs
- `GET /api/admin/export/cases` - Export case data

## 🎨 Frontend Features

### Responsive Design
- Mobile-friendly interface
- Modern UI with police theme
- Interactive elements and animations

### User Experience
- Intuitive navigation
- Real-time updates
- Form validation
- Success/error messaging

## 🔒 Security Considerations

### Production Deployment
1. **Change default credentials** immediately
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Set up proper CORS** for your domain
5. **Use a production database** (PostgreSQL, MySQL)
6. **Implement rate limiting**
7. **Add logging and monitoring**

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
DB_PATH=/path/to/production/database
CORS_ORIGIN=https://yourdomain.com
```

## 🛠️ Development

### Adding New Features
1. Create new route files in `backend/routes/`
2. Add database tables in `backend/database/database.js`
3. Update frontend JavaScript in `script.js`
4. Add corresponding HTML pages if needed

### Database Schema
The system uses SQLite with the following main tables:
- `users` - User accounts and profiles
- `cases` - Case information and metadata
- `evidence` - Evidence tracking
- `case_updates` - Case progress updates

### Testing
```bash
# Test the API
curl http://localhost:8080/api/health

# Test authentication
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the code comments

## 🔄 Version History

- **v1.0.0** - Initial release with basic case management
- **v1.1.0** - Added authentication and user management
- **v1.2.0** - Enhanced admin features and analytics

---

**Built with ❤️ for law enforcement agencies**
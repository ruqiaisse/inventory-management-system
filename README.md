# Inventory Management System

A full-stack MERN application for managing products, stock, suppliers, and users with barcode scanning and QR code support.

## 🚀 Live Demo
[Coming soon after deployment]

## 📸 Screenshots
[Add screenshots of the app here]

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **html5-qrcode** - Barcode/QR scanner
- **qrcode** - QR generation

## ✨ Features

### Product Management
- ✅ Product CRUD operations
- ✅ Image upload with Multer
- ✅ Barcode scanning with html5-qrcode
- ✅ QR code generation and display
- ✅ Product categorization

### Inventory Management
- ✅ Stock tracking with real-time updates
- ✅ Stock movement audit trail
- ✅ Low stock alerts
- ✅ Stock history and reports

### Access Control
- ✅ Role-based access control (RBAC)
- ✅ User roles: Admin, Manager, Staff
- ✅ Dynamic permission system
- ✅ User-specific permission overrides
- ✅ Activity logging for compliance

### User Management
- ✅ User CRUD operations
- ✅ Role assignment
- ✅ Permission configuration per user
- ✅ Activity tracking

### Supplier Management
- ✅ Supplier information
- ✅ Supplier contact details
- ✅ Purchase history

### Dashboard & Analytics
- ✅ Real-time statistics
- ✅ Stock overview
- ✅ Activity dashboard
- ✅ Sales/Purchase reports

### Additional Features
- ✅ Category management
- ✅ Settings management
- ✅ Activity logging system
- ✅ Error handling & logging
- ✅ Responsive UI design

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Configure your environment variables
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd client
npm install

# Create .env file (if needed)
npm run dev

# Access at http://localhost:5173
```

## 📁 Project Structure

```
inventory-system/
├── server/
│   ├── config/           # Database and Multer configuration
│   ├── controllers/      # Request handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, permission, error handling
│   ├── utils/            # Helpers and utilities
│   └── uploads/          # Uploaded files directory
├── client/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── context/      # React context (Auth, Permissions)
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
└── README.md             # This file
```

## 🔐 Environment Variables

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/inventory
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Client (.env, if needed)
```
VITE_API_URL=http://localhost:5000
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Permissions
- `GET /api/permissions/me` - Get current user permissions
- `GET /api/permissions/role/:role` - Get role permissions
- `PUT /api/permissions/role/:role` - Update role permissions
- `PUT /api/permissions/user/:userId` - Set user overrides

### Stock
- `GET /api/stock` - Get stock levels
- `POST /api/stock/adjust` - Adjust stock
- `GET /api/stock/history` - Stock movement history

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Reports
- `GET /api/reports/sales` - Sales reports
- `GET /api/reports/stock` - Stock reports
- `GET /api/reports/activity` - Activity reports

*See full API documentation in each route file*

## 🧪 Testing

### Postman Collection
Import the Postman collection to test all endpoints:
1. [Create collection file and link here]

### Manual Testing Steps

#### Backend Testing
```bash
# Test API endpoints using Postman or curl
curl http://localhost:5000/api/health

# Verify permissions are seeded
# Should see: "Permissions seeded successfully"
```

#### Frontend Testing
```bash
# Test login with different user roles
# Verify permissions UI reflects role/user permissions
# Test product upload with image
# Test barcode scanning
# Test QR code generation
```

## 📝 Git Workflow

### Initial Setup
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git init
git add .
git commit -m "feat: initial MERN inventory system"
```

### Regular Development
```bash
# Pull latest changes
git pull

# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push to remote
git push origin feature/your-feature

# Create Pull Request on GitHub
```

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code improvements
- `docs/` - Documentation
- `chore/` - Maintenance tasks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Ahmed Hassan**
- Email: ahmed@example.com
- GitHub: [@ahmedhassan](https://github.com)

## 🐛 Bug Reports & Features

Found a bug or have a feature request? 
- Open an issue on GitHub
- Include detailed description
- Add screenshots if applicable

## 📞 Support

For support, email support@inventory-system.com or open an issue in the repository.

## 🙏 Acknowledgments

- html5-qrcode library for barcode scanning
- Multer for file upload handling
- Tailwind CSS for styling
- MongoDB for data persistence
- Express.js community

---

**Last Updated:** June 2024
**Version:** 1.0.0

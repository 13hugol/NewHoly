# 🏫 New Holy Cross School - Digital Platform

> **Educating Young Minds for 25 Years** - A comprehensive digital platform for New Holy Cross School, Kathmandu, Nepal.

[![Node.js CI](https://github.com/13hugol/NewHoly/actions/workflows/node.js.yml/badge.svg)](https://github.com/yourusername/NewHoly/actions/workflows/node.js.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📊 API Documentation](#-api-documentation)
- [👨‍💼 Admin Panel](#-admin-panel)
- [🎨 Frontend Features](#-frontend-features)
- [📱 Responsive Design](#-responsive-design)
- [🔒 Security Features](#-security-features)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [📞 Support](#-support)

## 🌟 Overview

The New Holy Cross School Digital Platform is a modern, full-stack web application designed to serve the educational community of New Holy Cross School in Kathmandu. This comprehensive system provides both public-facing features for students, parents, and visitors, as well as administrative tools for school management.

### 🎯 Key Objectives

- **Digital Transformation**: Modernize the school's digital presence
- **Community Engagement**: Strengthen connections between school, students, and families
- **Administrative Efficiency**: Streamline school management processes
- **Information Access**: Provide easy access to school information and resources

## ✨ Features

### 🌐 Public Website Features

- **🏠 Homepage**: Beautiful hero section with school information
- **📚 Academic Programs**: Comprehensive program listings
- **📰 News & Events**: Dynamic content management
- **👩‍🎓 Student Columns**: Student-authored content showcase
- **🖼️ Photo Gallery**: Visual school life documentation
- **👥 Faculty Profiles**: Meet our educators
- **📄 Downloads**: Important documents and resources
- **❓ FAQ Section**: Frequently asked questions
- **📞 Contact Information**: Multiple contact methods
- **🎓 Admission Portal**: Online admission form system

### 🔧 Administrative Features

- **📊 Dashboard**: Comprehensive admin overview
- **✏️ Content Management**: Edit all website content
- **📝 Admission Management**: Track and manage applications
- **💬 Contact Form Management**: Handle inquiries
- **🖼️ Image Upload System**: Cloudinary integration
- **👤 User Authentication**: Secure JWT-based auth
- **📱 Responsive Admin Panel**: Mobile-friendly interface

### 🎨 Design Features

- **📱 Fully Responsive**: Optimized for all devices
- **⚡ Fast Loading**: Optimized performance
- **🎨 Modern UI/UX**: Clean, professional design
- **♿ Accessible**: Web accessibility standards
- **🌙 Professional Theme**: School-appropriate styling

## 🛠️ Technology Stack

### Backend Technologies
```json
{
  "runtime": "Node.js",
  "framework": "Express.js",
  "database": "MongoDB Atlas",
  "authentication": "JWT (JSON Web Tokens)",
  "file_upload": "Multer + Cloudinary",
  "environment": "dotenv",
  "cors": "CORS middleware"
}
```

### Frontend Technologies
```json
{
  "markup": "HTML5",
  "styling": "CSS3 (Custom)",
  "scripting": "Vanilla JavaScript",
  "icons": "Font Awesome 6",
  "fonts": "Google Fonts (Inter)",
  "responsive": "CSS Grid & Flexbox"
}
```

### DevOps & Deployment
```json
{
  "ci_cd": "GitHub Actions",
  "deployment": "GitHub Pages (Frontend)",
  "version_control": "Git/GitHub",
  "package_manager": "npm"
}
```

## 📁 Project Structure

```
NewHoly/
├── 📂 Backend/
│   ├── 📄 server.js              # Express server & API routes
│   ├── 📄 dbconnect.js           # MongoDB connection logic
│   ├── 📄 middleware.js          # Custom middleware functions
│   ├── 📄 package.json           # Backend dependencies
│   ├── 📄 .env                   # Environment variables
│   └── 📂 node_modules/          # Backend dependencies
│
├── 📂 Frontend/
│   ├── 📄 index.html             # Homepage
│   ├── 📄 admin.html             # Admin panel
│   ├── 📄 about.html             # About page
│   ├── 📄 admission.html         # Admission form
│   ├── 📄 contact.html           # Contact page
│   ├── 📄 programs.html          # Academic programs
│   ├── 📄 events.html            # News & events
│   ├── 📄 gallery.html           # Photo gallery
│   ├── 📄 student-columns.html   # Student articles
│   ├── 📄 downloads.html         # Downloads page
│   ├── 📄 team.html              # Team/Faculty page
│   ├── 📄 faq.html               # FAQ page
│   ├── 📂 css/
│   │   ├── 📄 styles.css         # Main stylesheet
│   │   └── 📄 admin.css          # Admin panel styles
│   ├── 📂 js/
│   │   ├── 📄 script.js          # Main JavaScript
│   │   └── 📄 admin.js           # Admin panel logic
│   └── 📂 Images/                # Static images & assets
│
├── 📂 .github/
│   └── 📂 workflows/
│       └── 📄 node.js.yml        # CI/CD pipeline
│
├── 📄 README.md                  # This file
└── 📄 package.json               # Root package config
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.x, v20.x, or v22.x)
- **npm** or **yarn**
- **MongoDB Atlas** account
- **Cloudinary** account (optional, for image uploads)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/NewHoly.git
   cd NewHoly
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   # Development mode (auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin
   - **API**: http://localhost:3000/api

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/holycrossschool

# Admin Credentials
user=admin_username
pass=admin_password

# JWT Secret (change in production)
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=3000
NODE_ENV=production
```

### MongoDB Collections

The application uses the following MongoDB collections:

```javascript
{
  students: "Admission applications",
  programs: "Academic programs",
  contacts: "Contact form submissions", 
  news_events: "News and events",
  testimonials: "Student/parent testimonials",
  faculty: "Faculty member profiles",
  quick_links: "Navigation quick links",
  gallery: "Photo gallery images",
  facilities: "School facilities",
  student_columns: "Student articles",
  downloads: "Downloadable resources",
  faq: "Frequently asked questions",
  team: "Staff and team members",
  contact_info: "School contact information"
}
```

## 📊 API Documentation

### Public Endpoints

```http
# Get all programs
GET /api/programs

# Get all news/events  
GET /api/newsEvents

# Get all testimonials
GET /api/testimonials

# Get faculty members
GET /api/facultys

# Get gallery images
GET /api/gallerys

# Submit admission form
POST /submit-admission

# Submit contact form
POST /submit-contact
```

### Admin Endpoints (🔒 Protected)

```http
# Authentication
POST /api/login

# CRUD Operations (Programs example)
GET    /api/programs     # List all
GET    /api/programs/:id # Get single
POST   /api/programs     # Create new
PUT    /api/programs/:id # Update
DELETE /api/programs/:id # Delete

# Image Upload
POST /api/upload

# Contact Management
GET    /api/contacts     # List submissions
DELETE /api/contacts/:id # Delete submission
```

### Authentication

All admin endpoints require JWT token authentication:

```javascript
// Login Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful!"
}

// Request Headers
{
  "Authorization": "Bearer your_jwt_token_here"
}
```

## 👨‍💼 Admin Panel

### Features Overview

The admin panel provides comprehensive content management:

- **🔐 Secure Authentication**: JWT-based login system
- **📊 Dashboard**: Quick overview of system status
- **📝 Content Editor**: Rich text editing capabilities
- **🖼️ Media Manager**: Image upload and management
- **📈 Analytics**: Basic usage statistics
- **👥 User Management**: Admission and contact tracking

### Admin Access

1. Navigate to `/admin`
2. Use configured admin credentials
3. Access full content management system

### Security Features

- **JWT Token Authentication**
- **Password Protection**
- **Session Management**
- **CORS Protection**
- **Input Validation**
- **XSS Prevention**

## 🎨 Frontend Features

### User Experience

- **⚡ Fast Loading**: Optimized assets and lazy loading
- **📱 Mobile-First**: Responsive design for all devices
- **🎨 Modern Design**: Clean, professional aesthetics
- **♿ Accessibility**: WCAG compliance
- **🔍 SEO Friendly**: Optimized meta tags and structure

### Interactive Elements

- **🎠 Image Carousel**: Smooth image transitions
- **📋 Dynamic Forms**: Real-time validation
- **🔔 Notifications**: User feedback system
- **🎯 Smooth Scrolling**: Enhanced navigation
- **💫 Animations**: Subtle CSS animations

### Performance Optimizations

```javascript
// Image Loading
- Lazy loading for images
- WebP format support
- Responsive images
- Compression optimization

// Code Optimization  
- Minified CSS/JS
- Gzip compression
- Browser caching
- CDN integration
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

### Mobile Features

- **👆 Touch-Friendly**: Large tap targets
- **📱 Mobile Navigation**: Hamburger menu
- **⚡ Fast Performance**: Optimized for mobile networks
- **🔍 Mobile SEO**: Mobile-optimized meta tags

## 🔒 Security Features

### Backend Security

```javascript
{
  "authentication": "JWT with expiration",
  "authorization": "Role-based access control", 
  "input_validation": "Server-side validation",
  "cors_protection": "Configured CORS policy",
  "environment_variables": "Secure credential storage",
  "error_handling": "Secure error responses"
}
```

### Frontend Security

- **🔒 HTTPS Enforcement**
- **🛡️ XSS Prevention**
- **🚫 CSRF Protection**
- **🔐 Secure Form Handling**

## 🚀 Deployment

### GitHub Actions CI/CD

The project includes automated deployment:

```yaml
# .github/workflows/node.js.yml
name: Node.js CI and Deploy

on:
  push:
    branches: [ "Bhugol" ]
  pull_request:
    branches: [ "Bhugol" ]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
```

### Deployment Options

1. **GitHub Pages** (Frontend)
2. **Heroku** (Full-stack)
3. **Vercel** (Frontend + API)
4. **Railway** (Full-stack)
5. **DigitalOcean** (VPS)

### Production Setup

```bash
# Build for production
npm run build

# Set production environment
NODE_ENV=production

# Use production MongoDB cluster
MONGODB_URI=mongodb+srv://prod-cluster...

# Secure JWT secret
JWT_SECRET=your_production_jwt_secret
```

## 🤝 Contributing

We welcome contributions to improve the New Holy Cross School platform!

### How to Contribute

1. **🍴 Fork the Repository**
   ```bash
   git fork https://github.com/yourusername/NewHoly.git
   ```

2. **🌿 Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **💻 Make Changes**
   - Follow coding standards
   - Add comments for complex logic
   - Test your changes thoroughly

4. **✅ Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **🚀 Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **📥 Create Pull Request**
   - Provide clear description
   - Include screenshots if applicable
   - Reference related issues

### Development Guidelines

- **📝 Code Style**: Use consistent formatting
- **🧪 Testing**: Test all features thoroughly
- **📚 Documentation**: Update docs for new features
- **🔒 Security**: Follow security best practices
- **♿ Accessibility**: Maintain accessibility standards

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 New Holy Cross School

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 📞 Support

### Getting Help

- **🐛 Bug Reports**: [Create an Issue](https://github.com/yourusername/NewHoly/issues)
- **💡 Feature Requests**: [Request Feature](https://github.com/yourusername/NewHoly/issues)
- **📧 Direct Contact**: [school@newholy.edu.np](mailto:school@newholy.edu.np)
- **📱 Phone**: +977-1-XXXXXXX

### School Information

**New Holy Cross School**  
📍 Kageshwori Manohara-09, Kathmandu, Nepal  
📞 Phone: +977-1-XXXXXXX  
📧 Email: info@newholycross.edu.np  
🌐 Website: [www.newholycross.edu.np](https://www.newholycross.edu.np)

---

<div align="center">

### 🎓 Built with ❤️ for New Holy Cross School

**"Educating Young Minds for 25 Years"**

Made with 💻 by the Development Team | © 2024 New Holy Cross School

[![⭐ Give us a star](https://img.shields.io/github/stars/yourusername/NewHoly?style=social)](https://github.com/yourusername/NewHoly/stargazers)
[![🍴 Fork the project](https://img.shields.io/github/forks/yourusername/NewHoly?style=social)](https://github.com/yourusername/NewHoly/network/members)

</div>

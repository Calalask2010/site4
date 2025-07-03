# replit.md

## Overview

This is a personal portfolio website for a user named "hf1sh" built with Flask. The application serves as a modern, dark-themed personal website featuring a portfolio showcase, blog functionality, contact forms, and an integrated audio player. The site supports multiple languages (primarily Russian) and includes file upload capabilities for audio tracks.

## System Architecture

### Frontend Architecture
- **Framework**: HTML5 with Bootstrap 5.3.0 for responsive design
- **Styling**: Custom CSS with CSS variables for theming, dark theme with neon accents
- **JavaScript**: Vanilla JavaScript for interactive features (audio player, portfolio filters, animations)
- **UI Components**: 
  - Navigation bar with brand logo and menu items
  - Audio player with playlist functionality
  - Portfolio grid with filtering capabilities
  - Contact forms with validation
  - Blog posts with pagination

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy
- **Forms**: Flask-WTF for form handling and validation
- **Email**: Flask-Mail for contact form email notifications
- **File Handling**: Werkzeug for secure file uploads
- **Session Management**: Flask sessions with secret key configuration

### Database Schema
- **BlogPost**: Blog entries with title, content, date, and optional images
- **Portfolio**: Project showcase items with descriptions, technologies, and links
- **Contact**: Contact form submissions with sender info and messages
- **AudioTrack**: Music tracks with metadata (title, artist, file URL, duration)

## Key Components

### Models (models.py)
- **BlogPost**: Stores blog articles with timestamps and image support
- **Portfolio**: Project portfolio entries with technology tags
- **Contact**: Contact form submissions for user inquiries
- **AudioTrack**: Audio file metadata for the integrated music player

### Forms (forms.py)
- **ContactForm**: Contact page form with validation
- **AudioUploadForm**: File upload form for audio tracks
- **PortfolioForm**: Admin form for adding portfolio items
- **BlogForm**: Blog post creation form

### Routes (routes.py)
- **/** (index): Homepage with latest content and audio player
- **/about**: About page with personal information
- **/portfolio**: Portfolio showcase with project filtering
- **/contact**: Contact form with email notifications
- **/blog**: Blog listing with pagination

### Static Assets
- **CSS**: Custom styling with CSS variables for easy theming
- **JavaScript**: Audio player functionality, portfolio filtering, smooth scrolling
- **Uploads**: File storage for user-uploaded audio tracks

## Data Flow

1. **User requests page** → Flask routes handle request
2. **Database queries** → SQLAlchemy fetches relevant data
3. **Template rendering** → Jinja2 templates render with data
4. **Static assets** → CSS/JS files provide styling and interactivity
5. **Form submissions** → Flask-WTF validates and processes forms
6. **Email notifications** → Flask-Mail sends contact form emails
7. **File uploads** → Werkzeug securely handles audio file uploads

## External Dependencies

### Python Packages
- **Flask**: Web framework
- **Flask-SQLAlchemy**: Database ORM
- **Flask-WTF**: Form handling and CSRF protection
- **Flask-Mail**: Email functionality
- **Werkzeug**: WSGI utilities and security

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework for responsive design
- **Font Awesome 6.0.0**: Icon library
- **Custom CSS**: Dark theme with neon color scheme

### Configuration Dependencies
- **Database**: SQLite (default) or PostgreSQL via DATABASE_URL
- **Email Service**: SMTP server configuration (Gmail by default)
- **File Storage**: Local file system for uploads

## Deployment Strategy

### Development
- **Entry Point**: main.py runs Flask development server
- **Debug Mode**: Enabled for development with hot reload
- **Host Configuration**: 0.0.0.0:5000 for external access

### Production Considerations
- **WSGI**: ProxyFix middleware for proper header handling
- **Environment Variables**: 
  - DATABASE_URL for database connection
  - MAIL_* variables for email configuration
  - SESSION_SECRET for session security
- **File Uploads**: 16MB maximum file size limit
- **Database**: Connection pooling with recycle and ping settings

### Security Features
- **CSRF Protection**: Flask-WTF provides CSRF tokens
- **File Validation**: Secure filename handling and file type restrictions
- **Session Security**: Secret key for session encryption
- **Input Validation**: WTForms validation for all user inputs

## Changelog
- July 03, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
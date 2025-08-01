# BMI Tracker Mobile - Setup Documentation

## Overview

BMI Tracker Mobile is a comprehensive fitness management application built with Next.js, Supabase, and React PDF. The application allows gym administrators to manage members, track BMI records, generate health reports, and send notifications via email and WhatsApp.

## Features

### Core Functionality
- **Member Management**: Add, edit, and manage gym members
- **BMI Tracking**: Record and track BMI measurements with detailed health metrics
- **PDF Reports**: Generate comprehensive health reports with marketing images
- **Customer Segmentation**: Separate handling for new vs existing customers
- **Marketing Integration**: Dynamic marketing images based on customer type
- **Notification System**: Email and WhatsApp notifications
- **Image Management**: Upload and manage marketing images by customer category

### Technical Features
- **Responsive Design**: Mobile-first interface
- **Real-time Database**: Supabase integration
- **PDF Generation**: React PDF with custom styling
- **File Upload**: Image management system
- **Authentication**: Secure login system
- **Type Safety**: Full TypeScript implementation

## Technology Stack

### Frontend
- **Next.js 15.4.3**: React framework with App Router
- **React 19.1.0**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling framework
- **@react-pdf/renderer**: PDF generation

### Backend
- **Supabase**: Database and authentication
- **Next.js API Routes**: Server-side logic
- **Nodemailer**: Email notifications
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication

### Mobile
- **Capacitor**: Mobile app framework
- **Android**: Native Android support

## Project Structure

```
bmi-tracker-mobile/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── members/       # Member management
│   │   │   ├── generate-pdf/  # PDF generation
│   │   │   └── upload-image/  # Image upload
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── login/             # Login page
│   │   └── uploadimage/       # Image upload page
│   ├── components/            # React components
│   │   ├── BMICalculator.tsx
│   │   ├── MemberList.tsx
│   │   ├── UploadImagePage.tsx
│   │   └── UserManagement.tsx
│   └── lib/                   # Utility libraries
│       ├── supabase.ts        # Database client
│       ├── notifications.ts   # Email/PDF generation
│       └── api-config.ts      # API configuration
├── public/                    # Static assets
│   ├── logo.png              # Gym logo
│   └── uploads/              # Uploaded images
├── android/                   # Android app
└── capacitor.config.ts        # Capacitor configuration
```

## Database Schema

### Tables

#### Member
```sql
- id (Primary Key)
- name
- phone
- email
- dateOfBirth
- relationshipStatus
- serviceLooking
- platform
- customerType (new/existing)
- createdAt
- updatedAt
```

#### BMIRecord
```sql
- id (Primary Key)
- memberId (Foreign Key)
- height
- weight
- bmi
- category
- attendedBy
- age
- idealBodyWeight
- totalFatPercentage
- subcutaneousFat
- visceralFat
- muscleMass
- restingMetabolism
- biologicalAge
- healthConclusion
- recordedAt
```

#### UserPass
```sql
- id (Primary Key)
- username
- password
- role (admin/staff)
- isActive
- createdAt
- updatedAt
```

#### Notification
```sql
- id (Primary Key)
- bmiRecordId (Foreign Key)
- emailSent
- emailStatus
- whatsappSent
- whatsappStatus
- createdAt
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Android Studio (for mobile development)

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
GYM_EMAIL=your_gym_email

# Gym Information
GYM_NAME=Your Gym Name
GYM_CONTACT=+1234567890
GYM_ADDRESS=Your Gym Address

# JWT Secret
JWT_SECRET=your_jwt_secret
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the following SQL to create tables:
3. Set up Supabase Storage for image uploads:

```sql
-- Create Member table
CREATE TABLE "Member" (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  dateOfBirth DATE,
  relationshipStatus VARCHAR,
  serviceLooking VARCHAR,
  platform VARCHAR,
  customerType VARCHAR DEFAULT 'new',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Create BMIRecord table
CREATE TABLE "BMIRecord" (
  id SERIAL PRIMARY KEY,
  memberId INTEGER REFERENCES "Member"(id),
  height DECIMAL,
  weight DECIMAL,
  bmi DECIMAL,
  category VARCHAR,
  attendedBy VARCHAR,
  age INTEGER,
  idealBodyWeight DECIMAL,
  totalFatPercentage DECIMAL,
  subcutaneousFat DECIMAL,
  visceralFat DECIMAL,
  muscleMass DECIMAL,
  restingMetabolism DECIMAL,
  biologicalAge INTEGER,
  healthConclusion TEXT,
  recordedAt TIMESTAMP DEFAULT NOW()
);

-- Create UserPass table
CREATE TABLE "UserPass" (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'staff',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Create Notification table
CREATE TABLE "Notification" (
  id SERIAL PRIMARY KEY,
  bmiRecordId INTEGER REFERENCES "BMIRecord"(id),
  emailSent BOOLEAN DEFAULT false,
  emailStatus VARCHAR,
  whatsappSent BOOLEAN DEFAULT false,
  whatsappStatus VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### 3. Storage Setup

Run the storage setup script to create the required Supabase Storage bucket:

```bash
# Run the storage setup script
node setup-storage.js
```

This will create:
- A `marketing-images` bucket for storing uploaded images
- Public read access for PDF generation
- Proper security policies for upload/delete operations

### 4. Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 5. Mobile Setup

```bash
# Install Capacitor
npm install @capacitor/cli @capacitor/core

# Add Android platform
npx cap add android

# Sync web code to mobile
npx cap sync

# Open in Android Studio
npx cap open android
```

## Usage Guide

### Admin Dashboard

1. **Login**: Access the admin dashboard with username/password
2. **Member Management**: Add, edit, and view gym members
3. **BMI Records**: Create and manage BMI measurements
4. **User Management**: Manage admin and staff accounts

### BMI Calculator

1. **Select Member**: Choose a member from the list
2. **Enter Measurements**: Input height, weight, and health metrics
3. **Generate Report**: Create comprehensive health report
4. **Send Notifications**: Automatically send email/WhatsApp

### Marketing Images

1. **Upload Images**: Use the upload page to add marketing images
2. **Categorize**: Separate images for new vs existing customers
3. **PDF Integration**: Images automatically appear in generated PDFs

### PDF Generation

The system generates 4-page PDF reports:

1. **Page 1**: Personal details and member information
2. **Page 2**: BMI report with health metrics
3. **Page 3**: Marketing image (customer-specific)
4. **Page 4**: Gym information and contact details

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/db-login` - Database login
- `GET /api/auth/users` - List users
- `POST /api/auth/users` - Create user
- `PUT /api/auth/users/[id]` - Update user
- `DELETE /api/auth/users/[id]` - Delete user

### Members
- `GET /api/members` - List members
- `POST /api/members` - Create member
- `PUT /api/members/[id]` - Update member
- `POST /api/members/[id]/bmi` - Create BMI record

### PDF & Images
- `POST /api/generate-pdf` - Generate health report PDF
- `POST /api/upload-image` - Upload marketing image
- `GET /api/uploaded-images` - List uploaded images

## Configuration

### Email Setup
Configure SMTP settings in environment variables for email notifications.

### WhatsApp Integration
Currently logs messages to console. Replace with actual WhatsApp Business API.

### PDF Customization
Modify `src/lib/notifications.ts` to customize PDF styling and content.

### Image Management
- Images stored in Supabase Storage (`marketing-images` bucket)
- Automatic cleanup of old images
- Category-based organization (new/existing)
- Public URLs for PDF generation

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**
   - Check image file paths
   - Verify font registration
   - Ensure sufficient memory

2. **Email Notifications Not Sending**
   - Verify SMTP configuration
   - Check email credentials
   - Review firewall settings

3. **Image Upload Issues**
   - Check file permissions
   - Verify upload directory exists
   - Ensure file size limits

4. **Database Connection Errors**
   - Verify Supabase credentials
   - Check network connectivity
   - Review RLS policies

### Debug Mode

Enable detailed logging by adding console.log statements in:
- `src/lib/notifications.ts` - PDF generation
- `src/app/api/members/[id]/bmi/route.ts` - BMI processing
- `src/components/UploadImagePage.tsx` - Image upload

## Security Considerations

1. **Authentication**: JWT-based authentication
2. **Password Security**: bcrypt hashing
3. **File Upload**: Validate file types and sizes
4. **Database**: Row Level Security (RLS) policies
5. **Environment Variables**: Secure credential management

## Performance Optimization

1. **Image Optimization**: Compress uploaded images
2. **PDF Caching**: Cache generated PDFs
3. **Database Indexing**: Optimize query performance
4. **CDN Integration**: Use CDN for static assets

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Support

For technical support or feature requests, please contact the development team.

## License

This project is proprietary software. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Development Team 
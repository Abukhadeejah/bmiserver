# 🚀 Supabase Setup Guide

## 📋 Environment Variables

Update your `.env.local` file with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Database URL (for compatibility)
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-meta-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-number-id

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=arsalanahmed82@gmail.com
SMTP_PASS=xfad zoss vheu gygk

# Gym Details
GYM_NAME=Your Gym Name
GYM_CONTACT=9930323330
GYM_ADDRESS=Your Complete Gym Address
GYM_EMAIL=your-gym@email.com
```

## 🔧 Getting Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → API**
3. **Copy these values:**
   - Project URL
   - Anon Key
   - Service Role Key
   - Database Password

## 📊 Database Schema

Make sure your Supabase database has these tables:

### Member Table
```sql
CREATE TABLE "Member" (
  "id" SERIAL PRIMARY KEY,
  "memberId" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "dateOfBirth" TIMESTAMP,
  "relationshipStatus" TEXT,
  "serviceLooking" TEXT,
  "platform" TEXT,
  "customerType" TEXT DEFAULT 'new',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### BMIRecord Table
```sql
CREATE TABLE "BMIRecord" (
  "id" SERIAL PRIMARY KEY,
  "memberId" INTEGER NOT NULL,
  "height" DOUBLE PRECISION NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "bmi" DOUBLE PRECISION NOT NULL,
  "category" TEXT NOT NULL,
  "age" INTEGER,
  "idealBodyWeight" DOUBLE PRECISION,
  "totalFatPercentage" DOUBLE PRECISION,
  "subcutaneousFat" DOUBLE PRECISION,
  "visceralFat" DOUBLE PRECISION,
  "muscleMass" DOUBLE PRECISION,
  "restingMetabolism" INTEGER,
  "biologicalAge" INTEGER,
  "healthConclusion" TEXT,
  "recordedAt" TIMESTAMP DEFAULT NOW(),
  "attendedBy" TEXT,
  FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE
);
```

### Notification Table
```sql
CREATE TABLE "Notification" (
  "id" SERIAL PRIMARY KEY,
  "memberId" INTEGER NOT NULL,
  "bmiRecordId" INTEGER NOT NULL,
  "whatsappSent" BOOLEAN DEFAULT FALSE,
  "emailSent" BOOLEAN DEFAULT FALSE,
  "whatsappStatus" TEXT,
  "emailStatus" TEXT,
  "sentAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE,
  FOREIGN KEY ("bmiRecordId") REFERENCES "BMIRecord"("id") ON DELETE CASCADE
);
```

### UserPass Table
```sql
CREATE TABLE "UserPass" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### AdminUser Table
```sql
CREATE TABLE "AdminUser" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT DEFAULT 'admin',
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing the Connection

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test login with:**
   - Username: `KING`
   - Password: `1111`

3. **Verify features:**
   - ✅ Member management
   - ✅ BMI recording
   - ✅ PDF generation
   - ✅ Image upload
   - ✅ User management (admin only)

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Error:**
   - Check your Supabase URL and keys
   - Verify environment variables are loaded

2. **Table Not Found:**
   - Run the SQL schema in Supabase SQL Editor
   - Check table names match exactly

3. **Authentication Error:**
   - Verify UserPass table has default users
   - Check username/password case sensitivity

### Support:
- 📖 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)

---

**🎯 Your app is now connected to Supabase!** 
# OraSnap Supabase Database Setup Instructions

## Overview
This document provides step-by-step instructions to set up the complete OraSnap database schema in Supabase.

## Required Files
1. `supabase_schema.sql` - Complete database schema with tables, functions, and triggers
2. `supabase_policies.sql` - Row Level Security (RLS) policies for data access control

## Database Tables Created

### Core Tables
1. **profiles** - User profile information
2. **user_roles** - Role-based access control (user, photographer, admin)
3. **photographers** - Photographer profiles and portfolios
4. **bookings** - Photography booking management
5. **reviews** - Review and rating system
6. **messages** - Communication system between users

### Admin & Management Tables
7. **admin_settings** - Platform configuration settings
8. **activity_logs** - Audit trail for all actions
9. **announcements** - Admin announcements to users
10. **disputes** - Dispute resolution system
11. **moderation_queue** - Content moderation workflow
12. **photographer_verifications** - Identity verification for photographers
13. **platform_settings** - Additional platform configurations
14. **generated_captions** - AI-generated image captions

## Setup Instructions

### Step 1: Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project initialization to complete

### Step 2: Execute Schema Creation
1. Navigate to SQL Editor in your Supabase dashboard
2. Copy and paste the entire content of `supabase_schema.sql`
3. Click "Run" to execute the schema creation
4. Verify all tables are created successfully

### Step 3: Apply Security Policies
1. In the SQL Editor, create a new query
2. Copy and paste the entire content of `supabase_policies.sql`
3. Click "Run" to apply all RLS policies
4. Verify policies are applied to all tables

### Step 4: Verify Installation
Check that the following are created:
- ✅ 14 tables with proper structure
- ✅ All indexes for performance optimization
- ✅ Triggers for automatic timestamp updates
- ✅ Functions for role checking and public data access
- ✅ RLS policies for secure data access
- ✅ Default admin settings and platform settings

### Step 5: Create Admin User
1. Sign up for an account through your application
2. In Supabase SQL Editor, run:
```sql
-- Replace 'your-user-id' with the actual UUID from auth.users
INSERT INTO user_roles (user_id, role) 
VALUES ('your-user-id', 'admin');
```

## Key Features Implemented

### Security Features
- **Row Level Security (RLS)** on all tables
- **Role-based access control** (user, photographer, admin)
- **Secure functions** with SECURITY DEFINER
- **Data isolation** between users
- **Admin-only access** to sensitive data

### Performance Optimizations
- **Strategic indexes** on frequently queried columns
- **Efficient foreign key relationships**
- **Optimized queries** for public data access
- **Automatic timestamp management**

### Data Integrity
- **Foreign key constraints** maintain referential integrity
- **Check constraints** ensure valid data values
- **Unique constraints** prevent duplicate entries
- **Cascade deletes** maintain data consistency

### Admin Capabilities
- **Platform configuration** through admin_settings
- **User and photographer management**
- **Content moderation** workflow
- **Activity logging** for audit trails
- **Dispute resolution** system
- **Announcement management**

## Environment Variables
After setup, update your `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing the Setup
1. Start your application
2. Create a test user account
3. Verify user can access appropriate data
4. Test photographer registration
5. Test admin panel access (after creating admin role)

## Troubleshooting

### Common Issues
1. **Permission Denied**: Ensure RLS policies are applied correctly
2. **Function Not Found**: Verify all functions are created
3. **Foreign Key Violations**: Check table creation order
4. **Admin Access Issues**: Verify admin role is assigned correctly

### Verification Queries
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables WHERE schemaname = 'public';

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## Support
If you encounter issues during setup:
1. Check Supabase logs for error details
2. Verify all SQL statements executed successfully
3. Ensure proper permissions are set
4. Contact support with specific error messages

## Next Steps
After successful database setup:
1. Configure authentication providers
2. Set up storage buckets for image uploads
3. Configure email templates
4. Set up monitoring and alerts
5. Deploy your application
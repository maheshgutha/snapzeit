# Create Admin User - Step by Step

## Step 1: Create User in Supabase Auth
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `zbyuuhmpnhfwmwdqowym`
3. Go to **Authentication** → **Users**
4. Click **Add User**
5. Enter:
   - **Email**: `admin@orasnap.com`
   - **Password**: `Admin123!`
   - **Auto Confirm User**: ✅ (check this)
6. Click **Create User**

## Step 2: Get the User ID
1. After creating the user, you'll see it in the users list
2. Click on the user to see details
3. **Copy the User ID** (it looks like: `12345678-1234-1234-1234-123456789abc`)

## Step 3: Run SQL to Create Profile and Role
1. Go to **SQL Editor** in your Supabase dashboard
2. Open the `create_admin.sql` file from your project
3. **Replace** `YOUR_USER_ID_HERE` with the actual User ID you copied
4. Run the SQL script

## Step 4: Verify Admin Access
1. Go to your OraSnap application
2. Navigate to `/auth` 
3. Login with:
   - **Email**: `admin@orasnap.com`
   - **Password**: `Admin123!`
4. You should be redirected to the admin panel

## Troubleshooting
- If you can't access admin panel, check the browser console for errors
- Verify the user was created in Authentication → Users
- Verify the profile and role were created by running the verification query in SQL Editor
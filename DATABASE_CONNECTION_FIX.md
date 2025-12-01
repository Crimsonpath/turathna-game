# Fixing Supabase Database Connection Error

## 🔴 Error You're Seeing

```
error: Tenant or user not found
code: 'XX000'
```

This error means your DATABASE_URL has an incorrect password or connection string format.

---

## ✅ Solution: Get the Correct Connection String

### Step 1: Get Your Database Password

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/vtqyconlmdlknjwchudj/settings/database
2. Scroll to **"Connection string"** section
3. Click on **"URI"** tab
4. You'll see a connection string like:
   ```
   postgresql://postgres.vtqyconlmdlknjwchudj:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Copy this ENTIRE string

### Step 2: Update Your `.env` File

Replace your current `DATABASE_URL` with the EXACT string from Supabase dashboard:

```env
# Use the EXACT connection string from Supabase dashboard
DATABASE_URL=postgresql://postgres.vtqyconlmdlknjwchudj:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important**: Make sure to replace `[YOUR-PASSWORD]` with your actual database password!

---

## 🔧 Alternative: Reset Your Database Password

If you don't remember your password:

1. Go to: https://supabase.com/dashboard/project/vtqyconlmdlknjwchudj/settings/database
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. Copy the new password
5. Update your `.env` file with the new connection string

---

## 📋 Complete `.env` File Example

Your `.env` file should look like this:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vtqyconlmdlknjwchudj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cXljb25sbWRsa25qd2NodWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzIxMjUsImV4cCI6MjA4MDE0ODEyNX0.aTbygRbq-q0mmQluedAtD_iUeQcMkOA2ktFy7YB61Hk

# Database URL - Get this from Supabase Dashboard
# Go to: Settings → Database → Connection string → URI
DATABASE_URL=postgresql://postgres.vtqyconlmdlknjwchudj:YOUR_ACTUAL_PASSWORD_HERE@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Application Settings
NODE_ENV=development
PORT=3000
```

---

## ⚠️ Common Mistakes

1. **Missing password**: Make sure `[YOUR-PASSWORD]` is replaced with your actual password
2. **Wrong format**: Use the EXACT connection string from Supabase dashboard, don't manually construct it
3. **Special characters in password**: If your password has special characters, they should be URL-encoded
4. **Using wrong connection type**: For Drizzle migrations, you might need the direct connection (port 5432) instead of pooled connection (port 6543)

---

## 🔄 If Still Not Working: Use Direct Connection

If the pooled connection doesn't work for migrations, try the direct connection:

```env
# Direct connection (for migrations)
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD_HERE@db.vtqyconlmdlknjwchudj.supabase.co:5432/postgres
```

**Note**: The direct connection uses:
- Port `5432` (not 6543)
- Host `db.vtqyconlmdlknjwchudj.supabase.co` (not aws-0-us-east-1.pooler...)
- No `?pgbouncer=true` parameter

---

## ✅ Test the Connection

After updating your `.env` file:

1. Save the file
2. Run: `pnpm db:push`
3. It should now work!

---

## 🆘 Still Having Issues?

If you're still getting errors, please share:
1. The exact DATABASE_URL format you're using (with password hidden as `***`)
2. Any new error messages

Example:
```
DATABASE_URL=postgresql://postgres.vtqyconlmdlknjwchudj:***@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

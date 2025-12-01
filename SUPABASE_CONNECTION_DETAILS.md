# Turathna Game - Supabase Database Connection Details

## 📊 Database Setup Complete!

Your Supabase database for the Turathna game has been successfully created and populated with all necessary data.

---

## 🔑 Connection Information

### Project Details
- **Project Name**: turathna-game
- **Project ID**: vtqyconlmdlknjwchudj
- **Region**: us-east-1
- **Status**: ACTIVE_HEALTHY
- **PostgreSQL Version**: 17.6.1.054

### API Endpoint
```
https://vtqyconlmdlknjwchudj.supabase.co
```

### Database Host
```
db.vtqyconlmdlknjwchudj.supabase.co
```

### Anon/Public API Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cXljb25sbWRsa25qd2NodWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzIxMjUsImV4cCI6MjA4MDE0ODEyNX0.aTbygRbq-q0mmQluedAtD_iUeQcMkOA2ktFy7YB61Hk
```

---

## 📋 Database Schema

The following tables have been created:

1. **users** - User authentication and profiles
2. **game_rooms** - Multiplayer game sessions
3. **teams** - Teams within game rooms
4. **players** - Individual players in games
5. **cultural_packs** - Cultural content collections
6. **questions** - Trivia questions
7. **player_answers** - Player response tracking

---

## 📦 Seeded Data

### Cultural Packs (4 total)
1. **Egypt** (مصر) - 13 questions
2. **Japan** (اليابان) - 13 questions
3. **Mexico** (المكسيك) - 13 questions
4. **Kuwait** (الكويت) - 13 questions

**Total Questions**: 52 bilingual questions across all packs

---

## 🔧 Environment Variables for Your App

Add these to your `.env` file in the turathna-game project:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vtqyconlmdlknjwchudj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cXljb25sbWRsa25qd2NodWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzIxMjUsImV4cCI6MjA4MDE0ODEyNX0.aTbygRbq-q0mmQluedAtD_iUeQcMkOA2ktFy7YB61Hk

# Database URL (for server-side connections)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.vtqyconlmdlknjwchudj.supabase.co:5432/postgres
```

**Note**: You'll need to get your database password from the Supabase dashboard at https://supabase.com/dashboard/project/vtqyconlmdlknjwchudj/settings/database

---

## 🚀 Using Supabase in Your App

### Install Supabase Client

```bash
pnpm add @supabase/supabase-js
```

### Initialize Supabase Client

Create a file `client/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Example: Fetch Cultural Packs

```typescript
import { supabase } from './lib/supabase'

// Get all cultural packs
const { data: packs, error } = await supabase
  .from('cultural_packs')
  .select('*')
  .order('id')

// Get random questions from a pack
const { data: questions, error } = await supabase
  .from('questions')
  .select('*')
  .eq('cultural_pack_id', 1)
  .limit(10)
```

---

## 🔐 Security Notes

1. **Row Level Security (RLS)**: Currently disabled for development. You should enable RLS policies before going to production.

2. **Anon Key**: The provided anon key is safe to use in client-side code. It has limited permissions.

3. **Service Role Key**: Available in the Supabase dashboard under Settings → API. Keep this secret and only use server-side.

---

## 📊 Accessing the Dashboard

Visit your project dashboard at:
https://supabase.com/dashboard/project/vtqyconlmdlknjwchudj

From there you can:
- View and edit data in the Table Editor
- Run SQL queries in the SQL Editor
- Monitor API usage and logs
- Manage authentication settings
- Configure Row Level Security policies

---

## 🧪 Testing the Connection

You can test the connection with this simple query:

```bash
curl 'https://vtqyconlmdlknjwchudj.supabase.co/rest/v1/cultural_packs?select=*' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cXljb25sbWRsa25qd2NodWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzIxMjUsImV4cCI6MjA4MDE0ODEyNX0.aTbygRbq-q0mmQluedAtD_iUeQcMkOA2ktFy7YB61Hk" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cXljb25sbWRsa25qd2NodWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzIxMjUsImV4cCI6MjA4MDE0ODEyNX0.aTbygRbq-q0mmQluedAtD_iUeQcMkOA2ktFy7YB61Hk"
```

This should return the 4 cultural packs in JSON format.

---

## 💰 Billing Information

- **Cost**: $10/month
- **Plan**: Pro (includes 8GB database, 50GB bandwidth, 100GB file storage)
- **Free tier**: Not applicable (project created on Pro plan)

---

## 📝 Next Steps

1. **Update your local `.env` file** with the connection details above
2. **Install Supabase client** in your project: `pnpm add @supabase/supabase-js`
3. **Replace MySQL/Drizzle code** with Supabase client calls
4. **Test the connection** by fetching cultural packs
5. **Enable RLS policies** when ready for production

---

**Database is ready to use! 🎉**

All tables are created, all data is seeded, and your Turathna game can now connect to Supabase!

# 🔐 Security Setup Guide - Priority 1

## Files Created

### 1. `.env` (ROOT DIRECTORY)
**Location:** `/workspace/.env`
**Purpose:** Store your actual API keys (NEVER commit this file)

```bash
# Copy your compiled API keys into this file
# Replace all "paste_your_..." placeholders with real values
```

### 2. `.env.example` (ROOT DIRECTORY)
**Location:** `/workspace/.env.example`
**Purpose:** Template for team members (safe to commit)

### 3. `.gitignore` (UPDATED)
**Location:** `/workspace/.gitignore`
**Changes:** Added protection for `.env` files while allowing `.env.example`

### 4. `src/lib/supabase.ts` (ALREADY UPDATED)
**Location:** `/workspace/security-management-system/src/lib/supabase.ts`
**Status:** ✅ Already uses environment variables (no changes needed)

---

## 🚀 Quick Setup Steps

### Step 1: Edit the .env file
Open `/workspace/.env` and replace placeholders with your actual keys:

```bash
# Example - replace these lines:
VITE_SUPABASE_ANON_KEY=paste_your_supabase_anon_key_here

# With your actual key:
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_real_key
```

### Step 2: Verify the file exists
```bash
# Run this command to check:
cat /workspace/.env
```

### Step 3: Restart your development server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test the connection
The app will now load credentials from `.env` instead of hardcoded values.
If credentials are missing, you'll see an error in the browser console.

---

## ⚠️ Critical Security Actions

### 1. Rotate Your Supabase Key
Since the old key was exposed in git history:
1. Go to https://app.supabase.com
2. Select your project → Settings → API
3. Click "Regenerate" on the anon/public key
4. Update `.env` with the new key

### 2. Clean Git History (Remove Old Exposed Keys)
```bash
# WARNING: This rewrites git history - backup first!
# Only do this if you're the sole developer or coordinate with team

# Option A: If key was recently added (last few commits)
git reset --hard HEAD~3  # Go back 3 commits

# Option B: Use BFG Repo-Cleaner (recommended for larger history)
# Download: https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files .env

# Then force push (CAUTION: affects all collaborators)
git push --force origin main
```

### 3. Never Commit .env
The `.gitignore` now protects `.env` files. Verify:
```bash
# Check what git sees:
git status

# You should see .env listed as "untracked" (not staged)
# But .env.example should be tracked
```

---

## 📁 File Structure

```
/workspace/
├── .env                    # ← YOUR ACTUAL KEYS (gitignored)
├── .env.example           # ← Template (safe to commit)
├── .gitignore             # ← Updated to protect .env
└── security-management-system/
    └── src/
        └── lib/
            └── supabase.ts  # ← Uses import.meta.env.VITE_*
```

---

## ✅ Verification Checklist

- [ ] Created `.env` file in `/workspace/` root
- [ ] Replaced all `paste_your_...` placeholders with real keys
- [ ] Restarted development server
- [ ] Verified app loads without credential errors
- [ ] Rotated Supabase anon key (if previously exposed)
- [ ] Confirmed `.env` is NOT tracked by git (`git status`)
- [ ] Confirmed `.env.example` IS tracked by git

---

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"
**Solution:** Check that `.env` file exists in `/workspace/` (not in subfolder)

### Error: "Invalid API key"
**Solution:**
1. Verify you copied the full key (no extra spaces)
2. Regenerate key in Supabase dashboard
3. Restart dev server after editing `.env`

### App still uses old hardcoded values
**Solution:**
1. Clear browser cache (Ctrl+Shift+R)
2. Delete `node_modules/.vite` folder
3. Restart dev server

---

## 📞 Need Help?

If you have issues:
1. Check browser console for error messages
2. Verify `.env` file location: must be in `/workspace/` root
3. Ensure all `VITE_` prefix is present (required by Vite)
4. Restart terminal and dev server after editing `.env`

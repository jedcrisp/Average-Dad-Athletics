# Update OAuth Consent Screen to "Average Dad Athletics"

## Quick Steps

### 1. Go to Google Cloud Console
- Open: https://console.cloud.google.com/
- Make sure you're in the correct project: **average-dad-athletics-6bb32**

### 2. Navigate to OAuth Consent Screen
- Click **APIs & Services** in the left menu
- Click **OAuth consent screen**

### 3. Update Application Name
- **Application name**: Change to `Average Dad Athletics`
- **User support email**: Your email address
- **Application home page**: `https://averagedadathletics.com`
- **Authorized domains**: Add `averagedadathletics.com` (click + Add domain)

### 4. Developer Contact Information
- **Developer contact information**: Your email address

### 5. Save Changes
- Click **Save and Continue** at the bottom
- Wait 5-10 minutes for changes to propagate

## What This Changes

After updating, when users sign in with Google, they'll see:
- **"Sign in to Average Dad Athletics"** instead of the Firebase domain
- Your custom branding in the OAuth popup

## Important Notes

- Changes take 5-10 minutes to propagate
- Users may need to clear browser cache or use incognito mode to see changes
- This only affects Google Sign In - Apple Sign In has separate settings

## For Apple Sign In

If you're using Apple Sign In, update separately:
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to your Services ID
3. Update the app name to "Average Dad Athletics"

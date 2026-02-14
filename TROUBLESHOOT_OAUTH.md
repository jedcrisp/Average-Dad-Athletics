# Troubleshooting: OAuth Consent Screen Not Updating

## If Changes Didn't Take Effect

### 1. Verify OAuth Consent Screen Status

**Important:** The OAuth consent screen must be **Published** (not just in Testing mode):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **OAuth consent screen**
3. Check the status at the top:
   - ✅ **Published** = Changes apply to all users
   - ⚠️ **Testing** = Only applies to test users

**If in Testing mode:**
- Click **PUBLISH APP** button at the top
- This makes changes visible to all users

### 2. Check Application Name Field

Make sure you updated the correct field:
- **Application name** (not "App name" or "Product name")
- Should be exactly: `Average Dad Athletics`
- Case-sensitive

### 3. Verify Authorized Domains

In OAuth consent screen:
- Scroll to **Authorized domains** section
- Make sure `averagedadathletics.com` is listed
- Click **+ Add domain** if missing
- Save changes

### 4. Clear Browser Cache

OAuth popups are heavily cached:
- **Chrome/Edge:** Ctrl+Shift+Delete → Clear cached images and files
- **Firefox:** Ctrl+Shift+Delete → Cache
- Or use **Incognito/Private mode** to test

### 5. Wait for Propagation

Changes can take:
- **5-10 minutes** for most users
- **Up to 24 hours** in some cases
- Try again after waiting

### 6. Check Firebase Authorized Domains

Also verify in Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Authentication** → **Settings** tab
3. **Authorized domains** section
4. Make sure `averagedadathletics.com` is listed
5. If not, click **Add domain** and add it

### 7. Verify OAuth Client Configuration

Check the OAuth client settings:
1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID
3. Click to edit
4. Check **Authorized JavaScript origins**:
   - Should include: `https://averagedadathletics.com`
5. Check **Authorized redirect URIs**:
   - Should include: `https://averagedadathletics.com/__/auth/handler`
   - And: `https://averagedadathletics.com`

### 8. Test in Incognito Mode

1. Open browser in **Incognito/Private mode**
2. Go to your site
3. Try signing in
4. This bypasses cache and shows current settings

### 9. Check User Type

If OAuth consent screen is in **Testing** mode:
- Only test users (emails you added) will see the updated name
- All other users see the old/default name
- **Solution:** Publish the app (see step 1)

### 10. Verify Changes Were Saved

1. Go back to OAuth consent screen
2. Check if your changes are still there
3. If not, they weren't saved - try again
4. Make sure to click **Save and Continue** at the bottom

## Still Not Working?

### Alternative: Check App Verification Status

If your app is unverified:
- Google may show limited information
- You may need to verify your app
- Go to OAuth consent screen → Check verification status

### Force Refresh OAuth Token

Users may need to:
1. Sign out completely
2. Clear browser data
3. Sign in again
4. This forces a new OAuth flow with updated settings

## Quick Checklist

- [ ] OAuth consent screen is **Published** (not Testing)
- [ ] Application name is exactly: `Average Dad Athletics`
- [ ] Authorized domains includes: `averagedadathletics.com`
- [ ] Firebase authorized domains includes: `averagedadathletics.com`
- [ ] OAuth client redirect URIs are correct
- [ ] Waited 10+ minutes after changes
- [ ] Tested in incognito mode
- [ ] Cleared browser cache

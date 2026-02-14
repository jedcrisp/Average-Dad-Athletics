# YouTube Auto-Embedding Setup

This guide will help you set up automatic YouTube video embedding from your channel.

## How It Works

When you post a video to your YouTube channel (`@AverageDadAthletics`), it will automatically appear on your website's videos page. The system fetches videos from your channel using the YouTube Data API.

## Step 1: Get YouTube API Key

1. **Go to Google Cloud Console:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Make sure you're using the same Google account that owns the YouTube channel

2. **Create or Select a Project:**
   - If you already have a project (like your Firebase project), select it
   - Otherwise, create a new project

3. **Enable YouTube Data API v3:**
   - Click **APIs & Services** → **Library**
   - Search for "YouTube Data API v3"
   - Click on it and press **Enable**

4. **Create API Credentials:**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **API Key**
   - Copy the API key that's generated
   - (Optional but recommended) Click **Restrict Key**:
     - Under **API restrictions**, select "Restrict key"
     - Choose "YouTube Data API v3"
     - Click **Save**

## Step 2: Add API Key to Environment Variables

### Local Development

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add your YouTube API key:
   ```env
   YOUTUBE_API_KEY=your-actual-api-key-here
   ```
3. Restart your development server:
   ```bash
   npm run dev
   ```

### Vercel (Production)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Click **Add New**
4. **Key**: `YOUTUBE_API_KEY`
5. **Value**: Paste your API key
6. **Environment**: Select Production, Preview, and Development
7. Click **Save**
8. **Redeploy** your site (go to Deployments → click ⋯ → Redeploy)

## Step 3: Verify It Works

1. Visit your videos page: `http://localhost:3000/videos` (or your live site)
2. Your YouTube videos should automatically appear
3. New videos will show up automatically (you may need to refresh the page)

## Troubleshooting

### "YouTube API key not configured"
- Make sure `YOUTUBE_API_KEY` is in your `.env.local` file
- Restart your dev server after adding the key
- Check that the key is set in Vercel if deploying

### "Could not find channel uploads playlist"
- Make sure your channel handle is correct: `@AverageDadAthletics`
- The API might take a moment to find your channel
- Try refreshing the page

### "Failed to fetch videos"
- Check that YouTube Data API v3 is enabled in Google Cloud Console
- Verify your API key is correct
- Check browser console for detailed error messages
- Make sure your API key has the correct restrictions (or no restrictions)

### Videos not updating automatically
- The videos are fetched when the page loads
- Refresh the page to see new videos
- Videos are sorted by date (newest first)

## API Quota

YouTube Data API has a free quota:
- **10,000 units per day** (free tier)
- Each video fetch uses ~100 units
- This allows fetching videos ~100 times per day

If you exceed the quota:
- Wait 24 hours for it to reset
- Or upgrade to a paid plan in Google Cloud Console

## Customization

To change the channel or number of videos:

1. **Change Channel:**
   - Edit `app/api/youtube/videos/route.ts`
   - Update `YOUTUBE_CHANNEL_HANDLE` constant

2. **Change Number of Videos:**
   - Edit `app/api/youtube/videos/route.ts`
   - Update `maxResults` parameter (default: 50)

## Security Notes

- **Never commit your API key to git** (it's already in `.gitignore`)
- The API key is server-side only (not exposed to clients)
- Consider restricting the API key to specific APIs and domains
- Monitor your API usage in Google Cloud Console

## Need Help?

If you're having issues:
1. Check the browser console for errors
2. Check server logs (terminal where `npm run dev` is running)
3. Verify your API key works by testing it directly:
   ```bash
   curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=@AverageDadAthletics&type=channel&key=YOUR_API_KEY"
   ```

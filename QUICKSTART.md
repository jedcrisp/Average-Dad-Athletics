# Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Customizing Your Content

### Adding Your YouTube Videos

1. Open `app/videos/page.tsx`
2. Find the `videos` array (around line 14)
3. Replace the example video with your actual YouTube video IDs:

```typescript
const videos: Video[] = [
  {
    id: 'YOUR_YOUTUBE_VIDEO_ID', // Get this from your YouTube video URL
    title: 'Your Video Title',
    description: 'Your video description',
    thumbnail: '',
  },
  // Add more videos here
]
```

**How to get YouTube Video ID:**
- From URL: `https://www.youtube.com/watch?v=VIDEO_ID_HERE`
- The part after `v=` is your video ID

### Adding Your Workouts

1. Open `app/workouts/page.tsx`
2. Find the `workouts` array (around line 18)
3. Add your workouts:

```typescript
const workouts: Workout[] = [
  {
    id: '1',
    title: 'Your Workout Name',
    date: '2024-01-15',
    duration: '45 min',
    exercises: ['Exercise 1', 'Exercise 2', 'Exercise 3'],
    description: 'Workout description',
    difficulty: 'Intermediate', // 'Beginner', 'Intermediate', or 'Advanced'
  },
]
```

### Updating Brand Colors

1. Open `tailwind.config.js`
2. Modify the `primary` color values to match your brand

### Updating Site Metadata

1. Open `app/layout.tsx`
2. Update the `metadata` object with your site title and description

## Next Steps

- Replace placeholder content with your actual content
- Add your YouTube channel URL in the footer and videos page
- Customize colors and styling to match your brand
- Set up a backend if you want dynamic content (database for workouts/forum)
- Deploy to Vercel, Netlify, or your preferred hosting platform

## Building for Production

```bash
npm run build
npm start
```

## Need Help?

Check the main README.md for more detailed information.

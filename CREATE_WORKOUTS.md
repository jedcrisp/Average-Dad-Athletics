# Create Workouts in Firebase

This guide shows you how to create workouts in Firebase Firestore.

## Option 1: Use the API Route (Easiest)

### Create Sample Workouts

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser console** (F12) on any page

3. **Run this command:**
   ```javascript
   fetch('/api/workouts/create', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ action: 'create-sample' })
   })
   .then(r => r.json())
   .then(console.log)
   ```

This will create 5 sample workouts:
- Max Deadlift Challenge (weight competition)
- 5K Time Trial (time competition)
- Max Push-ups Challenge (reps competition)
- Full Body Strength (no competition)
- Cardio Blast (no competition)

### Create Custom Workout

```javascript
fetch('/api/workouts/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create-custom',
    workout: {
      title: 'Your Workout Name',
      date: '2024-02-15',
      duration: '45 min',
      exercises: ['Exercise 1', 'Exercise 2'],
      description: 'Workout description',
      competitionType: 'weight', // or 'time', 'reps', 'distance', 'none'
      competitionMetric: 'Max Weight',
      competitionUnit: 'lbs',
      competitionSort: 'desc'
    }
  })
})
.then(r => r.json())
.then(console.log)
```

## Option 2: Firebase Console (Manual)

1. **Go to Firebase Console:**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: **average-dad-athletics-6bb32**
   - Click **Firestore Database**

2. **Create Collection:**
   - Click **Start collection**
   - Collection ID: `workouts`
   - Click **Next**

3. **Add First Document:**
   - Document ID: Click **Auto-ID** (or use custom ID)
   - Add these fields:

### Required Fields:

| Field | Type | Value | Example |
|-------|------|-------|---------|
| `title` | string | Workout name | "Max Deadlift Challenge" |
| `date` | string | Date (YYYY-MM-DD) | "2024-02-15" |
| `duration` | string | Duration | "45 min" |
| `exercises` | array | List of exercises | ["Deadlifts", "Accessory work"] |
| `description` | string | Workout description | "Test your max deadlift strength" |
| `createdAt` | timestamp | Current time | (Click timestamp icon) |
| `updatedAt` | timestamp | Current time | (Click timestamp icon) |

### Competition Fields (Optional):

| Field | Type | Value | Example |
|-------|------|-------|---------|
| `competitionType` | string | Competition type | "weight", "time", "reps", "distance", or "none" |
| `competitionMetric` | string | Display name | "Max Weight", "Fastest Time" |
| `competitionUnit` | string | Unit of measurement | "lbs", "seconds", "reps" |
| `competitionSort` | string | Sort order | "asc" (time) or "desc" (weight/reps) |

4. **Click Save**

5. **Repeat** for more workouts

## Sample Workout Examples

### Competition Workout (Weight)
```json
{
  "title": "Max Deadlift Challenge",
  "date": "2024-02-15",
  "duration": "45 min",
  "exercises": ["Deadlifts", "Accessory work"],
  "description": "Test your max deadlift strength",
  "competitionType": "weight",
  "competitionMetric": "Max Weight",
  "competitionUnit": "lbs",
  "competitionSort": "desc"
}
```

### Competition Workout (Time)
```json
{
  "title": "5K Time Trial",
  "date": "2024-02-14",
  "duration": "30 min",
  "exercises": ["Running", "Warm-up"],
  "description": "Run 5K as fast as you can",
  "competitionType": "time",
  "competitionMetric": "Fastest Time",
  "competitionUnit": "seconds",
  "competitionSort": "asc"
}
```

### Regular Workout (No Competition)
```json
{
  "title": "Full Body Strength",
  "date": "2024-02-13",
  "duration": "45 min",
  "exercises": ["Squats", "Push-ups", "Deadlifts"],
  "description": "Complete full-body workout",
  "competitionType": "none"
}
```

## Notes

- **Date format**: Use `YYYY-MM-DD` (e.g., "2024-02-15")
- **Exercises**: Add as array items in Firebase Console
- **Timestamps**: Use the timestamp picker in Firebase Console
- **Competition**: Set `competitionType` to `"none"` for regular workouts
- **Sort order**: 
  - `"asc"` for time (lower is better)
  - `"desc"` for weight/reps/distance (higher is better)

## Verify Workouts

After creating workouts:
1. Go to your website: `http://localhost:3000/workouts`
2. You should see your workouts listed
3. Click on a workout to see details and leaderboard (if competition enabled)

## Troubleshooting

**Workouts not showing?**
- Check Firestore rules allow reading workouts
- Verify workouts collection exists
- Check browser console for errors

**Can't create workouts?**
- Make sure you're signed in (for API route)
- Check Firestore rules allow writing (admin only)
- Verify Firebase is configured correctly

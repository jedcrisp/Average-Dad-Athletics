# How to Create a Competition Workout

This guide explains how to create workouts with competitions/leaderboards.

## Option 1: Using Firebase Console (Recommended)

1. **Go to Firebase Console:**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Firestore Database**

2. **Create a Workout Document:**
   - Click **Start collection** (or add to existing `workouts` collection)
   - Document ID: Auto-generate or custom
   - Add these fields:

### Required Fields:
- `title` (string): "Max Deadlift Challenge"
- `date` (string): "2024-02-15"
- `duration` (string): "45 min"
- `exercises` (array): ["Deadlifts", "Accessory work"]
- `description` (string): "Test your max deadlift strength"

### Competition Fields:
- `competitionType` (string): Choose one:
  - `"time"` - For fastest time (e.g., AMRAP, timed workouts)
  - `"weight"` - For max weight (e.g., 1RM deadlift)
  - `"reps"` - For max reps (e.g., max push-ups)
  - `"distance"` - For distance (e.g., running)
  - `"none"` - No competition

- `competitionMetric` (string): Display name
  - Examples: "Fastest Time", "Max Weight", "Total Reps", "Distance"

- `competitionUnit` (string): Unit of measurement
  - Examples: "seconds", "lbs", "reps", "miles", "km"

- `competitionSort` (string): Sort order
  - `"asc"` - For time (lower is better)
  - `"desc"` - For weight/reps/distance (higher is better)

### Example Workout Document:

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
  "competitionSort": "desc",
  "createdAt": "2024-02-15T00:00:00Z",
  "updatedAt": "2024-02-15T00:00:00Z"
}
```

## Option 2: Using Code (Future Admin Panel)

You can create workouts programmatically using the `workoutHelpers.create()` function:

```typescript
import { workoutHelpers } from '@/lib/firebase-helpers'

const workout = {
  title: "Max Deadlift Challenge",
  date: "2024-02-15",
  duration: "45 min",
  exercises: ["Deadlifts", "Accessory work"],
  description: "Test your max deadlift strength",
  competitionType: "weight",
  competitionMetric: "Max Weight",
  competitionUnit: "lbs",
  competitionSort: "desc"
}

await workoutHelpers.create(workout)
```

## Competition Type Examples

### Time-Based (AMRAP, For Time)
```json
{
  "competitionType": "time",
  "competitionMetric": "Fastest Time",
  "competitionUnit": "seconds",
  "competitionSort": "asc"
}
```
Users enter time in seconds (e.g., 300 = 5 minutes)

### Weight-Based (1RM, Max Weight)
```json
{
  "competitionType": "weight",
  "competitionMetric": "Max Weight",
  "competitionUnit": "lbs",
  "competitionSort": "desc"
}
```
Users enter weight in pounds

### Reps-Based (Max Reps)
```json
{
  "competitionType": "reps",
  "competitionMetric": "Total Reps",
  "competitionUnit": "reps",
  "competitionSort": "desc"
}
```
Users enter total number of reps

### Distance-Based (Running, Rowing)
```json
{
  "competitionType": "distance",
  "competitionMetric": "Distance",
  "competitionUnit": "miles",
  "competitionSort": "desc"
}
```
Users enter distance

## How It Works

1. **You create workout** with competition fields in Firestore
2. **Users see workout** on workouts page (marked with 🏆)
3. **Users click workout** to see details and leaderboard
4. **Users submit results** via submission form
5. **Leaderboard updates** showing top 10 performers
6. **Users can update** their submission if they improve

## Notes

- **Time entries**: Users enter seconds (you can add helper text)
- **Sort order**: `asc` for time (lower better), `desc` for everything else (higher better)
- **Leaderboard**: Shows top 10, with medals for top 3
- **User submissions**: Users can only have one submission per workout (updates if they resubmit)
- **Verification**: Future feature - admins can verify submissions

## Troubleshooting

**Leaderboard not showing?**
- Make sure `competitionType` is set and not `"none"`
- Check Firestore rules allow reading submissions
- Verify workout has an `id` field

**Submissions not saving?**
- Check user is signed in
- Verify Firestore rules allow creating submissions
- Check browser console for errors

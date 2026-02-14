# Competition/Leaderboard System Design

## Overview
This system allows workouts to have competitions where users can submit their results and compete on a leaderboard.

## Data Structure

### Workout Competition Fields
When creating a workout, you can add:
- `competitionType`: 'time' | 'weight' | 'reps' | 'distance' | 'none'
- `competitionMetric`: Display name (e.g., "Fastest Time", "Max Weight", "Total Reps")
- `competitionUnit`: Unit of measurement (e.g., "seconds", "lbs", "reps", "miles")
- `competitionSort`: 'asc' | 'desc' (ascending for time, descending for weight/reps)

### Workout Submissions Collection
Each submission in `workoutSubmissions` contains:
- `workoutId`: Reference to the workout
- `userId`: User who submitted
- `userName`: Display name
- `userEmail`: User email (optional)
- `metricValue`: Number (the actual result)
- `unit`: Unit of measurement
- `submittedAt`: Timestamp
- `verified`: Boolean (for admin verification later)

## How It Works

1. **Admin creates workout** with competition enabled
2. **Users view workout** and see leaderboard
3. **Users submit results** via submission form
4. **Leaderboard updates** showing top 10 performers
5. **Users can update** their submission if they improve

## Example Workout Configurations

### Time-Based (e.g., AMRAP)
```javascript
{
  competitionType: 'time',
  competitionMetric: 'Fastest Time',
  competitionUnit: 'seconds',
  competitionSort: 'asc' // Lower is better
}
```

### Weight-Based (e.g., Max Deadlift)
```javascript
{
  competitionType: 'weight',
  competitionMetric: 'Max Weight',
  competitionUnit: 'lbs',
  competitionSort: 'desc' // Higher is better
}
```

### Reps-Based (e.g., Max Push-ups)
```javascript
{
  competitionType: 'reps',
  competitionMetric: 'Total Reps',
  competitionUnit: 'reps',
  competitionSort: 'desc' // Higher is better
}
```

## Firestore Security Rules

Submissions need these rules:
- Users can read all submissions for a workout
- Users can create their own submission
- Users can update/delete their own submission
- Admins can verify submissions (future feature)

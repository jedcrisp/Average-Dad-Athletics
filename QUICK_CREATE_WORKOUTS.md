# Quick Guide: Create Workouts in Firebase Console

Since your Firebase environment variables need to be set up, here's the fastest way to create workouts:

## Step-by-Step Instructions

1. **Go to Firebase Console:**
   - Visit https://console.firebase.google.com/
   - Select project: **average-dad-athletics-6bb32**
   - Click **Firestore Database**

2. **Create Collection:**
   - Click **Start collection** (or use existing `workouts` collection)
   - Collection ID: `workouts`
   - Click **Next**

3. **Add Each Workout:**

   For each workout below, click **Add document** and fill in:

### Workout 1: Max Deadlift Challenge
- **Document ID**: Auto-ID (click button)
- **Fields**:
  - `title` (string): `Max Deadlift Challenge`
  - `date` (string): `2024-02-15`
  - `duration` (string): `45 min`
  - `exercises` (array): Add 3 items: `Deadlifts`, `Accessory work`, `Core`
  - `description` (string): `Test your max deadlift strength. One rep max competition.`
  - `competitionType` (string): `weight`
  - `competitionMetric` (string): `Max Weight`
  - `competitionUnit` (string): `lbs`
  - `competitionSort` (string): `desc`
  - `createdAt` (timestamp): Click timestamp icon, select "now"
  - `updatedAt` (timestamp): Click timestamp icon, select "now"

### Workout 2: 5K Time Trial
- **Document ID**: Auto-ID
- **Fields**:
  - `title` (string): `5K Time Trial`
  - `date` (string): `2024-02-14`
  - `duration` (string): `30 min`
  - `exercises` (array): `Running`, `Warm-up`, `Cool-down`
  - `description` (string): `Run 5K as fast as you can. Fastest time wins!`
  - `competitionType` (string): `time`
  - `competitionMetric` (string): `Fastest Time`
  - `competitionUnit` (string): `seconds`
  - `competitionSort` (string): `asc`
  - `createdAt` (timestamp): now
  - `updatedAt` (timestamp): now

### Workout 3: Max Push-ups Challenge
- **Document ID**: Auto-ID
- **Fields**:
  - `title` (string): `Max Push-ups Challenge`
  - `date` (string): `2024-02-13`
  - `duration` (string): `20 min`
  - `exercises` (array): `Push-ups`, `Rest`, `Repeat`
  - `description` (string): `How many push-ups can you do? Max reps competition.`
  - `competitionType` (string): `reps`
  - `competitionMetric` (string): `Total Reps`
  - `competitionUnit` (string): `reps`
  - `competitionSort` (string): `desc`
  - `createdAt` (timestamp): now
  - `updatedAt` (timestamp): now

### Workout 4: Full Body Strength
- **Document ID**: Auto-ID
- **Fields**:
  - `title` (string): `Full Body Strength`
  - `date` (string): `2024-02-12`
  - `duration` (string): `45 min`
  - `exercises` (array): `Squats`, `Push-ups`, `Deadlifts`, `Pull-ups`, `Planks`
  - `description` (string): `A complete full-body workout focusing on compound movements. Perfect for building strength and muscle.`
  - `competitionType` (string): `none`
  - `createdAt` (timestamp): now
  - `updatedAt` (timestamp): now

### Workout 5: Cardio Blast
- **Document ID**: Auto-ID
- **Fields**:
  - `title` (string): `Cardio Blast`
  - `date` (string): `2024-02-11`
  - `duration` (string): `30 min`
  - `exercises` (array): `Running`, `Burpees`, `Jumping Jacks`, `Mountain Climbers`
  - `description` (string): `High-intensity cardio workout to get your heart pumping and burn calories.`
  - `competitionType` (string): `none`
  - `createdAt` (timestamp): now
  - `updatedAt` (timestamp): now

## Tips

- **Array fields**: Click "Add item" for each exercise
- **Timestamps**: Click the clock icon, then "Set to now"
- **Date format**: Use `YYYY-MM-DD` (e.g., `2024-02-15`)
- **Duration**: Include "min" (e.g., `45 min`)

## After Creating

1. Go to your website: `http://localhost:3000/workouts`
2. You should see all 5 workouts
3. Click on a workout with 🏆 to see the leaderboard

## Need Help?

See `CREATE_WORKOUTS.md` for more detailed instructions.

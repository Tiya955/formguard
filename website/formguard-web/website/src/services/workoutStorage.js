const KEY = "workouts";

export function getWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveWorkout(workout) {
  const all = getWorkouts();
  const entry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...workout,
  };
  localStorage.setItem(KEY, JSON.stringify([entry, ...all]));
  return entry;
}

export function deleteWorkout(id) {
  const remaining = getWorkouts().filter((w) => w.id !== id);
  localStorage.setItem(KEY, JSON.stringify(remaining));
}

export function clearWorkouts() {
  localStorage.removeItem(KEY);
}
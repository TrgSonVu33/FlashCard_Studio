export function calculateNextReview(rating, interval = 0, repetitions = 0, easeFactor = 2.5) {
  let newInterval = 0;
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;

  if (rating < 3) {
    // Answered incorrectly (Again / Hard)
    newRepetitions = 0;
    newInterval = 1; // Review tomorrow (or today)
  } else {
    // Answered correctly (Good / Easy)
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions += 1;
  }

  // Adjust Ease Factor (EF)
  // Formula: EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  const quality = rating + 1; // Map 1-4 scale to 2-5 scale for SM-2 math
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Enforce minimum Ease Factor of 1.3
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  // Calculate future due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + newInterval);

  return {
    easeFactor: parseFloat(newEaseFactor.toFixed(2)),
    intervalDays: newInterval,
    repetitions: newRepetitions,
    dueDate: dueDate.toISOString(),
  };
}
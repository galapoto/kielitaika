const DIMENSIONS = ['clarity', 'grammar', 'pronunciation', 'appropriateness'];

export function normalizeRubricDimension(value) {
  const raw = typeof value === 'string' ? value.toLowerCase().trim() : '';
  return DIMENSIONS.includes(raw) ? raw : 'clarity';
}

export function getRubricLabel(dimension) {
  switch (normalizeRubricDimension(dimension)) {
    case 'grammar':
      return 'Grammar';
    case 'pronunciation':
      return 'Pronunciation';
    case 'appropriateness':
      return 'Appropriateness';
    default:
      return 'Clarity';
  }
}

export function getRubricExplanation(dimension) {
  switch (normalizeRubricDimension(dimension)) {
    case 'grammar':
      return 'Focus on one structure at a time: copy the “Better version” once, then record again trying to match its verb form and endings (cases/particles) without adding extra words.';
    case 'pronunciation':
      return 'Aim for clearer sounds, not “perfect accent”: slow down slightly, stretch long vowels a bit, and repeat the target sentence once while keeping the same rhythm as the model.';
    case 'appropriateness':
      return 'Match the situation: use polite forms when needed and keep the tone consistent; record again using the “Better version” but swap in your own details (name/time/place) without changing register.';
    default:
      return 'Make it easy to understand: speak a little slower, separate words with tiny pauses, and record again using one short sentence that answers the prompt directly.';
  }
}


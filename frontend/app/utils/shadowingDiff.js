const extractTargetUtterance = (promptText) => {
  if (!promptText) return '';
  const quoted = promptText.match(/"([^"]+)"/);
  if (quoted?.[1]) return quoted[1].trim();

  const colon = promptText.split(':');
  if (colon.length > 1) {
    return colon
      .slice(1)
      .join(':')
      .trim()
      .replace(/^["“”']|["“”']$/g, '');
  }

  return promptText.trim();
};

const splitIntoChunks = (text) => {
  if (!text) return [];
  const cleaned = text.trim();
  const parts = cleaned
    .split(/(?<=[.!?])\s+|,\s+|;\s+|–\s+|-\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  return parts.length ? parts : [cleaned];
};

const tokenizeWords = (text) =>
  (text || '')
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}'-]/gu, '').trim())
    .filter(Boolean);

const lcsMatrix = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
};

const diffWords = (target, spoken) => {
  const targetWords = tokenizeWords(target);
  const spokenWords = tokenizeWords(spoken);
  const dp = lcsMatrix(targetWords, spokenWords);

  const targetOut = [];
  const spokenOut = [];
  let i = targetWords.length;
  let j = spokenWords.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && targetWords[i - 1].toLowerCase() === spokenWords[j - 1].toLowerCase()) {
      targetOut.unshift({ word: targetWords[i - 1], status: 'match' });
      spokenOut.unshift({ word: spokenWords[j - 1], status: 'match' });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      spokenOut.unshift({ word: spokenWords[j - 1], status: 'extra' });
      j -= 1;
    } else if (i > 0) {
      targetOut.unshift({ word: targetWords[i - 1], status: 'missing' });
      i -= 1;
    }
  }

  const matches = targetOut.filter((t) => t.status === 'match').length;
  const targetCount = Math.max(1, targetWords.length);
  const score = Math.round((matches / targetCount) * 100);

  return { targetOut, spokenOut, score, matches, targetCount };
};

module.exports = {
  extractTargetUtterance,
  splitIntoChunks,
  diffWords,
};


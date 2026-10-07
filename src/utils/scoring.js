import { destinations } from '../data/destinations';

export function getRecommendations(answers) {
  const scored = destinations.map(dest => {
    // Hard filter on region
    if (answers.region !== 'any' && dest.region !== answers.region) {
      return null;
    }

    let score = 0;

    // Budget (weight: high)
    score += (dest.scores.budget[answers.budget] || 5) * 3;

    // Priority (weight: high)
    if (answers.priority === 'community') score += dest.scores.community * 2.5;
    else if (answers.priority === 'nature') score += dest.scores.nature * 2.5;
    else if (answers.priority === 'city') score += dest.scores.city * 2.5;
    else if (answers.priority === 'mix') {
      score += (dest.scores.community + dest.scores.nature + dest.scores.city) / 3 * 2;
    }

    // Weather (weight: medium)
    if (answers.weather === 'hot') score += dest.scores.hot * 1.5;
    else if (answers.weather === 'mild') score += dest.scores.mild * 1.5;
    else score += 7; // neutral bonus

    // WiFi (weight: medium)
    if (answers.wifi === 'critical') score += dest.scores.wifi * 2;
    else if (answers.wifi === 'important') score += dest.scores.wifi * 1;
    else score += 5;

    return { ...dest, score: Math.round(score) };
  });

  return scored
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

export function getMatchReasons(dest, answers) {
  const reasons = [];

  if (answers.budget === 'low' && dest.scores.budget.low >= 8) {
    reasons.push('Excellent value for your budget');
  } else if (answers.budget === 'mid' && dest.scores.budget.mid >= 8) {
    reasons.push('Great value for your budget');
  } else if (answers.budget === 'high' && dest.scores.budget.high >= 7) {
    reasons.push('Matches your budget comfort zone');
  }

  if (answers.priority === 'community' && dest.scores.community >= 8) {
    reasons.push('Strong digital nomad community');
  } else if (answers.priority === 'nature' && dest.scores.nature >= 8) {
    reasons.push('Outstanding natural environment');
  } else if (answers.priority === 'city' && dest.scores.city >= 8) {
    reasons.push('World-class city experience');
  } else if (answers.priority === 'mix') {
    reasons.push('Well-rounded destination for all lifestyles');
  }

  if (answers.weather === 'hot' && dest.scores.hot >= 7) {
    reasons.push('Hot tropical climate you were looking for');
  } else if (answers.weather === 'mild' && dest.scores.mild >= 7) {
    reasons.push('Pleasant mild weather year-round');
  }

  if (answers.wifi === 'critical' && dest.scores.wifi >= 8) {
    reasons.push('Excellent internet infrastructure');
  }

  if (answers.region !== 'any') {
    reasons.push(`Located in ${answers.region === 'asia' ? 'Asia' : answers.region === 'europe' ? 'Europe' : 'Latin America'} as you wanted`);
  }

  return reasons.slice(0, 4);
}

const PRIORITY_LABELS = { community: 'Community', nature: 'Nature', city: 'City life', mix: 'Lifestyle mix' };

export function getMatchBreakdown(dest, answers) {
  const priorityValue = answers.priority === 'mix'
    ? Math.round((dest.scores.community + dest.scores.nature + dest.scores.city) / 3)
    : dest.scores[answers.priority] ?? 7;

  const weatherValue = answers.weather === 'hot' ? dest.scores.hot
    : answers.weather === 'mild' ? dest.scores.mild
    : 7;

  return [
    { label: 'Budget fit', value: dest.scores.budget[answers.budget] ?? 5 },
    { label: PRIORITY_LABELS[answers.priority] ?? 'Lifestyle fit', value: priorityValue },
    { label: 'Weather fit', value: weatherValue },
    { label: 'Internet quality', value: dest.scores.wifi },
  ];
}

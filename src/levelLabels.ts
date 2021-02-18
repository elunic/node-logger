import { levelLabels } from './levels';

// This enables colored aligned uppercase level labels.
const levelLabelCache: { [key: string]: string } = {};
export function levelLabel(level: string) {
  if (Object.prototype.hasOwnProperty.call(levelLabelCache, level)) {
    return levelLabelCache[level];
  }

  let label = '';
  for (const key of Object.keys(levelLabels)) {
    if (level.includes(key)) {
      label = level.replace(key, levelLabels[key]);
    }
  }

  if (!label) {
    label = level;
  }

  levelLabelCache[level] = label;
  return label;
}

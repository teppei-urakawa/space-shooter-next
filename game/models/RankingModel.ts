import { SHIP_COLORS } from '../data/ships';

const RANKING_KEY = 'galactic_striker_ranking';
const MAX_RECORDS = 10;

export interface RankRecord {
  score: number;
  colorId: string;
  colorHex: string;
  colorLabel: string;
  difficulty: string;
  date: string;
}

export function saveScore(score: number, colorId: string, difficulty: string): RankRecord[] {
  const records = getTopScores();
  const date    = new Date().toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
  const color   = SHIP_COLORS.find(c => c.id === colorId);
  records.push({
    score,
    colorId,
    colorHex:   color ? color.hex   : '#00f5ff',
    colorLabel: color ? color.label : colorId.toUpperCase(),
    difficulty,
    date,
  });
  records.sort((a, b) => b.score - a.score);
  const top = records.slice(0, MAX_RECORDS);
  localStorage.setItem(RANKING_KEY, JSON.stringify(top));
  return top;
}

export function getTopScores(): RankRecord[] {
  try {
    return JSON.parse(localStorage.getItem(RANKING_KEY) || 'null') || [];
  } catch {
    return [];
  }
}

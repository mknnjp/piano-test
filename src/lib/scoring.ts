// 採点：1問100点。1.5秒までは満点、そこから1秒ごとに10点減る（正解なら最低40点）。不正解は0点
const FULL_SEC = 1.5;
const PER_SEC = 10;
const MIN_PTS = 40;

export const pointsFor = (ok: boolean, sec: number): number => {
  if (!ok) return 0;
  return Math.max(MIN_PTS, Math.min(100, Math.round(100 - Math.max(0, sec - FULL_SEC) * PER_SEC)));
};

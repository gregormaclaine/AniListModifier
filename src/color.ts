import { type ScoreFormat } from './api';
import { get as get_settings } from './settings/content';

function lerp(x: number, a: number, b: number) {
  return a + (b - a) * x;
}

export function get_color(perc: number, saturation: number = 100) {
  return `hsl(${Math.ceil(lerp(perc, 0, 110))}, ${saturation}%, 50%)`;
}

export default function (score: number, score_format: ScoreFormat) {
  if (score === 0) return 'unset';

  const settings = get_settings();
  const max_value: { [key in ScoreFormat]: number } = {
    POINT_10: 10,
    POINT_10_DECIMAL: 10,
    POINT_100: 100,
    POINT_3: 3,
    POINT_5: 5
  };

  switch (settings.rating_colors) {
    case 'off':
      return 'unset';

    case 'custom':
      return settings.custom_colors[Math.ceil(score / max_value[score_format])];

    case 'interpolated':
      return get_color(score / max_value[score_format]);
  }
}

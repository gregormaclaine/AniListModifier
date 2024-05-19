import { type ScoreFormat } from '../api';
import rating_color from './color';
import { get as get_settings } from './settings';

export function apply_style(medialist: Element, score_format: ScoreFormat) {
  const scores = medialist.querySelectorAll<HTMLElement>('div.score');

  for (const score_el of scores) {
    const score = parseFloat(score_el.getAttribute('score')?.trim() || '');
    if (!isNaN(score) && score) {
      score_el.style.color = rating_color(score, score_format);
    }
  }
}

export function main() {
  if (get_settings().rating_colors !== 'off') {
    const media_list = document.querySelector('div.content > .medialist');
    const rating_mode =
      (media_list?.classList[2] as ScoreFormat | undefined) || null;
    if (media_list && rating_mode) apply_style(media_list, rating_mode);
  }
}

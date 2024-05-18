import { get_color } from './utils';

export type ExtensionSettings = {
  verbose: boolean;
  rating_colors: 'off' | 'interpolated' | 'custom';
  custom_colors: string[];
  interp_saturation: number;
  autoscroll: boolean;
  scored_feed: boolean;
};

export function default_settings(): ExtensionSettings {
  return {
    verbose: false,
    autoscroll: true,
    scored_feed: true,
    rating_colors: 'interpolated',
    interp_saturation: 100,
    custom_colors: Array(10)
      .fill(0)
      .map((_, i) => get_color(i / 9))
  };
}

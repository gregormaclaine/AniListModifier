export type ExtensionSettings = {
  verbose: boolean;
  rating_colors: 'off' | 'interpolated' | 'custom';
  custom_colors: string[];
  autoscroll: boolean;
  scored_feed: boolean;
};

export function default_settings(): ExtensionSettings {
  return {
    verbose: false,
    autoscroll: true,
    scored_feed: true,
    rating_colors: 'interpolated',
    custom_colors: [
      '#d22d2d',
      '#d2512d',
      '#d2722d',
      '#d2932d',
      '#d2b42d',
      '#cdd22d',
      '#acd22d',
      '#8bd22d',
      '#69d22d',
      '#48d22d'
    ]
  };
}

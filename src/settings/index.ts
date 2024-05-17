export type ExtensionSettings = {
  verbose: boolean;
};

export function default_settings(): ExtensionSettings {
  return { verbose: false };
}

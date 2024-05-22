import { default_settings, type ExtensionSettings } from '../settings';
import { is_object, labelled_log } from '../utils';

let settings = default_settings();
get_true().then(_s => {
  settings = _s;
});

export function get() {
  return settings;
}

export function get_true(): Promise<ExtensionSettings> {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'get-settings' }, resolve);
  });
}

export function set(new_settings: ExtensionSettings) {
  settings = new_settings;
  chrome.runtime.sendMessage({
    action: 'update-settings',
    value: new_settings
  });
}

export function update<T extends keyof ExtensionSettings>(
  field: T,
  value: ExtensionSettings[T]
) {
  log(`Settings.${field}: ${settings[field]} -> ${value}`);

  settings[field] = value;
  chrome.runtime.sendMessage({
    action: 'update-settings',
    value: settings
  });
}

export function log(...texts: any[]) {
  if (settings.verbose) labelled_log(...texts);
}

chrome.runtime.onMessage.addListener((message: unknown, send, sendResponse) => {
  if (!is_object(message)) return;
  const action = 'action' in message ? String(message.action) : '';
  const value = 'value' in message ? (message.value as any) : null;

  switch (action) {
    case 'refresh-settings':
      settings = value;

    default:
      return;
  }
});

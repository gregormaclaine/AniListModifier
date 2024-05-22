import { default_settings, type ExtensionSettings } from '../settings';
import { is_object, labelled_log } from '../utils';

let settings = default_settings();
get_true().then(_s => {
  settings = _s;
});

export function get() {
  return settings;
}

export async function get_true(): Promise<ExtensionSettings> {
  return await secure_message('get-settings');
}

export async function set(new_settings: ExtensionSettings) {
  settings = new_settings;
  return await secure_message('update-settings', new_settings);
}

export async function update<T extends keyof ExtensionSettings>(
  field: T,
  value: ExtensionSettings[T]
) {
  log(`Settings.${field}: ${settings[field]} -> ${value}`);

  if (settings) {
    settings[field] = value;
  } else {
    settings = { ...default_settings(), [field]: value };
  }
  return await secure_message('update-settings', settings);
}

export function is_error_invalid_extension(e: unknown) {
  return e instanceof Error && e.message === 'Extension context invalidated.';
}

async function secure_message(action: string, value: any = null) {
  try {
    return await chrome.runtime.sendMessage({ action, value });
  } catch (e) {
    if (is_error_invalid_extension(e)) {
      alert('AniList Modifier extension context is invalid. Please Refresh.');
      return false;
    } else {
      throw e;
    }
  }
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

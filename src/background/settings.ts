import { default_settings, ExtensionSettings } from '../settings';
import { is_object, labelled_log } from '../utils';

function fill_settings(settings: unknown): ExtensionSettings {
  if (!is_object(settings))
    throw Error('Saved extension settings are not an object');

  return { ...default_settings(), ...settings };
}

type SettingsRequest =
  | {
      action: 'update-settings';
      value: ExtensionSettings;
    }
  | { action: 'get-settings' };

export default function (
  request: SettingsRequest,
  sendResponse: (response: ExtensionSettings) => void
) {
  switch (request.action) {
    case 'update-settings':
      chrome.storage.local.set({
        animod_settings: JSON.stringify(request.value)
      });

      chrome.tabs
        .query({ active: true, lastFocusedWindow: true })
        .then(([tab]) => {
          if (!tab || !tab.id) return;
          chrome.tabs.sendMessage(tab.id, {
            action: 'refresh-settings',
            value: request.value
          });
        });

      return;

    case 'get-settings':
      chrome.storage.local.get('animod_settings', ({ animod_settings }) => {
        let settings: ExtensionSettings;

        try {
          settings = fill_settings(JSON.parse(animod_settings));
        } catch (e) {
          labelled_log(
            'Error: Failed to parse settings - choosing defaults instead'
          );
          console.log(e);
          settings = default_settings();
        }

        sendResponse(settings);
      });
      return true;
    default:
      return;
  }
}

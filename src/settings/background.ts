import { default_settings, ExtensionSettings } from '.';
import { labelled_log } from '../utils';

function fill_settings(x: unknown): ExtensionSettings {
  if (typeof x !== 'object' || Array.isArray(x) || x === null)
    throw Error('Saved extension settings are not an object');

  return { ...default_settings(), ...x };
}

export default function () {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'update-settings':
        chrome.storage.local.set({
          animod_settings: JSON.stringify(request.value)
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
  });
}

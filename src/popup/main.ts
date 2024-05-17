import {
  get_true as get_settings,
  update as update_setting
} from '../settings/content';

const checkbox = document.getElementById(
  'dev-mode-checkbox'
) as HTMLInputElement;

get_settings().then(({ verbose }) => {
  checkbox.checked = !!verbose;

  checkbox.addEventListener('change', () => {
    update_setting('verbose', checkbox.checked);

    // Reload active tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0].id) chrome.tabs.reload(tabs[0].id);
    });
  });
});

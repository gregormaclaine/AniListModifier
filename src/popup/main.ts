const checkbox = document.getElementById(
  'dev-mode-checkbox'
) as HTMLInputElement;

chrome.runtime.sendMessage({ action: 'is-developer-mode' }, dev_mode => {
  checkbox.checked = !!dev_mode;

  checkbox.addEventListener('change', () => {
    chrome.runtime.sendMessage({
      action: 'set-developer-mode',
      value: checkbox.checked
    });

    // Reload active tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0].id) chrome.tabs.reload(tabs[0].id);
    });
  });
});

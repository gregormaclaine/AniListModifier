const checkbox = document.getElementById('dev-mode-checkbox');

chrome.runtime.sendMessage({ action: 'is-developer-mode' }, dev_mode => {
  checkbox.checked = !!dev_mode;

  checkbox.addEventListener('change', () => {
    chrome.runtime.sendMessage({
      action: 'set-developer-mode',
      value: checkbox.checked
    });

    // Reload active tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      console.log('Reloading current page...');

      chrome.tabs
        .sendMessage(tabs[0].id, { action: 'please-reload' })
        .catch(e => {
          console.log(
            'Failed to reload page: likely due to page running on previous instance of extension'
          );
          console.log(e);
        });
    });
  });
});

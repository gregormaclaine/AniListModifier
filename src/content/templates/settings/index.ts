import { render } from 'solid-js/web';
import { log } from '../../settings';
import App from './insert';

const ELID = 'animod-settings-insert';

function attach_settings() {
  const content_el = document.querySelector('div.content');
  if (!content_el) return;

  const existing_insert = document.getElementById(ELID);
  if (existing_insert) existing_insert.remove();

  if (!location.href.includes('/settings/apps')) return;

  const element = document.createElement('div');
  element.id = ELID;
  content_el.appendChild(element);
  render(App, element);
  log('Successfully attached extension settings');
}

window.addEventListener('load', () => {
  attach_settings();

  let current_url = location.href;

  const observer = new MutationObserver(mutationsList => {
    if (current_url !== location.href) {
      attach_settings();
      current_url = location.href;
    }
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true
  });
});

import { render } from 'solid-js/web';
import { log } from '../../settings';
import App from './insert';

function attach_insert() {
  if (!location.href.match(/anilist\.co\/user\/[^\/]+\/animelist\/compare\/?$/))
    return;

  const content_el = document.querySelector('div.content');
  if (!content_el) return;
  for (const child of content_el.children) child.remove();

  const element = document.createElement('div');
  content_el.appendChild(element);
  render(App, element);
  log('Successfully attached comparison insert');
}

window.addEventListener('load', () => {
  attach_insert();

  let current_url = location.href;

  const observer = new MutationObserver(mutationsList => {
    if (current_url !== location.href) {
      attach_insert();
      current_url = location.href;
    }
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true
  });
});

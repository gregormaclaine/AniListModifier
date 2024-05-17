import { render } from 'solid-js/web';
import { labelled_log, listen_for_url_change } from '../../utils';
import App from './insert';

const ELID = 'animod-settings-insert';

function attach_settings() {
  const content_el = document.querySelector('div.content');
  if (!content_el)
    return labelled_log(
      'Error: Could not find content div to attach settings to'
    );

  const existing_insert = document.getElementById(ELID);
  if (existing_insert) existing_insert.remove();

  if (!location.href.includes('/settings/apps')) return;

  labelled_log('Inserting Extension Settings');
  const element = document.createElement('div');
  element.id = ELID;
  content_el.appendChild(element);
  render(App, element);
}

listen_for_url_change(() => attach_settings());
window.addEventListener('load', attach_settings);

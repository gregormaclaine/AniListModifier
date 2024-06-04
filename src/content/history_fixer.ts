import { is_error_invalid_extension, log } from './settings';

type History = {
  day: Date;
  unique_shows: number;
  episodes: number;
};

async function get_data(
  username: string,
  start: number,
  end: number
): Promise<History[] | null> {
  try {
    return await chrome.runtime.sendMessage('', {
      action: 'fetch-history',
      value: { username, start, end }
    });
  } catch (e) {
    if (is_error_invalid_extension(e as Error)) {
      log('Extension out of sync: consider reloading to fix issue');
    } else {
      log("Couldn't connect to server");
      console.log(e);
    }
    return null;
  }
}

export async function main() {
  const history_el = document.querySelector('div.activity-history');
  if (!history_el) return;

  const username = document
    .querySelector('.banner-content .name')
    ?.textContent?.trim();
  if (!username) {
    log('Error: Could not find username on page');
    return;
  }

  const now = new Date().getTime();
  const end = now - (now % 86400000);
  const start = end - history_el.children.length * 86400000;

  const data = await get_data(username, start, end);
  if (!data) {
    log('Error: Could not get activity history');
    return;
  }

  console.log(data);
}

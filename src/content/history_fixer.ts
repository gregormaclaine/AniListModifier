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

/**
 * Gets the tooltip for history as it is the only tooltip that doesn't only have
 * text in the body of the tooltip. There is also a small dot.
 */
function get_history_tooltip(): HTMLElement | null {
  return (
    [...document.querySelectorAll<HTMLElement>('#app div.tooltip')].filter(el =>
      el.querySelector('.content > div')
    )[0] || null
  );
}

function set_tooltip_content(tooltip: HTMLElement, dot: History) {
  const prev_content = tooltip.querySelector<HTMLElement>('div.content');
  //   if (prev_content) prev_content.style.display = 'none';

  let custom_content = tooltip.querySelector<HTMLElement>('div.animod-content');
  if (!custom_content) {
    custom_content = document.createElement('div');
    custom_content.classList.add('animod-content');
    tooltip.appendChild(custom_content);
  }

  custom_content.innerHTML = `
    ${new Date(dot.day).toLocaleDateString()}<br />
    ${dot.episodes} Episodes Watched<br />
    From ${dot.unique_shows} Unique Anime<br />
    ${dot.activity.length} Activities
  `;
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

  const max_activity = Math.max(...data.map(a => a.episodes));

  for (let i = 0; i < history_el.childElementCount; i++) {
    const dot_el = history_el.children[i];

    dot_el.classList.add('lv-1');
    dot_el.addEventListener('mouseenter', e => {
      e.preventDefault();
      const tooltip = get_history_tooltip();
      if (tooltip) set_tooltip_content(tooltip, data[i]);
    });
  }
}

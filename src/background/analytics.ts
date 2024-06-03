import { labelled_log } from '../utils';

async function capture_event(event: string) {
  const [id, is_new] = await identify();

  if (is_new) await capture_event('track new user');

  const body = {
    api_key: '<api-key>',
    event: event,
    properties: {
      distinct_id: id,
      version: process.env.VERSION
    }
  };

  return await fetch('https://eu.i.posthog.com/capture/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function identify(): Promise<[string, boolean]> {
  const { animod_id } = await chrome.storage.local.get('animod_id');
  if (animod_id) return [animod_id, false];

  labelled_log('No identifier found - creating new one...');
  const uuid = crypto.randomUUID();
  await chrome.storage.local.set({ animod_id: uuid });
  return [uuid, true];
}

function get_time_interval_id(interval_minutes: number = 10) {
  const id = Math.floor(new Date().getTime() / 1000 / 60 / interval_minutes);
  return `${interval_minutes}-${id}`;
}

export async function on_fetch_scores() {
  let { animod_on_scores_cooldown: last } = await chrome.storage.local.get(
    'animod_on_scores_cooldown'
  );

  if (!last || last !== get_time_interval_id()) {
    await chrome.storage.local.set({
      animod_on_scores_cooldown: get_time_interval_id()
    });
    await capture_event('fetch scores');
  }
}

export async function on_update_settings() {
  await capture_event('update settings');
}

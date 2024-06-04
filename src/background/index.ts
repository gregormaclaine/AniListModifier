import handle_settings_requests from './settings';
import { is_object } from '../utils';
import { type FeedItem } from '../types';
import { get_scores_for_media_set } from './api/queries/get_scores';
import { get_rate_limit_info } from './api/api';
import { get_activity_history } from './api/queries/get_history';

const gather_info = async (feed_items: FeedItem[]) => {
  feed_items = feed_items.filter(f => f);

  const usernames: string[] = [];
  for (const { user } of feed_items) {
    if (!usernames.includes(user)) usernames.push(user);
  }

  const all_data = await Promise.all(
    usernames.map(async username => {
      const { data, score_format } = await get_scores_for_media_set(
        username,
        feed_items.filter(f => f.user === username).map(f => f.id)
      );

      return data.map(r => ({ user: username, score_format, ...r }));
    })
  );

  let [api_calls_left, api_calls_total] = get_rate_limit_info();
  return { scores: all_data.flat(), api_calls_left, api_calls_total };
};

chrome.runtime.onMessage.addListener(
  (request: unknown, sender, sendResponse) => {
    if (!is_object(request)) return;
    const action = 'action' in request ? String(request.action) : '';
    const value = 'value' in request ? (request.value as any) : null;

    switch (action) {
      case 'fetch-scores':
        gather_info(value).then(sendResponse);
        return true;

      case 'fetch-history':
        get_activity_history(value.username, value.start, value.end).then(
          sendResponse
        );
        return true;

      case 'get-settings':
      case 'update-settings':
        return handle_settings_requests({ action, value }, sendResponse);
      default:
        return;
    }
  }
);

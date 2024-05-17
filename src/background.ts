import { get_scores_for_media_set, FeedItem, get_rate_limit_info } from './api';
import settings_listener from './settings/background';

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'fetch-scores':
      gather_info(request.feed_items).then(sendResponse);
      return true;
    default:
      return;
  }
});

settings_listener();

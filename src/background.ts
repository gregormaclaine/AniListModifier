import { sendgql, FeedItem } from './api';

const gather_info = async (feed_items: FeedItem[]) => {
  feed_items = feed_items.filter(f => f);

  const usernames: string[] = [];
  for (const { user } of feed_items) {
    if (!usernames.includes(user)) usernames.push(user);
  }

  let api_calls_left = Infinity;
  let api_calls_total = 0;

  const all_data = await Promise.all(
    usernames.map(async username => {
      const {
        data,
        score_format,
        api_calls_left: acl,
        api_calls_total: act
      } = await sendgql(
        username,
        feed_items.filter(f => f.user === username).map(f => f.id)
      );

      if (acl >= 0) api_calls_left = Math.min(api_calls_left, acl);
      if (act >= 0) api_calls_total = act;

      return data.map(r => ({ user: username, score_format, ...r }));
    })
  );

  return { scores: all_data.flat(), api_calls_left, api_calls_total };
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'fetch-scores':
      gather_info(request.feed_items).then(sendResponse);
      return true;
    case 'is-developer-mode':
      chrome.storage.local.get('dev_mode', ({ dev_mode }) =>
        sendResponse(dev_mode)
      );
      return true;
    case 'set-developer-mode':
      chrome.storage.local.set({ dev_mode: !!request.value });
      return;
    default:
      return;
  }
});

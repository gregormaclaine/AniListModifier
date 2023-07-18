type ScoreFormat =
  | 'POINT_10'
  | 'POINT_10_DECIMAL'
  | 'POINT_100'
  | 'POINT_5'
  | 'POINT_3';

type ScoreResponse = {
  Page: {
    mediaList: {
      score: number;
      media: { id: number };
      user: {
        mediaListOptions: { scoreFormat: ScoreFormat };
      };
    }[];
  };
};

type JSONResponse<T> =
  | {
      data: T;
      errors: null;
    }
  | {
      data: null;
      errors: { message: string; status: number }[];
    };

type ScoreResult = { id: number; score: number };

const sendgql = async (username: string, mediaIds: number[]) => {
  console.log('Calling api for', username, mediaIds);
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      variables: { username, mediaIds },
      query: `
          query GetMediaScore($username: String, $mediaIds: [Int]) {
            Page(page: 1) {
              mediaList(userName: $username, mediaId_in: $mediaIds) {
                score
                media { id }
                user {
                  mediaListOptions { scoreFormat }
                }
              }
            }
          }
        `
    })
  });

  const { data, errors }: JSONResponse<ScoreResponse> = await res.json();

  let result: ScoreResult[],
    api_calls_left: number,
    api_calls_total: number,
    score_format: ScoreFormat;

  if (errors) {
    if (errors[0].status !== 404) throw new Error(errors[0].message);

    result = [];
    api_calls_left = -1;
    api_calls_total = -1;
    score_format = 'POINT_10';
  } else {
    result = data.Page.mediaList.map(item => ({
      id: item.media.id,
      score: item.score
    }));
    score_format = data.Page.mediaList[0]?.user.mediaListOptions.scoreFormat;
    api_calls_left = parseInt(res.headers.get('x-ratelimit-remaining') || '-1');
    api_calls_total = parseInt(res.headers.get('x-ratelimit-limit') || '-1');
  }

  return { data: result, api_calls_left, api_calls_total, score_format };
};

type FeedItem = {
  user: string;
  id: number;
};

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

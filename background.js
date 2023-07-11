const sendgql = async (username, mediaIds) => {
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

  const { data, errors } = await res.json();

  if (errors) {
    if (errors[0].status === 404) return { data: [] };
    throw new Error(errors[0].message);
  }

  return {
    data: data.Page.mediaList.map(item => ({
      id: item.media.id,
      score: item.score
    })),
    score_format: data.Page.mediaList[0]?.user.mediaListOptions.scoreFormat,
    api_calls_left: parseInt(res.headers.get('x-ratelimit-remaining')),
    api_calls_total: parseInt(res.headers.get('x-ratelimit-limit'))
  };
};

const gather_info = async feed_items => {
  feed_items = feed_items.filter(f => f);

  const usernames = [];
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

      if (acl) api_calls_left = Math.min(api_calls_left, acl);
      if (act) api_calls_total = act;

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
    default:
      return;
  }
});

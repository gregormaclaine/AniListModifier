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
              mediaList(userName: $username, status_in: [COMPLETED, DROPPED], mediaId_in: $mediaIds) {
                score
                media { id }
              }
            }
          }
        `
    })
  });

  // const total = parseInt(res.headers.get('x-ratelimit-limit'));
  // const remaining = parseInt(res.headers.get('x-ratelimit-remaining'));

  const { data, errors } = await res.json();

  if (errors) {
    if (errors[0].status === 404) return null;
    throw new Error(errors[0].message);
  }

  return data.Page.mediaList.map(item => ({
    id: item.media.id,
    score: item.score
  }));
};

const gather_info = async feed_items => {
  feed_items = feed_items.filter(f => f);

  const usernames = [];
  for (const { user } of feed_items) {
    if (!usernames.includes(user)) usernames.push(user);
  }

  const all_data = await Promise.all(
    usernames.map(async username => {
      const results = await sendgql(
        username,
        feed_items.filter(f => f.user === username).map(f => f.id)
      );
      return results.map(r => ({ user: username, ...r }));
    })
  );

  return all_data.flat();
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'fetch-scores':
      gather_info(request.feed_items).then(result_data =>
        sendResponse(result_data)
      );
      return true;
    default:
      return;
  }
});

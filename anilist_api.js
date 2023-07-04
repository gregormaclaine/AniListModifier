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

// gather_info([
//   {
//     user: 'KAPPAMAC',
//     id: '128893'
//   },
//   {
//     user: 'JezzaCh',
//     id: '150672'
//   },
//   {
//     user: 'KAPPAMAC',
//     id: '131518'
//   },
//   {
//     user: 'KAPPAMAC',
//     id: '155783'
//   },
//   {
//     user: 'SimbaNinja',
//     id: '2904'
//   }
// ]).then(console.log);

module.exports = gather_info;

async function local_api_call(feed_items) {
  try {
    const res = await fetch('http://localhost:3000/get_scores_for_feed', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(feed_items)
    });
    return await res.json();
  } catch (e) {
    console.error("Couldn't connect to server");
    console.error(e);
    return [];
  }
}

async function background_api_call(feed_items) {
  try {
    return await chrome.runtime.sendMessage('', {
      action: 'fetch-scores',
      feed_items
    });
  } catch (e) {
    console.error("Couldn't connect to server");
    console.error(e);
    return [];
  }
}

const update_feed_items = feed_items => {
  feed_items = feed_items
    .filter(f => {
      const status_text = f.querySelector('.status').innerText;
      return (
        status_text.startsWith('Completed') ||
        status_text.startsWith('Dropped') ||
        status_text.startsWith('Rewatched')
      );
    })
    .map(f => ({
      user: f.querySelector('.name').innerText,
      id: parseInt(
        f
          .querySelector('a.cover')
          .href.split(/anilist\.co\/(anime|manga)\//)[2]
          .split('/')[0]
      ),
      status_el: f.querySelector('.status')
    }));

  if (!feed_items.length) return;
  console.log('Updating', feed_items.length, 'feed items...');

  background_api_call(feed_items).then(scores =>
    scores.forEach(({ user, id, score }) => {
      const status_el = feed_items.find(
        fi => fi.user === user && fi.id === id
      ).status_el;

      if (score) {
        status_el.innerHTML += ` and rated it a${
          score >= 8 && score < 9 ? 'n' : ''
        } <b>${score}</b>.`;
      } else {
        status_el.innerHTML += ` without rating it.`;
      }
    })
  );
};

(() => {
  console.log('Loading Anilist Modifier Extension...');
  update_feed_items([...document.querySelector('.activity-feed').children]);

  const observer = new MutationObserver(mutationsList => {
    const new_feed_items = [];

    for (const mutation of mutationsList) {
      if (mutation.type == 'childList') {
        new_feed_items.push(
          ...[...mutation.addedNodes].filter(
            new_node =>
              new_node.classList &&
              (new_node.classList.contains('activity-anime_list') ||
                new_node.classList.contains('activity-manga_list'))
          )
        );
      }
    }

    if (new_feed_items.length) update_feed_items(new_feed_items);
  });

  observer.observe(document.querySelector('.activity-feed'), {
    attributes: true,
    childList: true,
    subtree: true
  });
})();

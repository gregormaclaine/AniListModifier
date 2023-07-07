(() => {
  function styled_log(...texts) {
    console.log(
      '%cAniList Modifier%c ' + texts.join(' '),
      'background-color: #DD4124; border-radius: 5px; padding: 0.2em 0.3em; color: white; font-family: Verdana;',
      ''
    );
  }

  async function background_api_call(feed_items) {
    try {
      return await chrome.runtime.sendMessage('', {
        action: 'fetch-scores',
        feed_items
      });
    } catch (e) {
      styled_log("Couldn't connect to server");
      console.error(e);
      return [];
    }
  }

  function update_feed_items(feed_items) {
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

    background_api_call(feed_items).then(
      ({ scores, api_calls_left, api_calls_total }) => {
        styled_log(
          `Updating ${feed_items.length} feed items... (${api_calls_left}/${api_calls_total} API calls remaining)`
        );

        scores.forEach(({ user, id, score }) => {
          const status_el = feed_items.find(
            fi => fi.user === user && fi.id === id
          ).status_el;

          const mod = document.createElement('span');
          mod.classList.add('score-info');

          if (score) {
            mod.innerHTML += ` and rated it a${
              score >= 8 && score < 9 ? 'n' : ''
            } <b>${score}</b>.`;
          } else {
            mod.innerHTML += ` without rating it.`;
          }
          status_el.appendChild(mod);
        });
      }
    );
  }

  function should_node_be_modded(node) {
    if (!node.classList) return false;

    if (
      !node.classList.contains('activity-anime_list') &&
      !node.classList.contains('activity-manga_list')
    )
      return false;

    return !node.querySelector('.status > span.score-info');
  }

  function get_top_feed_item_hash() {
    const el = document.querySelector('.activity-feed').children[0];
    if (!el) return '';

    return (
      el.querySelector('a.cover').href +
      ' ' +
      el.querySelector('a.name').innerText +
      ' ' +
      el.querySelector('div.status').innerText
    );
  }

  function reset_modifications() {
    [...document.querySelectorAll('.activity-feed span.score-info')].forEach(
      el => el.remove()
    );
    update_feed_items([...document.querySelector('.activity-feed').children]);
  }

  function main() {
    styled_log('Loading Extension...');
    update_feed_items([...document.querySelector('.activity-feed').children]);

    let previous_top_item_hash = get_top_feed_item_hash();

    const observer = new MutationObserver(mutationsList => {
      // When the feed does an auto update, it does not add a new element to
      // the div, instead it just updates all the inner div attributes, however since
      // the status texts have been updated, some are fixed incorrectly.
      // Therefore to fix this, check if the top most feed item has changed.
      const new_hash = get_top_feed_item_hash();

      if (previous_top_item_hash === new_hash) {
        const new_feed_items = [];

        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            new_feed_items.push(
              ...[...mutation.addedNodes].filter(should_node_be_modded)
            );
          }
        }

        if (new_feed_items.length) update_feed_items(new_feed_items);
      } else {
        reset_modifications();
      }

      previous_top_item_hash = new_hash;
    });

    observer.observe(document.querySelector('.activity-feed'), {
      attributes: true,
      childList: true,
      subtree: true
    });
  }

  main();
})();

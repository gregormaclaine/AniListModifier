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

  function is_feed_item(feed_item) {
    return (
      feed_item.classList &&
      feed_item.classList.contains('activity-entry') &&
      (feed_item.classList.contains('activity-manga_list') ||
        feed_item.classList.contains('activity-anime_list'))
    );
  }

  function get_scorable_feed_items(feed_item_els) {
    return feed_item_els.filter(f => {
      if (!is_feed_item(f)) return false;

      const status_text = f.querySelector('.status').innerText;
      return (
        status_text.startsWith('Completed') ||
        status_text.startsWith('Dropped') ||
        status_text.startsWith('Rewatched')
      );
    });
  }

  function parse_feed_items(feed_item_els) {
    return feed_item_els.map(f => ({
      user: f.querySelector('.name').innerText.trim(),
      id: parseInt(
        f
          .querySelector('a.cover')
          .href.split(/anilist\.co\/(anime|manga)\//)[2]
          .split('/')[0]
      ),
      status_el: f.querySelector('.status')
    }));
  }

  /**
   * Returns whether you should use 'a' or 'an' etc.
   * @param {number} score
   */
  function get_score_article(score) {
    if (score >= 8 && score < 9) return 'an';
    if (score >= 80 && score < 90) return 'an';
    return 'a';
  }

  function update_status_with_score(status_el, score) {
    const mod = document.createElement('span');
    mod.classList.add('score-info');

    if (score) {
      const article = get_score_article(score);
      mod.innerHTML += ` and rated it ${article} <b>${score}</b>.`;
    } else {
      mod.innerHTML += ` without rating it.`;
    }

    status_el.appendChild(mod);
  }

  async function update_feed_items(feed_item_els) {
    feed_items = get_scorable_feed_items(feed_item_els);
    const feed_items = parse_feed_items(feed_item_els);

    if (!feed_items.length) return;

    const { scores, api_calls_left, api_calls_total } =
      await background_api_call(feed_items);

    styled_log(
      `Updating ${feed_items.length} feed items... (${api_calls_left}/${api_calls_total} API calls remaining)`
    );

    scores.forEach(({ user, id, score }) => {
      const status_el = feed_items.find(
        fi => fi.user === user && fi.id === id
      ).status_el;

      update_status_with_score(status_el, score);
    });
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
      el.querySelector('a.name').innerText.trim() +
      ' ' +
      el.querySelector('div.status').innerText.trim()
    );
  }

  function reset_modifications() {
    [...document.querySelectorAll('.activity-feed span.score-info')].forEach(
      el => el.remove()
    );
    main_until_success();
  }

  function listen_for_url_change(callback, interval = 100) {
    let current_url = window.location.href;
    setInterval(() => {
      const new_url = window.location.href;
      if (current_url !== new_url) {
        styled_log('Navigated to ' + new_url);
        current_url = new_url;
        callback();
      }
    }, interval);
  }

  let observer;

  async function main() {
    if (!document.querySelector('.activity-feed')) return false;

    if (observer) observer.disconnect();

    await update_feed_items([
      ...document.querySelector('.activity-feed').children
    ]);

    let previous_top_item_hash = get_top_feed_item_hash();

    observer = new MutationObserver(mutationsList => {
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

        if (new_feed_items.length)
          update_feed_items(new_feed_items).then(
            () => (previous_top_item_hash = get_top_feed_item_hash())
          );
      } else {
        observer.disconnect();
        reset_modifications();
      }
    });

    observer.observe(document.querySelector('.activity-feed'), {
      attributes: true,
      childList: true,
      subtree: true
    });

    return true;
  }

  function main_until_success(delay = 100, max_tries = 5) {
    styled_log('Loading extension...');
    let tries = 0;

    const func = async () => {
      tries++;
      const result = await main({ try: tries });
      if (result)
        return styled_log(`Successfully loaded extension (Attempt ${tries})`);
      if (tries < max_tries) return setTimeout(func, delay);
      styled_log(`Failed to load extension (Failed Attempts: ${tries})`);
    };

    func();
  }

  listen_for_url_change(main_until_success);
  window.addEventListener('load', () => main_until_success());
})();

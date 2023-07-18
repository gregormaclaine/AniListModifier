(() => {
  const FACE_SVGS = {
    1: `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="frown" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-frown fa-w-16 fa-lg"><path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-64c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm-80 128c-40.2 0-78 17.7-103.8 48.6-8.5 10.2-7.1 25.3 3.1 33.8 10.2 8.4 25.3 7.1 33.8-3.1 16.6-19.9 41-31.4 66.9-31.4s50.3 11.4 66.9 31.4c8.1 9.7 23.1 11.9 33.8 3.1 10.2-8.5 11.5-23.6 3.1-33.8C326 321.7 288.2 304 248 304z" class=""></path></svg>`,
    2: `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="meh" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-meh fa-w-16 fa-lg"><path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-64c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm8 144H160c-13.2 0-24 10.8-24 24s10.8 24 24 24h176c13.2 0 24-10.8 24-24s-10.8-24-24-24z" class=""></path></svg>`,
    3: `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="smile" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-smile fa-w-16 fa-lg"><path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm4 72.6c-20.8 25-51.5 39.4-84 39.4s-63.2-14.3-84-39.4c-8.5-10.2-23.7-11.5-33.8-3.1-10.2 8.5-11.5 23.6-3.1 33.8 30 36 74.1 56.6 120.9 56.6s90.9-20.6 120.9-56.6c8.5-10.2 7.1-25.3-3.1-33.8-10.1-8.4-25.3-7.1-33.8 3.1z" class=""></path></svg>`
  };

  const STAR_SVG = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-star fa-w-18"><path fill="currentColor" d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" class=""></path></svg>`;

  const extension_state = { VERBOSE: true };
  chrome.runtime.sendMessage(
    { action: 'is-developer-mode' },
    (dev_mode: boolean) => {
      extension_state.VERBOSE = dev_mode;
    }
  );

  function styled_log(...texts: string[]) {
    if (!extension_state.VERBOSE) return;
    console.log(
      '%cAniList Modifier%c ' + texts.join(' '),
      'background-color: #DD4124; border-radius: 5px; padding: 0.2em 0.3em; color: white; font-family: Verdana;',
      ''
    );
  }

  function is_error_invalid_extension(e: Error) {
    return e.message === 'Extension context invalidated.';
  }

  async function background_api_call(feed_items: FeedItem[]): Promise<{
    scores: {
      id: number;
      score: number;
      user: string;
      score_format: ScoreFormat;
    }[];
    api_calls_left: number;
    api_calls_total: number;
    score_format: ScoreFormat;
  }> {
    try {
      return await chrome.runtime.sendMessage('', {
        action: 'fetch-scores',
        feed_items
      });
    } catch (e) {
      if (is_error_invalid_extension(e as Error)) {
        // Error was caused by the tab and the background script being
        // out of sync. This happens when the extension is reloaded while
        // the current tab is still running a previous load's injection script.
        styled_log('Extension out of sync: consider reloading to fix issue');
      } else {
        styled_log("Couldn't connect to server");
        console.error(e);
      }
      return {
        scores: [],
        api_calls_left: 0,
        api_calls_total: 0,
        score_format: 'POINT_10'
      };
    }
  }

  function is_feed_item(feed_item: Node): feed_item is HTMLElement {
    return (
      feed_item instanceof Element &&
      feed_item.classList.contains('activity-entry') &&
      (feed_item.classList.contains('activity-manga_list') ||
        feed_item.classList.contains('activity-anime_list'))
    );
  }

  function get_scorable_feed_items(feed_item_els: Node[]) {
    return feed_item_els.filter((f): f is HTMLElement => {
      if (!is_feed_item(f)) return false;

      const el = f.querySelector<HTMLElement>('.status');
      const main_status_text = el?.childNodes[0].textContent?.trim() || '';
      return ['Completed', 'Dropped', 'Rewatched', 'Reread'].includes(
        main_status_text
      );
    });
  }

  function parse_feed_items(feed_item_els: HTMLElement[]) {
    return feed_item_els.map(f => ({
      user: f.querySelector<HTMLElement>('.name')?.innerText.trim() as string,
      id: parseInt(
        (f.querySelector('a.cover') as HTMLAnchorElement).href
          .split(/anilist\.co\/(anime|manga)\//)[2]
          .split('/')[0]
      ),
      status_el: f.querySelector('.status') as HTMLElement
    }));
  }

  /**
   * Returns whether you should use 'a' or 'an' etc.
   * @param {number} score
   */
  function get_score_article(score: number) {
    if (score >= 8 && score < 9) return 'an';
    if (score >= 80 && score < 90) return 'an';
    return 'a';
  }

  function update_status_with_score(
    status_el: HTMLElement,
    score: number,
    score_format: ScoreFormat
  ) {
    const mod = document.createElement('span');
    mod.classList.add('score-info');
    status_el.appendChild(mod);

    if (!score) {
      mod.innerHTML += ` without rating it`;
      return;
    }

    const article = get_score_article(score);
    switch (score_format) {
      case 'POINT_10':
      case 'POINT_10_DECIMAL':
        mod.innerHTML += ` and rated it ${article} <b>${score}</b>`;
        return;
      case 'POINT_100':
        mod.innerHTML += ` and rated it ${article} <b>${score}/100</b>`;
        return;
      case 'POINT_5':
        mod.innerHTML += ` and gave it ${score} ` + STAR_SVG;
        return;
      case 'POINT_3':
        mod.innerHTML +=
          ` and gave it a &nbsp;` + FACE_SVGS[score as 1 | 2 | 3];
        return;
    }
  }

  async function update_feed_items(feed_item_els: Node[]) {
    const scorable__els = get_scorable_feed_items(feed_item_els);
    const feed_items = parse_feed_items(scorable__els);

    if (!feed_items.length) return;

    const { scores, api_calls_left, api_calls_total } =
      await background_api_call(feed_items);
    if (!scores.length) return;

    styled_log(
      `Updating ${scores.length} feed items... (${api_calls_left}/${api_calls_total} API calls remaining)`
    );

    scores.forEach(({ user, id, score, score_format }) => {
      const status_el = feed_items.find(
        fi => fi.user === user && fi.id === id
      )?.status_el;

      if (status_el) update_status_with_score(status_el, score, score_format);
    });
  }

  function should_node_be_modded(node: Node) {
    if (!(node instanceof Element)) return false;

    if (
      !node.classList.contains('activity-anime_list') &&
      !node.classList.contains('activity-manga_list')
    )
      return false;

    return !node.querySelector('.status > span.score-info');
  }

  function get_top_feed_item_hash() {
    const el = document.querySelector('.activity-feed')?.children[0];
    if (!el) return '';

    return (
      el.querySelector<HTMLAnchorElement>('a.cover')?.href +
      ' ' +
      el.querySelector<HTMLAnchorElement>('a.name')?.innerText.trim() +
      ' ' +
      el.querySelector<HTMLElement>('div.status')?.innerText.trim()
    );
  }

  function reset_modifications() {
    [...document.querySelectorAll('.activity-feed span.score-info')].forEach(
      el => el.remove()
    );
    main_until_success();
  }

  function listen_for_url_change(callback: () => void, interval = 100) {
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

  let observer: MutationObserver;

  async function main() {
    const activity_feed = document.querySelector('.activity-feed');
    if (!activity_feed) return false;

    if (observer) observer.disconnect();

    await update_feed_items([...activity_feed.children]);

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

    observer.observe(activity_feed, {
      attributes: true,
      childList: true,
      subtree: true
    });

    return true;
  }

  function main_until_success(delay = 100, max_tries = 5) {
    styled_log('Loading extension...');
    let tries = 0;

    const func = async (): Promise<void> => {
      tries++;
      const result = await main();
      if (result)
        return void styled_log(
          `Successfully attached extension (Attempt ${tries})`
        );
      if (tries < max_tries) return void setTimeout(func, delay);
      styled_log(`Failed to load extension (Failed Attempts: ${tries})`);
    };

    func();
  }

  listen_for_url_change(main_until_success);
  window.addEventListener('load', () => main_until_success());
})();

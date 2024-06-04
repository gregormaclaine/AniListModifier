import { get as get_settings, log } from './settings';
import { main as update_feed, reset as reset_feed } from './scored_feed';
import { main as color_list } from './colored_list';
import { main as update_history } from './history_fixer';

function scroll_to_top_if_feed_is_empty() {
  if (!get_settings().autoscroll) return;

  const wrapper_el = document.querySelector('.activity-feed-wrap');
  if (!wrapper_el) return;

  const feed = wrapper_el.querySelector('div.activity-feed')?.children;
  const scroller = wrapper_el.querySelector('div.scroller')?.children;
  if (!feed || !scroller) return;

  if (feed.length === 0 && scroller.length == 0) {
    log('Scrolling to top of page to trigger feed refresh');
    window.scrollTo(0, 0);
  }
}

let observer: MutationObserver;

function main() {
  let current_url = location.href;

  let activity_feed = document.querySelector('.activity-feed');
  if (activity_feed && get_settings().scored_feed) {
    update_feed(activity_feed).then(() =>
      log('Successfully attached extension')
    );
  }

  color_list();

  if (current_url.match(/anilist\.co\/user\/[^\/]+\/?$/))
    update_history().then(() => log('Successfully replaced activity history'));

  observer = new MutationObserver(mutationsList => {
    if (current_url !== location.href) {
      scroll_to_top_if_feed_is_empty();
      current_url = location.href;

      if (current_url.match(/anilist\.co\/user\/[^\/]+\/?$/))
        update_history().then(() =>
          log('Successfully rereplaced activity history')
        );
    }

    if (
      get_settings().scored_feed &&
      (!activity_feed || !document.body.contains(activity_feed))
    ) {
      reset_feed();
      activity_feed = document.querySelector('.activity-feed');
      if (activity_feed) {
        update_feed(activity_feed).then(() =>
          log('Successfully reattached extension')
        );
      }
    }

    color_list();
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true
  });
}

window.addEventListener('load', () => {
  log('Loading extension...');
  main();
});

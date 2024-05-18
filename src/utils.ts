export function labelled_log(...texts: any[]) {
  console.log(
    '%cAniList Modifier%c ' + texts.map(t => String(t)).join(' '),
    'background-color: #DD4124; border-radius: 5px; padding: 0.2em 0.3em; color: white; font-family: Verdana;',
    ''
  );
}

export function listen_for_url_change(
  callback: (url: string) => void,
  interval = 100
) {
  let current_url = window.location.href;
  setInterval(() => {
    const new_url = window.location.href;
    if (current_url !== new_url) {
      current_url = new_url;
      callback(new_url);
    }
  }, interval);
}

export function is_object(x: unknown): x is Exclude<object, null> {
  return typeof x === 'object' && !Array.isArray(x) && x !== null;
}

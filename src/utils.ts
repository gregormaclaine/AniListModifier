export function labelled_log(...texts: string[]) {
  console.log(
    '%cAniList Modifier%c ' + texts.join(' '),
    'background-color: #DD4124; border-radius: 5px; padding: 0.2em 0.3em; color: white; font-family: Verdana;',
    ''
  );
}

export function labelled_log(...texts: any[]) {
  console.log(
    '%cAniList Modifier%c ' + texts.map(t => String(t)).join(' '),
    'background-color: #DD4124; border-radius: 5px; padding: 0.2em 0.3em; color: white; font-family: Verdana;',
    ''
  );
}

export function is_object(x: unknown): x is Exclude<object, null> {
  return typeof x === 'object' && !Array.isArray(x) && x !== null;
}

export function lerp(x: number, a: number, b: number) {
  return a + (b - a) * x;
}

export function get_color(perc: number, saturation: number = 100) {
  return `hsl(${Math.ceil(lerp(perc, 0, 110))}, ${saturation}%, 50%)`;
}

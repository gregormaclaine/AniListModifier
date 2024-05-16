export type JSONResponse<T> =
  | {
      data: T;
      errors: null;
    }
  | {
      data: null;
      errors: { message: string; status: number }[];
    };

let api_calls_left = -1;
let api_calls_total = 0;

export function get_rate_limit_info(): [number, number] {
  return [api_calls_left, api_calls_total];
}

function update_rate_limit_info(headers: Headers) {
  const api_total_header = headers.get('x-ratelimit-limit');
  const api_left_header = headers.get('x-ratelimit-remaining');

  if (api_total_header) api_calls_total = parseInt(api_total_header);

  if (api_left_header) {
    const alternative = api_calls_left > 0 ? api_calls_left : Infinity;
    api_calls_left = Math.min(alternative, parseInt(api_left_header));
  }
}

export async function api<T>(
  query: string,
  variables: object
): Promise<JSONResponse<T>> {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ variables, query })
  });

  update_rate_limit_info(res.headers);

  if (res.ok) return (await res.json()) as JSONResponse<T>;

  const message = res.status === 429 ? 'Too many requests' : res.statusText;
  return {
    data: null,
    errors: [{ status: res.status, message }]
  };
}

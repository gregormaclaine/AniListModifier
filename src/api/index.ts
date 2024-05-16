import { ScoreFormat } from './types';
export { ScoreFormat };

type ScoreResponse = {
  Page: {
    mediaList: {
      score: number;
      media: { id: number };
      user: {
        mediaListOptions: { scoreFormat: ScoreFormat };
      };
    }[];
  };
};

type JSONResponse<T> = { headers: Headers } & (
  | {
      data: T;
      errors: null;
    }
  | {
      data: null;
      errors: { message: string; status: number }[];
    }
);

type ScoreResult = { id: number; score: number };

async function api<T>(
  query: string,
  variables: object
): Promise<JSONResponse<T>> {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ variables, query })
  });

  let parsed_res: JSONResponse<T>;
  if (res.ok) {
    parsed_res = await res.json();
    parsed_res.headers = res.headers;
  } else {
    const message = res.status === 429 ? 'Too many requests' : res.statusText;
    parsed_res = {
      data: null,
      errors: [{ status: res.status, message }],
      headers: res.headers
    };
  }
  return parsed_res;
}

export type FeedItem = {
  user: string;
  id: number;
};

export const sendgql = async (username: string, mediaIds: number[]) => {
  console.log('Calling api for', username, mediaIds);
  const { data, errors, headers } = await api<ScoreResponse>(
    `
      query GetMediaScore($username: String, $mediaIds: [Int]) {
        Page(page: 1) {
          mediaList(userName: $username, mediaId_in: $mediaIds) {
            score
            media { id }
            user {
              mediaListOptions { scoreFormat }
            }
          }
        }
      }
    `,
    { username, mediaIds }
  );

  let result: ScoreResult[],
    api_calls_left: number,
    api_calls_total: number,
    score_format: ScoreFormat;

  if (errors) {
    if (![404, 429].includes(errors[0].status))
      throw new Error(errors[0].message);

    result = [];
    api_calls_left = -1;
    api_calls_total = -1;
    score_format = 'POINT_10';
  } else {
    result = data.Page.mediaList.map(item => ({
      id: item.media.id,
      score: item.score
    }));
    score_format = data.Page.mediaList[0]?.user.mediaListOptions.scoreFormat;
    api_calls_left = parseInt(headers.get('x-ratelimit-remaining') || '-1');
    api_calls_total = parseInt(headers.get('x-ratelimit-limit') || '-1');
  }

  return { data: result, api_calls_left, api_calls_total, score_format };
};

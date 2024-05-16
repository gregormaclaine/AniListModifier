import { api } from '../api';
import { ScoreFormat } from '../types';

export type ScoreResponse = {
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

export type FeedItem = {
  user: string;
  id: number;
};

export const get_scores_for_media_set = async (
  username: string,
  mediaIds: number[]
) => {
  console.log('Calling api for', username, mediaIds);
  const { data, errors } = await api<ScoreResponse>(
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

  if (errors) {
    if ([404, 429].includes(errors[0].status)) {
      return { data: [], score_format: 'POINT_10' };
    }
    throw new Error(errors[0].message);
  }

  return {
    data: data.Page.mediaList.map(item => ({
      id: item.media.id,
      score: item.score
    })),
    score_format: data.Page.mediaList[0]?.user.mediaListOptions.scoreFormat
  };
};

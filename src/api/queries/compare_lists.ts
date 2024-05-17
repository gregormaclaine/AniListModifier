import { labelled_log } from '../../utils';
import { api, get_rate_limit_info } from '../api';
import { MediaFormat, MediaListStatus, ScoreFormat } from '../types';

type AllWatchedAnimeResponse = {
  MediaListCollection: {
    hasNextChunk: boolean;
    user: {
      mediaListOptions: { scoreFormat: ScoreFormat };
    };
    lists: {
      isCustomList: boolean;
      entries: {
        status: MediaListStatus;
        score: number;
        media: {
          id: number;
          format: MediaFormat;
          genres: [string];
          averageScore: number;
          siteUrl: string;
          title: { userPreferred: string };
          coverImage: { extraLarge: string };
        };
      }[];
    }[];
  };
};

async function get_all_watched_anime(username: string) {
  return await api<AllWatchedAnimeResponse>(
    `
      query GetAllWatchedAnime($username: String) {
        MediaListCollection(userName: $username, type: ANIME, forceSingleCompletedList: true, status_not: PLANNING) {
          hasNextChunk
          lists {
            isCustomList
            entries {
              status
              score
              media {
                id
                format
                genres
                averageScore
                siteUrl
                title { userPreferred }
                coverImage { extraLarge }
              }
            }
          }
        }}`,
    { username }
  );
}

function extract_anime_list(response: AllWatchedAnimeResponse) {
  return response.MediaListCollection.lists
    .filter(list => !list.isCustomList)
    .flatMap(list => list.entries)
    .map(entry => ({
      id: entry.media.id,
      anime: {
        format: entry.media.format,
        genres: entry.media.genres,
        url: entry.media.siteUrl,
        score: entry.media.averageScore / 10,
        title: entry.media.title.userPreferred,
        image: entry.media.coverImage.extraLarge
      },
      user: {
        status: entry.status,
        score: entry.score
      }
    }));
}

export async function compare_user_lists(username1: string, username2: string) {
  labelled_log(
    'Calling api to compare lists for ',
    username1,
    'and',
    username2
  );
  const { data: data1, errors: errors1 } = await get_all_watched_anime(
    username1
  );
  if (errors1) throw new Error(errors1[0].message);
  const { data: data2, errors: errors2 } = await get_all_watched_anime(
    username2
  );
  if (errors2) throw new Error(errors2[0].message);

  const anime1 = extract_anime_list(data1);
  const anime2 = extract_anime_list(data2);

  const common_anime = anime1
    .map(({ id, anime, user: me }) => {
      const theirs = anime2.find(a => a.id === id);
      if (!theirs) return null;
      return { id, anime, me, them: theirs.user };
    })
    .filter(a => a !== null);

  return {
    me_total: anime1.length,
    them_total: anime2.length,
    common_anime
  };
}

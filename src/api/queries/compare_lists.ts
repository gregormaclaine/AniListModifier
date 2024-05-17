import { api } from '../api';
import { MediaFormat, MediaListStatus, ScoreFormat } from '../types';

function average(arr: number[]) {
  return arr.reduce((acc, cur) => acc + cur, 0) / (arr.length || 1);
}

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
          coverImage: { medium: string; extraLarge: string };
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
                coverImage { medium, extraLarge }
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
        image: {
          small: entry.media.coverImage.medium,
          large: entry.media.coverImage.extraLarge
        }
      },
      user: {
        status: entry.status,
        score: entry.score
      }
    }));
}

export async function compare_user_lists(username1: string, username2: string) {
  console.log('Calling api to compare lists for ', username1, 'and', username2);
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

  const my_unique = anime1
    .map(({ id, anime, user: me }) => {
      if (anime2.find(a => a.id === id)) return null;
      return { id, anime, me, them: null };
    })
    .filter(a => a !== null);

  const their_unique = anime2
    .map(({ id, anime, user: them }) => {
      if (anime1.find(a => a.id === id)) return null;
      return { id, anime, them, me: null };
    })
    .filter(a => a !== null);

  return {
    me_total: anime1.length,
    them_total: anime2.length,
    me_average: average(anime1.map(a => a.user.score).filter(s => s)),
    them_average: average(anime2.map(a => a.user.score).filter(s => s)),
    common_anime,
    my_unique,
    their_unique
  };
}

export type ComparisonData = Awaited<ReturnType<typeof compare_user_lists>>;

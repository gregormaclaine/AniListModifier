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
    .flatMap(list => list.entries)
    .map(entry => ({
      id: entry.media.id,
      format: entry.media.format,
      title: entry.media.title.userPreferred,
      status: entry.status,
      score: entry.score,
      image: entry.media.coverImage.extraLarge
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
    .map(a => a.id)
    .filter(id => anime2.findIndex(a => a.id === id) >= 0);

  return [...common_anime].map(id => {
    const record1 = anime1.find(a => a.id === id);
    const record2 = anime2.find(a => a.id === id);

    return {
      Title: record1?.title.substring(0, 15),
      'Your Score': record1?.score,
      'Their Score': record2?.score,
      'Your Status': record1?.status,
      'Their Status': record2?.status
    };
  });
}

compare_user_lists('username1', 'username2').then(result => {
  console.table(result);

  console.log(get_rate_limit_info());
});

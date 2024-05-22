export type ScoreFormat =
  | 'POINT_10'
  | 'POINT_10_DECIMAL'
  | 'POINT_100'
  | 'POINT_5'
  | 'POINT_3';

export type MediaListStatus =
  | 'CURRENT'
  | 'PLANNING'
  | 'COMPLETED'
  | 'DROPPED'
  | 'PAUSED'
  | 'REPEATING';

export type MediaFormat =
  | 'TV'
  | 'TV_SHORT'
  | 'MOVIE'
  | 'SPECIAL'
  | 'OVA'
  | 'ONA'
  | 'MUSIC'
  | 'MANGA'
  | 'NOVEL'
  | 'ONE_SHOT';

export type FeedItem = {
  user: string;
  id: number;
};

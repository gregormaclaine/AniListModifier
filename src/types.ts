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

type ComparisonDataAnime = {
  id: number;
  anime: {
    format: MediaFormat;
    genres: string[];
    url: string;
    score: number;
    title: string;
    image: {
      small: string;
      large: string;
    };
  };
};

type ComparisonDataUserRecord = {
  status: MediaListStatus;
  score: number;
};

export type ComparisonData = {
  me_total: number;
  them_total: number;
  me_average: number;
  them_average: number;
  common_anime: (ComparisonDataAnime & {
    me: ComparisonDataUserRecord;
    them: ComparisonDataUserRecord;
  })[];
  my_unique: (ComparisonDataAnime & { me: ComparisonDataUserRecord })[];
  their_unique: (ComparisonDataAnime & { them: ComparisonDataUserRecord })[];
};

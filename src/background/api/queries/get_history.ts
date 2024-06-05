import { labelled_log } from '../../../utils';
import { api } from '../api';
import { get_user_from_name } from './get_user';

type Activity = {
  createdAt: number;
  media: {
    id: number;
    title: { userPreferred: string };
  };
  progress: string | null;
  status: string;
};

type HistoryResponse = {
  Page: {
    activities: Activity[];
  };
};

const get_activity_history_page = async (
  page: number,
  userid: number,
  startTime: number,
  endTime: number
) => {
  startTime /= 1000;
  endTime /= 1000;

  const { data, errors } = await api<HistoryResponse>(
    `
        query GetActivityHistory($page: Int, $userid: Int, $startTime: Int, $endTime: Int) {
            Page(page: $page) {
                activities(userId: $userid, type: MEDIA_LIST, createdAt_greater: $startTime, createdAt_lesser: $endTime) {
                ... on ListActivity {
                  createdAt
                  progress
                  status
                  media {
                    id
                    title { userPreferred }
                  }
                }
              }
            }
          }
      `,
    { page, userid, startTime, endTime }
  );

  if (errors) {
    labelled_log('Error occurred:', data, errors);
    if ([404, 429].includes(errors[0].status)) {
      return null;
    }
    throw new Error(errors[0].message);
  }

  return (
    data?.Page.activities.map(a => ({
      ...a,
      createdAt: a.createdAt * 1000
    })) || null
  );
};

async function get_activity_history_items(
  user_id: number,
  startTime: number,
  endTime: number
) {
  const history = [];

  // It cant run more than 90 times due to rate limiting
  for (let i = 1; i < 91; i++) {
    const items = await get_activity_history_page(
      i,
      user_id,
      startTime,
      endTime
    );
    if (!items) return null;
    history.push(...items);
    if (items.length < 50) break;
  }

  return history;
}

function count_episodes(activity: Activity[]) {
  return activity.reduce((acc, cur) => {
    if (!cur.progress) {
      if (cur.status.includes('completed')) return acc + 1;
      return acc;
    }

    if (!cur.progress.includes('-')) return acc + 1;
    const parts = cur.progress.split('-').map(p => parseInt(p.trim()));
    return acc + parts[1] - parts[0] + 1;
  }, 0);
}

export async function get_activity_history(
  username: string,
  start: number,
  end: number
) {
  labelled_log('Fetching activity history for', username);
  const user = await get_user_from_name(username);
  if (!user) return null;

  const history = await get_activity_history_items(user.id, start, end);
  if (!history) return null;

  const activity_breakdown = [];
  for (let day = start; day < end; day += 86400000) {
    const activity = history.filter(
      a => a.createdAt >= day && a.createdAt < day + 86400000
    );
    activity_breakdown.push({
      day: new Date(day + 1),
      unique_shows: new Set(activity.map(a => a.media.id)).size,
      episodes: count_episodes(activity),
      activity
    });
  }
  return activity_breakdown;
}

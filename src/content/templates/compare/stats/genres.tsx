import { createMemo, onMount } from 'solid-js';
import {
  Chart,
  BarController,
  BarElement,
  LinearScale,
  Colors,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'solid-chartjs';
import { ComparisonData } from '../../../../types';

function calculate_genre_data(data: ComparisonData) {
  const all_shows = [
    ...data.common_anime,
    ...data.my_unique,
    ...data.their_unique
  ];

  const genres: {
    [key: string]: {
      count: number;
      global_score: number;
      me_count: number;
      me_avg_score: number;
      them_count: number;
      them_avg_score: number;
    };
  } = {};

  for (const show of all_shows) {
    for (const genre of show.anime.genres) {
      if (genres[genre]) {
        genres[genre].global_score *= genres[genre].count;
        genres[genre].global_score += show.anime.score;
        genres[genre].count++;
        genres[genre].global_score /= genres[genre].count;
      } else {
        genres[genre] = {
          count: 1,
          global_score: show.anime.score,
          me_count: 0,
          them_count: 0,
          me_avg_score: 0,
          them_avg_score: 0
        };
      }

      if (show.me?.score) {
        genres[genre].me_avg_score *= genres[genre].me_count;
        genres[genre].me_avg_score += show.me.score;
        genres[genre].me_count++;
        genres[genre].me_avg_score /= genres[genre].me_count;
      }
      if (show.them?.score) {
        genres[genre].them_avg_score *= genres[genre].them_count;
        genres[genre].them_avg_score += show.them.score;
        genres[genre].them_count++;
        genres[genre].them_avg_score /= genres[genre].them_count;
      }
    }
  }

  return Object.entries(genres)
    .map(([genre, info]) => ({ genre, ...info }))
    .filter(g => g.me_count > 0 && g.them_count > 0)
    .sort((a, b) => b.count - a.count);
}

function get_genre_normal_chart(data: ComparisonData) {
  const top_genres = calculate_genre_data(data).slice(0, 25);
  console.log(top_genres);

  const chart_data = {
    labels: top_genres.map(g => g.genre),
    datasets: [
      { label: 'Your Score', data: top_genres.map(g => g.me_avg_score) },
      {
        label: "Simbaninja's Score",
        data: top_genres.map(g => g.them_avg_score)
      },
      {
        label: 'Global Average Score',
        data: top_genres.map(g => g.global_score)
      }
    ]
  };

  const minimum_point = Math.floor(
    Math.max(
      0,
      Math.min(
        ...top_genres.flatMap(g => [
          g.global_score - 0.5,
          g.me_avg_score - 0.5,
          g.them_avg_score - 0.5
        ])
      )
    )
  );

  const chart_options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { min: minimum_point } }
  };

  return { data: chart_data, options: chart_options };
}

function get_genre_offset_chart(data: ComparisonData) {
  const top_genres = calculate_genre_data(data).slice(0, 25);

  const chart_data = {
    labels: top_genres.map(g => g.genre),
    datasets: [
      {
        label: 'Your Offset',
        data: top_genres.map(g => g.me_avg_score - data.me_average)
      },
      {
        label: "Simbaninja's Offset",
        data: top_genres.map(g => g.them_avg_score - data.them_average)
      }
    ]
  };

  const chart_options = {
    responsive: true,
    maintainAspectRatio: false
  };

  return { data: chart_data, options: chart_options };
}

export const GenreBreakdown = (props: { data: ComparisonData }) => {
  onMount(() => {
    Chart.register(
      LinearScale,
      BarController,
      BarElement,
      Colors,
      Tooltip,
      Legend
    );
  });

  const chart_data = createMemo(() => get_genre_offset_chart(props.data));

  return (
    <>
      {/* <pre>{JSON.stringify(chart_data(), null, 2)}</pre> */}
      <div>
        <Bar
          data={chart_data().data}
          options={chart_data().options}
          width={500}
          height={500}
        />
      </div>
    </>
  );
};

import { createEffect, createResource, Show, Suspense } from 'solid-js';
import {
  compare_user_lists,
  get_rate_limit_info
} from '../../../background/api';
import { GenreBreakdown } from './stats/genres';
import { styled } from 'solid-styled-components';

const GraphSection = styled('div')`
  margin: 0.5em;
  padding: 0.5em;
  background-color: rgb(var(--color-foreground));
`;

const Stats = () => {
  const [data] = createResource(() =>
    compare_user_lists('kappamac', 'simbaninja')
  );

  createEffect(() => data() && console.log(get_rate_limit_info()));

  return (
    <GraphSection>
      <Suspense fallback={<p>Loading...</p>}>
        <Show when={data()}>
          <GenreBreakdown data={data()} />
        </Show>
      </Suspense>
    </GraphSection>
  );
};

export default Stats;

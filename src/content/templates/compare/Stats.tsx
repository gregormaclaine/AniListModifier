import { createResource, Show, Suspense } from 'solid-js';
import { GenreBreakdown } from './stats/genres';
import { styled } from 'solid-styled-components';
import { ComparisonData } from '../../../types';

const GraphSection = styled('div')`
  margin: 0.5em;
  padding: 0.5em;
  background-color: rgb(var(--color-foreground));
`;

const Stats = () => {
  const [data] = createResource<ComparisonData>(() =>
    chrome.runtime.sendMessage({
      action: 'compare-lists',
      value: { me: 'kappamac', them: 'simbaninja' }
    })
  );

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

import { createEffect, createResource, Show, Suspense } from 'solid-js';
import {
  compare_user_lists,
  get_rate_limit_info
} from '../../../background/api';
import { GenreBreakdown } from './stats/genres';

const App = () => {
  const [data] = createResource(() =>
    compare_user_lists('kappamac', 'simbaninja')
  );

  createEffect(() => data() && console.log(get_rate_limit_info()));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Show when={data()}>
        <GenreBreakdown data={data()} />
        {/* <pre>{JSON.stringify(data(), null, 2)}</pre> */}
      </Show>
    </Suspense>
  );
};

export default App;

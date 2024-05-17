import { createEffect, createResource, Show, Suspense } from 'solid-js';
import { compare_user_lists, get_rate_limit_info } from '../../api';
import { render } from 'solid-js/web';
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
        <pre>{JSON.stringify(data(), null, 2)}</pre>
      </Show>
    </Suspense>
  );
};

const main_el = document.createElement('main');
document.body.appendChild(main_el);
render(App, main_el);
main_el.style.border = '1px solid black';

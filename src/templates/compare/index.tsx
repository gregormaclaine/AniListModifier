import { createEffect, createResource, Suspense } from 'solid-js';
import { compare_user_lists, get_rate_limit_info } from '../../api';
import { render } from 'solid-js/web';

const App = () => {
  const [data] = createResource(() =>
    compare_user_lists('kappamac', 'simbaninja')
  );

  createEffect(() => data() && console.log(get_rate_limit_info()));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </Suspense>
  );
};

const main_el = document.createElement('main');
document.body.appendChild(main_el);
render(App, main_el);
main_el.style.border = '1px solid red';

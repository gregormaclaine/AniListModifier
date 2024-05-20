import { createEffect, createResource, Suspense } from 'solid-js';
import { compare_user_lists, get_rate_limit_info } from '../../../api';
import { render } from 'solid-js/web';
import { labelled_log } from '../../../utils';

const App = () => {
  const [data] = createResource(() =>
    compare_user_lists('kappamac', 'simbaninja')
  );

  createEffect(() => data() && labelled_log(get_rate_limit_info().toString()));

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

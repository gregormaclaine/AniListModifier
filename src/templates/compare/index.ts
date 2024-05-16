import { compare_user_lists, get_rate_limit_info } from '../../api';

console.log('Hello');

compare_user_lists('kappamac', 'simbaninja').then(result => {
  console.table(result.common_anime);
  console.log(get_rate_limit_info());
});

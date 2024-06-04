import { labelled_log } from '../../../utils';
import { api } from '../api';

type UserResponse = {
  User: {
    id: number;
    name: string;
  };
};

export async function get_user_from_name(username: string) {
  labelled_log('Fetching user details for', username);
  const { data, errors } = await api<UserResponse>(
    `
        query GetUser($username: String) {
            User(name: $username) {
                id
                name
            }
          }
      `,
    { username }
  );

  if (errors) {
    labelled_log('Error occurred:', data, errors);
    if ([404, 429].includes(errors[0].status)) {
      return null;
    }
    throw new Error(errors[0].message);
  }

  return data.User;
}

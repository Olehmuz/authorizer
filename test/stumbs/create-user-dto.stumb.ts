import { hashSync } from 'bcrypt';

export const createUserDTO = {
  name: 'newuser',
  email: 'newuser@gmail.com',
  hashedPassword: hashSync('12345678', 10),
};

export const createUsersDTO = [
  {
    name: 'firstUser',
    email: 'mail123123@gmail.com',
    hashedPassword: hashSync('12345678', 10),
  },
  {
    name: 'secondUser',
    email: 'mail321321321gmail.com',
    hashedPassword: hashSync('12345678', 10),
  },
];

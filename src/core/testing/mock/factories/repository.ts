import { Repository } from 'typeorm';
import { MockType } from '../mock.types';

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    create: jest.fn(() => null),
    findOneBy: jest.fn(() => null),
    save: jest.fn(() => null),
  }),
);

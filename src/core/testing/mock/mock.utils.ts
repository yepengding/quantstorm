import { MockType } from './mock.types';

export function toInstance<T>(mockInstance: MockType<T>): T {
  return mockInstance as T;
}

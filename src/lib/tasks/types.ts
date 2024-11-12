import { TestResult } from 'src/lib/types';

export type writeAndGetTestResultTask = (
  testContents: string,
) => Promise<TestResult>;

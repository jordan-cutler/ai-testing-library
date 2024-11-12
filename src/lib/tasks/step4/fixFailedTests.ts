import {
  GenerateTestsArguments,
  TestSummary,
  FailedTestInfo,
} from 'src/lib/types';
import { runCompletion } from 'src/lib/api/openai';
import {
  generateFixFailedTestsPrompt,
  retryFailedGenerationPrompt,
} from 'src/lib/prompts/prompts';
import { WriteAndRunTestsTask } from 'src/lib/tasks/types';

interface FixFailedTestsArgs {
  currentTests: string;
  sourceCode: string;
  writeAndRunTests: WriteAndRunTestsTask;
  failedTestInfo: FailedTestInfo[];
  retryLimit: number;
}

interface FixFailedTestsResult {
  testFileContents: string;
  testSummary: TestSummary;
}

export async function fixFailedTests({
  sourceCode,
  currentTests,
  failedTestInfo,
  writeAndRunTests,
  retryLimit,
}: FixFailedTestsArgs): Promise<FixFailedTestsResult> {
  if (failedTestInfo.length === 0) {
    return {
      testFileContents: currentTests,
      testSummary: { passed: 0, failed: 0, total: 0 },
    };
  }

  let currentTry = 0;
  let lastError = '';
  let lastAttempt = currentTests;

  while (currentTry < retryLimit) {
    try {
      const generatedTest = await runCompletion({
        messages:
          currentTry === 0
            ? generateFixFailedTestsPrompt({
                sourceCode,
                currentTests,
                failedTests: failedTestInfo,
              })
            : retryFailedGenerationPrompt({
                sourceCode,
                previousAttempt: lastAttempt,
                error: lastError,
              }),
      });

      const testSummary = await writeAndRunTests(generatedTest);

      if (testSummary.failed === 0) {
        return {
          testFileContents: generatedTest,
          testSummary,
        };
      }

      lastError = `Failed tests: ${testSummary.failed}. Total tests: ${testSummary.total}`;
      lastAttempt = generatedTest;
      currentTry++;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      currentTry++;
    }
  }

  return {
    testFileContents: currentTests,
    testSummary: {
      passed: 0,
      failed: failedTestInfo.length,
      total: failedTestInfo.length,
    },
  };
}

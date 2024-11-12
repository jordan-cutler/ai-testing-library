import { TestResult, FailedTestInfo } from 'src/lib/types';
import { runCompletion } from 'src/lib/api/openai';
import {
  generateFixFailedTestsPrompt,
  retryFailedGenerationPrompt,
} from 'src/lib/prompts/prompts';
import { WriteAndRunTestsTask } from 'src/lib/tasks/types';
import { withRetry } from 'src/lib/utils/retryManager';

interface FixFailedTestsArgs {
  sourceCode: string;
  currentTests: string;
  writeAndRunTests: WriteAndRunTestsTask;
  failedTestInfo: FailedTestInfo[];
  retryLimit: number;
}

export async function fixFailedTests({
  sourceCode,
  currentTests,
  failedTestInfo,
  writeAndRunTests,
  retryLimit,
}: FixFailedTestsArgs): Promise<TestResult> {
  // If no failed tests, run the current tests to get a proper TestResult
  if (failedTestInfo.length === 0) {
    const testSummary = await writeAndRunTests(currentTests);
    return {
      testFileContents: currentTests,
      testSummary,
    };
  }

  const result = await withRetry(
    async (previousResult?: TestResult) => {
      const currentResult = previousResult!;

      const generatedTest = await runCompletion({
        messages:
          currentResult.testSummary.failed === failedTestInfo.length
            ? generateFixFailedTestsPrompt({
                sourceCode,
                currentTests: currentResult.testFileContents,
                failedTests: failedTestInfo,
              })
            : retryFailedGenerationPrompt({
                sourceCode,
                previousAttempt: currentResult.testFileContents,
                error: `Failed tests: ${currentResult.testSummary.failed}. Total tests: ${currentResult.testSummary.total}`,
              }),
      });

      const testSummary = await writeAndRunTests(generatedTest);

      return {
        testFileContents: generatedTest,
        testSummary,
      };
    },
    {
      retryLimit,
      initialValue: {
        testFileContents: currentTests,
        testSummary: { passed: 0, failed: failedTestInfo.length, total: failedTestInfo.length, stderrOutput: '' }
      },
      shouldRetry: (result) => result.testSummary.failed > 0,
      onError: (error, attempt) => {
        console.error(`Attempt ${attempt} failed:`, error);
      },
      onRetry: (lastResult, attempt) => {
        console.log(
          `Attempt ${attempt}: ${lastResult.testSummary.failed} tests still failing. Retrying...`
        );
      },
    }
  );

  return result.result;
}
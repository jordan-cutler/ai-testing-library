import { TestResult } from 'src/lib/types';
import { runCompletion } from 'src/lib/api/openai';
import { fixFailedTestsPrompt } from 'src/lib/prompts/prompts';
import { writeAndGetTestResultTask } from 'src/lib/tasks/types';
import { withRetry } from 'src/lib/utils/retryManager';
import { parseTestFileFailures } from 'src/lib/utils/testUtils';

interface FixFailedTestsArgs {
  sourceCode: string;
  currentTests: TestResult;
  writeAndGetTestResult: writeAndGetTestResultTask;
  retryLimit: number;
}

export async function fixFailedTests({
  sourceCode,
  currentTests,
  writeAndGetTestResult,
  retryLimit,
}: FixFailedTestsArgs): Promise<TestResult> {
  // If no failed tests, return the current tests result directly
  if (currentTests.testSummary.failed === 0) {
    console.log('No failed tests, returning current tests');
    return currentTests;
  }

  const result = await withRetry(
    async (previousResult?: TestResult) => {
      const currentResult = previousResult!;
      const failedTestInfo = await parseTestFileFailures(currentResult);

      const generatedTest = await runCompletion({
        messages: fixFailedTestsPrompt({
          sourceCode,
          currentTests: currentResult.testFileContents,
          failedTests: failedTestInfo,
        }),
      });

      return await writeAndGetTestResult(generatedTest);
    },
    {
      retryLimit,
      initialValue: currentTests,
      shouldRetry: (result) => result.testSummary.failed > 0,
      onError: (error, attempt) => {
        console.error(`Attempt ${attempt} failed:`, error);
      },
      onRetry: (lastResult, attempt) => {
        console.log(
          `Attempt ${attempt}: ${lastResult.testSummary.failed} tests still failing. Retrying...`,
        );
      },
    },
  );

  return result.result;
}

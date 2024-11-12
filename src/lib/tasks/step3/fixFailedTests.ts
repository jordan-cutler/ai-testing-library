import { TestResult, FailedTestInfo } from 'src/lib/types';
import { runCompletion } from 'src/lib/api/openai';
import {
  generateFixFailedTestsPrompt,
  retryFailedGenerationPrompt,
} from 'src/lib/prompts/prompts';
import { WriteAndRunTestsTask } from 'src/lib/tasks/types';
import { withRetry } from 'src/lib/utils/retryManager';

interface FixFailedTestsArgs {
  currentTests: string;
  sourceCode: string;
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
  if (failedTestInfo.length === 0) {
    return {
      testFileContents: currentTests,
      testSummary: { passed: 0, failed: 0, total: 0, stderrOutput: '' },
    };
  }

  let lastError = '';

  const result = await withRetry(
    async () => {
      const generatedTest = await runCompletion({
        messages:
          lastError === ''
            ? generateFixFailedTestsPrompt({
                sourceCode,
                currentTests,
                failedTests: failedTestInfo,
              })
            : retryFailedGenerationPrompt({
                sourceCode,
                previousAttempt: currentTests,
                error: lastError,
              }),
      });

      const testSummary = await writeAndRunTests(generatedTest);

      if (testSummary.failed > 0) {
        lastError = `Failed tests: ${testSummary.failed}. Total tests: ${testSummary.total}`;
      }

      return {
        testFileContents: generatedTest,
        testSummary,
      };
    },
    {
      retryLimit,
      shouldRetry: (result) => result.testSummary.failed > 0,
      onError: (error, attempt) => {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Attempt ${attempt} failed:`, lastError);
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
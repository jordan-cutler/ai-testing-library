import { TestResult } from 'src/lib/types';
import { runCompletion } from 'src/lib/api/openai';
import { generateRequiredTestsPrompt } from 'src/lib/prompts/prompts';
import { writeAndGetTestResultTask } from 'src/lib/tasks/types';
import { withRetry } from 'src/lib/utils/retryManager';

interface GenerateRequiredTestsArgs {
  sourceCode: string;
  writeAndGetTestResult: writeAndGetTestResultTask;
  existingTests: TestResult;
  requiredTestCount: number;
  retryLimit: number;
}

export async function generateRequiredTests({
  sourceCode,
  writeAndGetTestResult,
  existingTests,
  requiredTestCount,
  retryLimit,
}: GenerateRequiredTestsArgs): Promise<TestResult> {
  const result = await withRetry(
    async (previousResult: TestResult) => {
      const generatedTest = await runCompletion({
        messages: generateRequiredTestsPrompt({
          sourceCode,
          existingTests: previousResult.testFileContents,
          requiredCount: requiredTestCount,
        }),
      });

      return await writeAndGetTestResult(generatedTest);
    },
    {
      retryLimit,
      initialValue: existingTests,
      shouldRetry: (result) => result.testSummary.total < requiredTestCount,
      onError: (error, attempt) => {
        console.error(
          `Error during required test generation attempt ${attempt}:`,
          error,
        );
      },
      onRetry: (lastResult, attempt) => {
        console.log(
          `Attempt ${attempt}: Generated ${lastResult.testSummary.total} tests, ` +
            `but need at least ${requiredTestCount}. Retrying with current progress...`,
        );
      },
    },
  );

  return result.result;
}

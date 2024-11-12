import { TestResult } from 'src/lib/types';
import { runCompletion } from 'src/lib/api/openai';
import { generateInitialTestPrompt } from 'src/lib/prompts/prompts';
import { writeAndGetTestResultTask } from 'src/lib/tasks/types';
import { withRetry } from 'src/lib/utils/retryManager';

interface GenerateFirstPassingTestArgs {
  sourceCode: string;
  inputOutputSamples: string;
  writeAndGetTestResult: writeAndGetTestResultTask;
  retryLimit: number;
}

export async function generateFirstPassingTest({
  sourceCode,
  inputOutputSamples,
  writeAndGetTestResult,
  retryLimit,
}: GenerateFirstPassingTestArgs): Promise<TestResult | null> {
  const result = await withRetry(
    async () => {
      const generatedTest = await runCompletion({
        messages: generateInitialTestPrompt({
          sourceCode,
          samples: inputOutputSamples,
        }),
      });

      return await writeAndGetTestResult(generatedTest);
    },
    {
      retryLimit,
      shouldRetry: (result) => result.testSummary.failed > 0,
      onError: (error, attempt) => {
        console.error(
          `Error during first passing test generation attempt ${attempt}:`,
          error,
        );
      },
      onRetry: (lastResult, attempt) => {
        console.log(`Attempt ${attempt}: Generated test failed. Retrying...`);
      },
    },
  );

  return result.success ? result.result : null;
}

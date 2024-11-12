import { TestSummary } from 'src/lib/types';
import { runCompletion } from 'src/lib/api/openai';
import { generateInitialTestPrompt } from 'src/lib/prompts/prompts';
import { WriteAndRunTestsTask } from 'src/lib/tasks/types';

export interface GenerateFirstPassingTestArguments {
  sourceCode: string;
  writeAndRunTests: WriteAndRunTestsTask;
  inputOutputSamples: string;
  retryLimit: number;
}

export interface FirstTestResult {
  success: boolean;
  testFileContents: string;
  testSummary: TestSummary;
}

export async function generateFirstPassingTest({
  sourceCode,
  writeAndRunTests,
  inputOutputSamples,
  retryLimit,
}: GenerateFirstPassingTestArguments): Promise<FirstTestResult | undefined> {
  let currentTry = 0;

  while (currentTry < retryLimit) {
    try {
      const generatedTest = await runCompletion({
        messages: generateInitialTestPrompt({
          samples: inputOutputSamples,
          sourceCode,
        }),
      });

      const testSummary = await writeAndRunTests(generatedTest);

      if (testSummary.failed === 0 && testSummary.total > 0) {
        return {
          success: true,
          testFileContents: generatedTest,
          testSummary,
        };
      }

      currentTry++;
    } catch (error) {
      currentTry++;
      console.error('Error generating first test:', error);
    }
  }

  return undefined;
}

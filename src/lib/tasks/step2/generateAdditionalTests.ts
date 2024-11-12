import { TestResult } from 'src/lib/types';
import { runCompletion } from 'src/lib/api/openai';
import { generateAdditionalTestsPrompt } from 'src/lib/prompts/prompts';
import { WriteAndRunTestsTask } from 'src/lib/tasks/types';

export interface AdditionalTestsArgs {
  sourceCode: string;
  writeAndRunTests: WriteAndRunTestsTask;
  existingTests: string;
}

export type AdditionalTestsResult = TestResult;

export async function generateAdditionalTests({
  sourceCode,
  writeAndRunTests,
  existingTests,
}: AdditionalTestsArgs): Promise<AdditionalTestsResult> {
  const generatedTest = await runCompletion({
    messages: generateAdditionalTestsPrompt(sourceCode, existingTests),
  });

  const testSummary = await writeAndRunTests(generatedTest);

  return {
    testFileContents: generatedTest,
    testSummary,
  };
}

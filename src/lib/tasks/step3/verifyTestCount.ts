import { FailedTestInfo, TestResult } from 'src/lib/types';
import { parseTestFileFailures } from 'src/lib/utils/testUtils';
import { runCompletion } from 'src/lib/api/openai';
import { verifyTestCountPrompt } from 'src/lib/prompts/prompts';
import { WriteAndRunTestsTask } from 'src/lib/tasks/types';

interface VerifyTestCountArgs {
  testResult: TestResult;
  retryLimit?: number;
  writeAndRunTests: WriteAndRunTestsTask;
  sourceCode: string;
  testCount: number;
}

interface VerifyTestCountResult {
  hasMinimumTests: boolean;
  currentTestCount: number;
  testFileContents: string;
  failedTests: FailedTestInfo[];
}

export async function verifyTestCount({
  testResult,
  testCount,
  sourceCode,
  writeAndRunTests,
  retryLimit = 0,
}: VerifyTestCountArgs): Promise<VerifyTestCountResult> {
  let currentTry = 0;
  let currentTestResult = testResult;

  while (currentTry <= retryLimit) {
    const { testSummary, testFileContents } = currentTestResult;

    // If we have enough tests, return the current result
    if (testSummary.total >= testCount) {
      const failedTests = await parseTestFileFailures(
        testFileContents,
        testSummary,
      );

      return {
        hasMinimumTests: true,
        currentTestCount: testSummary.total,
        testFileContents,
        failedTests,
      };
    }

    // If we've hit our retry limit, return the best result we have
    if (currentTry === retryLimit) {
      const failedTests = await parseTestFileFailures(
        testFileContents,
        testSummary,
      );

      return {
        hasMinimumTests: false,
        currentTestCount: testSummary.total,
        testFileContents,
        failedTests,
      };
    }

    try {
      const updatedTests = await runCompletion({
        messages: verifyTestCountPrompt({
          sourceCode,
          currentTests: testFileContents,
          requiredCount: testCount,
        }),
      });

      const updatedSummary = await writeAndRunTests(updatedTests);

      currentTestResult = {
        testFileContents: updatedTests,
        testSummary: updatedSummary,
      };

      currentTry++;
    } catch (error) {
      console.error(
        `Error during test count verification attempt ${currentTry}:`,
        error,
      );
      currentTry++;
    }
  }

  // This should never be reached due to the while loop condition,
  // but TypeScript needs it for type safety
  const { testSummary, testFileContents } = currentTestResult;
  const failedTests = await parseTestFileFailures(
    testFileContents,
    testSummary,
  );

  return {
    hasMinimumTests: false,
    currentTestCount: testSummary.total,
    testFileContents,
    failedTests,
  };
}

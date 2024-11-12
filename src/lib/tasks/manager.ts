import { GenerateTestsArguments, GenerateTestsResult } from 'src/lib/types';
import { generateFirstPassingTest } from 'src/lib/tasks/step1/generateFirstPassingTest';
import { generateRequiredTests } from 'src/lib/tasks/step2b/generateRequiredTests';
import { fixFailedTests } from 'src/lib/tasks/step4/fixFailedTests';
import * as fs from 'fs-extra';
import { writeAndRunTests } from 'src/lib/utils/testUtils';

export async function taskManager({
  inputFilePath,
  inputOutputSamplesPath,
  runTestCommand,
  outputFilePath,
  testCount,
  retryLimit,
}: GenerateTestsArguments): Promise<GenerateTestsResult> {
  const sourceCode = await fs.readFile(inputFilePath, 'utf-8');
  const samples = await fs.readFile(inputOutputSamplesPath, 'utf-8');
  const writeAndRunTestsLocal = (testContents: string) =>
    writeAndRunTests(runTestCommand, outputFilePath, testContents);

  // Step 1: Generate first passing test
  const firstTestResult = await generateFirstPassingTest({
    sourceCode,
    inputOutputSamples: samples,
    writeAndRunTests: writeAndRunTestsLocal,
    retryLimit: retryLimit,
  });
  if (!firstTestResult) {
    throw new Error('Failed to generate initial passing test');
  }

  // Step 2b: Generate required number of tests with good coverage
  const requiredTestsResult = await generateRequiredTests({
    sourceCode,
    writeAndRunTests: writeAndRunTestsLocal,
    existingTests: firstTestResult.testFileContents,
    requiredTestCount: testCount,
    retryLimit,
  });

  // Step 4: Fix any failed tests
  const finalResult = await fixFailedTests({
    sourceCode,
    currentTests: requiredTestsResult.testFileContents,
    failedTestInfo: await parseTestFileFailures(
      requiredTestsResult.testFileContents,
      requiredTestsResult.testSummary
    ),
    writeAndRunTests: writeAndRunTestsLocal,
    retryLimit,
  });

  return {
    testSummary: finalResult.testSummary,
  };
}

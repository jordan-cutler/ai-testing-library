import { GenerateTestsArguments, GenerateTestsResult } from 'src/lib/types';
import { generateFirstPassingTest } from 'src/lib/tasks/step1/generateFirstPassingTest';
import { generateRequiredTests } from 'src/lib/tasks/step2/generateRequiredTests';
import { fixFailedTests } from 'src/lib/tasks/step3/fixFailedTests';
import * as fs from 'fs-extra';
import { writeAndGetTestResult } from 'src/lib/utils/testUtils';

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
  const writeAndGetTestResultLocal = (testContents: string) =>
    writeAndGetTestResult(runTestCommand, outputFilePath, testContents);

  // Step 1: Generate first passing test
  const firstTestResult = await generateFirstPassingTest({
    sourceCode,
    inputOutputSamples: samples,
    writeAndGetTestResult: writeAndGetTestResultLocal,
    retryLimit: retryLimit,
  });
  if (!firstTestResult) {
    throw new Error('Failed to generate initial passing test');
  }

  // Step 2: Generate required number of tests with good coverage
  const requiredTestsResult = await generateRequiredTests({
    sourceCode,
    writeAndGetTestResult: writeAndGetTestResultLocal,
    existingTests: firstTestResult,
    requiredTestCount: testCount,
    retryLimit,
  });

  // Step 3: Fix any failed tests
  const finalResult = await fixFailedTests({
    sourceCode,
    currentTests: requiredTestsResult,
    writeAndGetTestResult: writeAndGetTestResultLocal,
    retryLimit,
  });

  return {
    testSummary: finalResult.testSummary,
  };
}

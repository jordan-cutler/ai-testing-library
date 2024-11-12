import { GenerateTestsArguments, GenerateTestsResult } from 'src/lib/types';
import { generateFirstPassingTest } from 'src/lib/tasks/step1/generateFirstPassingTest';
import { generateAdditionalTests } from 'src/lib/tasks/step2/generateAdditionalTests';
import { verifyTestCount } from 'src/lib/tasks/step3/verifyTestCount';
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

  // Step 2: Generate additional tests
  const additionalTestsResult = await generateAdditionalTests({
    sourceCode,
    writeAndRunTests: writeAndRunTestsLocal,
    existingTests: firstTestResult.testFileContents,
  });

  // Step 3: Verify test count
  const verificationResult = await verifyTestCount({
    sourceCode,
    writeAndRunTests: writeAndRunTestsLocal,
    testResult: additionalTestsResult,
    testCount: testCount,
    retryLimit: 0,
  });

  if (!verificationResult.hasMinimumTests) {
    throw new Error(
      `Failed to generate minimum required tests. Expected ${testCount}, got ${verificationResult.currentTestCount}`,
    );
  }

  // Step 4: Fix any failed tests
  const finalResult = await fixFailedTests({
    sourceCode,
    currentTests: verificationResult.testFileContents,
    failedTestInfo: verificationResult.failedTests,
    writeAndRunTests: writeAndRunTestsLocal,
    retryLimit,
  });

  return {
    testSummary: finalResult.testSummary,
  };
}

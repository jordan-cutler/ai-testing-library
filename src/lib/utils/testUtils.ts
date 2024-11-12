import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import { TestResult, TestSummary } from 'src/lib/types';
import { parseTestResultsPrompt } from 'src/lib/prompts/prompts';
import { callGPTWithFunctions, ChatFunction } from 'src/lib/api/openai';

const execAsync = promisify(exec);

export interface FailedTestInfo {
  testName: string;
  errorMessage: string;
  testCode: string;
}

export async function writeAndGetTestResult(
  runTestCommand: (fileName: string) => string,
  outputFilePath: string,
  testFileContents: string,
): Promise<TestResult> {
  await fs.writeFile(outputFilePath, testFileContents);

  const runTestStr = runTestCommand(outputFilePath);
  console.log(`Running tests via: ${runTestStr}`);
  const { stderr } = await execAsync(runTestStr);
  const testSummary = getTestSummaryOutput(stderr);
  return { testSummary, testFileContents };
}

function getTestSummaryOutput(stderr: string): TestSummary {
  const testSummaryOutput = stderr
    .split('\n')
    .find((line) => line.startsWith('Tests:'));
  const testSummary = testSummaryOutput?.split(',');
  const passedOutput = testSummary?.find((s: string) => s.includes('passed'));
  const failedOutput = testSummary?.find((s: string) => s.includes('failed'));
  const totalOutput = testSummary?.find((s: string) => s.includes('total'));

  const extractNumber = (str: string | undefined) => {
    if (!str) return 0;

    return parseInt(str.split(' ')[0]!);
  };

  return {
    passed: extractNumber(passedOutput),
    failed: extractNumber(failedOutput),
    total: extractNumber(totalOutput),
    stderrOutput: stderr,
  };
}

export async function parseTestFileFailures(
  testResult: TestResult,
): Promise<FailedTestInfo[]> {
  if (testResult.testSummary.failed === 0) {
    return [];
  }

  const prompt = parseTestResultsPrompt({
    testFileContents: testResult.testFileContents,
    testOutput: testResult.testSummary.stderrOutput,
  });

  const functionSchema: ChatFunction = {
    name: 'processFailedTests',
    description: 'Process the failed test information',
    parameters: {
      type: 'object',
      properties: {
        failedTests: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              testName: { type: 'string' },
              errorMessage: { type: 'string' },
              testCode: { type: 'string' },
            },
            required: ['testName', 'errorMessage', 'testCode'],
          },
        },
      },
      required: ['failedTests'],
    },
  };

  const response = await callGPTWithFunctions({
    prompt,
    functionSchemas: [functionSchema],
    functionCall: { name: functionSchema.name },
  });

  return response.failedTests;
}

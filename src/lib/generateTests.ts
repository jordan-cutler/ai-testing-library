import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateInitialTestPrompt } from 'src/lib/prompts/prompts';
import { runCompletion } from 'src/lib/api/openai';

const execAsync = promisify(exec);

export interface GenerateTestsArguments {
  inputFilePath: string;
  outputFilePath: string;
  inputOutputSamplesPath: string;
  configPath: string;
  testCount: number;
  retryLimit: number;
  runTestCommand: (fileName: string) => string;
  // openApiKey: string;
}
export interface GenerateTestsResult {
  testSummary: TestSummary;
}

export async function generateTests({
  inputFilePath,
  outputFilePath,
  inputOutputSamplesPath,
  testCount,
  retryLimit,
  runTestCommand,
}: GenerateTestsArguments) {
  const resultsGenerated: AIGeneratedResult[] = [];

  try {
    // Read the input file and samples
    const sourceCode = await fs.readFile(inputFilePath, 'utf-8');
    const samples = await fs.readFile(inputOutputSamplesPath, 'utf-8');

    const testsGenerated = 0;
    let currentTry = 0;

    while (testsGenerated < testCount && currentTry < retryLimit) {
      try {
        // Generate test using OpenAI
        const generatedTest = await runCompletion({
          messages: generateInitialTestPrompt(samples, sourceCode),
        });

        const testSummary = await writeAndGetTestResult(
          runTestCommand,
          outputFilePath,
          generatedTest,
        );

        resultsGenerated.push({
          testFileContents: generatedTest,
          testSummary,
        });

        if (testSummary.failed > 0) {
          console.log(
            `Test generation attempt ${currentTry} had ${testSummary.failed} failed tests`,
          );
          currentTry++;
        } else if (testSummary.total < testCount) {
          console.log(
            `Test generation attempt ${currentTry} had ${testSummary.total} out of ${testCount} expected tests generated. Missing ${testCount - testSummary.total} tests.`,
          );
          currentTry++;
        } else {
          console.log(
            `Successfully generated test ${testsGenerated}/${testCount}`,
          );
          break;
        }
      } catch (error) {
        currentTry++;
        console.error('Error during test generation:', error);
      }
    }

    const bestAttempt = getBestAttempt(resultsGenerated);
    console.log(
      `Best attempt had ${bestAttempt.testSummary.total} tests generated with ${bestAttempt.testSummary.failed} failures. Writing to ${outputFilePath}`,
    );
    await fs.writeFile(outputFilePath, bestAttempt.testFileContents);

    return { testSummary: bestAttempt.testSummary };
  } catch (error) {
    console.error('Error in generateTests:', error);
    throw error;
  }
}

interface TestSummary {
  passed: number;
  failed: number;
  total: number;
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
  };
}

interface AIGeneratedResult {
  testFileContents: string;
  testSummary: TestSummary;
}

function getBestAttempt(
  resultsGenerated: AIGeneratedResult[],
): AIGeneratedResult {
  if (resultsGenerated.length === 0) {
    throw new Error('No results generated');
  }

  return resultsGenerated.reduce((best, current) => {
    const currentPoints =
      current.testSummary.total - current.testSummary.failed;
    const bestPoints = best.testSummary.total - best.testSummary.failed;

    return currentPoints > bestPoints ? current : best;
  }, resultsGenerated[0]!);
}

async function writeAndGetTestResult(
  runTestCommand: (fileName: string) => string,
  outputFilePath: string,
  testFileContents: string,
): Promise<TestSummary> {
  await fs.writeFile(outputFilePath, testFileContents);

  const runTestStr = runTestCommand(outputFilePath);
  console.log(`Running tests via: ${runTestStr}`);
  const { stderr } = await execAsync(runTestStr);
  const testSummary = getTestSummaryOutput(stderr);
  return testSummary;
}

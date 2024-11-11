import { generateTests } from 'src/lib/generateTests';

const run = async () => {
  try {
    await generateTests({
      inputFilePath: 'tests/trials/AITest.tsx',
      outputFilePath: 'tests/trials/AITest.test.tsx',
      inputOutputSamplesPath: 'tests/trials/inputOutputSamples.ts',
      testCount: 1,
      configPath: 'config/config.ts',
      triesUntilGivingUp: 1,
      runTestCommand: (fileName: string) => `npm test ${fileName}`,
      // openApiKey: ENV.OPENAI_API_KEY,
    });
    console.log('Tests generated successfully');
  } catch (error) {
    console.error(error);
  }
};

run();
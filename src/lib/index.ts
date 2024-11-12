import { ENV } from 'src/config/env';
import { taskManager } from 'src/lib/tasks/manager';

const run = async () => {
  try {
    await taskManager({
      inputFilePath: 'tests/trials/AITest.tsx',
      outputFilePath: 'tests/trials/AITest.test.tsx',
      inputOutputSamplesPath: 'tests/trials/inputOutputSamples.ts',
      testCount: 1,
      configPath: 'config/config.ts',
      retryLimit: 1,
      runTestCommand: (fileName: string) => `npm test ${fileName}`,
      openApiKey: ENV.OPENAI_API_KEY,
    });
    console.log('Tests generated successfully');
  } catch (error) {
    console.error(error);
  }
};

run();
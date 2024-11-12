// TODO: Use yargs and maybe inquirer

import { generateTests, GenerateTestsArguments } from 'src/lib/main';

/*
Example API:

ai-testing-library generate-tests \
  --inputFilePath=<file> \
  --outputFilePath=<file> \
  --configPath=<file> \
  --testCount=<num> \
  --inputOutputSamplesPath=<file> \
  --retryLimit=<num> \
  --runTestCommand=<string> \
  --openapi-key=<string>

ai-testing-library add-tests \
  --inputFilePath=<file> \
  --outputFilePath=<file> \
  --configPath=<file> \
  --testCount=<num> \
  --inputOutputSamplesPath=<file> \
  --retryLimit=<num> \
  --runTestCommand=<string> \
  --openapi-key=<string>
*/

const options = {} as GenerateTestsArguments;

const main = () => {
  generateTests(options);
};

main();

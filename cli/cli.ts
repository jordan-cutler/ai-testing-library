// TODO: Use yargs and maybe inquirer

import { generateTests, MainArguments } from 'src/main';

/*
Example API:

ai-testing-library generate-tests \
  --inputFilePath=<file> \
  --outputFilePath=<file> \
  --configPath=<file> \
  --testCount=<num> \
  --inputOutputSamplesPath=<file> \
  --triesUntilGivingUp=<num> \
  --runTestCommand=<string> \
  --openapi-key=<string>

ai-testing-library add-tests \
  --inputFilePath=<file> \
  --outputFilePath=<file> \
  --configPath=<file> \
  --testCount=<num> \
  --inputOutputSamplesPath=<file> \
  --triesUntilGivingUp=<num> \
  --runTestCommand=<string> \
  --openapi-key=<string>
*/

const options = {} as MainArguments;

const main = () => {
  generateTests(options);
};

main();

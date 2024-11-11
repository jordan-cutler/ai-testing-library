export interface MainArguments {
  inputFilePath: string;
  outputFilePath: string;
  inputOutputSamplesPath: string;
  configPath: string;
  testCount: number;
  triesUntilGivingUp: number;
  runTestCommand: string;
  openApiKey: string;
}

export function generateTests({
  inputFilePath,
  outputFilePath,
  inputOutputSamplesPath,
  configPath,
  testCount,
  triesUntilGivingUp,
  runTestCommand,
  openApiKey
}: MainArguments) {

}

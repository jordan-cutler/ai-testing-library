export interface GenerateTestsArguments {
  inputFilePath: string;
  outputFilePath: string;
  inputOutputSamplesPath: string;
  configPath: string;
  testCount: number;
  retryLimit: number;
  runTestCommand: (fileName: string) => string;
  openApiKey: string;
}

export interface TestSummary {
  passed: number;
  failed: number;
  total: number;
  stderrOutput: string;
}

export interface FailedTestInfo {
  testName: string;
  errorMessage: string;
  testCode: string;
}

export interface GenerateTestsResult {
  testSummary: TestSummary;
}

export interface TestResult {
  testSummary: TestSummary;
  testFileContents: string;
}

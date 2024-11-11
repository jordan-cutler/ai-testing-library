/*
Ai testing library - feed an input file. Use CLI peer dependency to run tests. Generate file and run tests until they pass. Additional features to add tests. Config file with sample input and outputs. Read from imports as context

*/

export const config = {
  runTests: () => {},

  getPromptFile: () => {},
  getFileUnderTest: () => {},
  writeToTestFile: () => {},
  convertImportPathToResolvedPath: () => {},

  // Read from the file under tests imports. They might be relevant
  getImportsAsContext: () => {},

  // Determine if pass/fail. If failed, get failed tests and reasons
  getTestOutputStatus: () => {},

  openApiKey: '',
}
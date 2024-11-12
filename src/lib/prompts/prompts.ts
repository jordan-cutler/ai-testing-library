import { ChatCompletionMessageParam } from 'src/lib/api/openai';

// Base system message for all test generation
const baseSystemMessage = {
  role: 'system',
  content: `You are a test generation assistant specializing in React Testing Library and TypeScript.
You write tests that:
- Avoid snapshots
- Use appropriate RTL queries (prefer byRole and byLabelText over byText)
- Include proper type definitions
- Follow testing best practices
- Are maintainable and readable`,
} as const;

// Common output format instructions
const outputFormatInstructions = `
Your response should be in a runnable format without any markdown or code block syntax.
The output should be a valid TypeScript file that can be executed by Jest.
Do not include \`\`\`typescript tags or section headings.
`;

export const generateInitialTestPrompt = ({
  samples,
  sourceCode,
}: {
  samples: string;
  sourceCode: string;
}): Array<ChatCompletionMessageParam> => [
  baseSystemMessage,
  {
    role: 'system',
    content: `
Your task is to generate a SINGLE passing test for the component.
Focus on the most basic functionality first - usually rendering with default props.

Key requirements:
1. Create a renderComponent helper that accepts Partial<Props>
2. Write ONE test that verifies basic rendering
3. Keep the test simple and focused
4. Ensure proper typing for all functions and variables

If the test fails, consider:
- Are the imports correct?
- Is the component being rendered with required props?
- Are the assertions testing what actually exists in the DOM?
- Are you using appropriate queries?
${outputFormatInstructions}`,
  },
  {
    role: 'user',
    content: `Here are example tests for reference:\n${samples}\n\nComponent to test:\n${sourceCode}`,
  },
];

export const generateAdditionalTestsPrompt = (
  sourceCode: string,
  existingTests: string,
): Array<ChatCompletionMessageParam> => [
  baseSystemMessage,
  {
    role: 'system',
    content: `
Your task is to add more test cases to the existing test file.
Build upon the existing tests without modifying them.

Key requirements:
1. Use the existing renderComponent helper
2. Add tests for different prop combinations
3. Test user interactions and state changes
4. Test error cases and edge conditions
5. Maintain consistent style with existing tests

If tests fail, verify:
- Are you properly waiting for async operations?
- Are user events properly simulated?
- Are you testing actual component behavior?
- Are assertions checking the right elements?
${outputFormatInstructions}`,
  },
  {
    role: 'user',
    content: `Existing test file:\n${existingTests}\n\nComponent source:\n${sourceCode}\n\nPlease add more test cases.`,
  },
];

export const fixFailedTestsPrompt = ({
  sourceCode,
  currentTests,
  failedTests,
}: {
  sourceCode: string;
  currentTests: string;
  failedTests: Array<{
    testName: string;
    errorMessage: string;
    testCode: string;
  }>;
}): Array<ChatCompletionMessageParam> => [
  baseSystemMessage,
  {
    role: 'system',
    content: `
Your task is to fix failing tests while preserving passing tests.
Analyze the specific test failures and modify only the failing tests.

Key requirements:
1. Only modify failing tests
2. Keep the test's original intent
3. Fix the specific issues mentioned in error messages
4. Maintain existing test structure

Common fixes to consider:
- Incorrect query methods
- Missing await statements
- Wrong assertion syntax
- Missing test setup
- Incorrect prop values
- Type errors
${outputFormatInstructions}`,
  },
  {
    role: 'user',
    content: `
Component source:\n${sourceCode}\n
Current test file:\n${currentTests}\n
Failed tests:
${failedTests
  .map(
    (test) => `
Test: ${test.testName}
Error: ${test.errorMessage}
Code: ${test.testCode}
`,
  )
  .join('\n')}

Please provide the corrected test file.`,
  },
];

export const verifyTestCountPrompt = ({
  sourceCode,
  currentTests,
  requiredCount,
}: {
  sourceCode: string;
  currentTests: string;
  requiredCount: number;
}): Array<ChatCompletionMessageParam> => [
  baseSystemMessage,
  {
    role: 'system',
    content: `
Your task is to ensure we have enough test cases while maintaining quality.
Current test count is insufficient - add more meaningful tests.

Key requirements:
1. Add enough tests to reach ${requiredCount} total tests
2. Each new test should test a unique scenario
3. Maintain existing test quality and style
4. Focus on meaningful test cases

Test categories to consider:
- Different prop combinations
- User interactions
- Error states
- Edge cases
- Accessibility features
${outputFormatInstructions}`,
  },
  {
    role: 'user',
    content: `
Component source:\n${sourceCode}\n
Current tests:\n${currentTests}\n
Please add more tests to reach ${requiredCount} total tests.`,
  },
];

export const retryFailedGenerationPrompt = ({
  sourceCode,
  previousAttempt,
  error,
}: {
  sourceCode: string;
  previousAttempt: string;
  error: string;
}): Array<ChatCompletionMessageParam> => [
  baseSystemMessage,
  {
    role: 'system',
    content: `
Your task is to fix a failed test generation attempt.
Analyze the error and provide a corrected version.

Key requirements:
1. Address the specific error message
2. Maintain test quality and coverage
3. Ensure all imports are correct
4. Verify prop types and values

Common issues to check:
- Missing or incorrect imports
- Wrong component props
- Incorrect query methods
- Missing test setup
- Type errors
${outputFormatInstructions}`,
  },
  {
    role: 'user',
    content: `
Component source:\n${sourceCode}\n
Previous attempt:\n${previousAttempt}\n
Error encountered:\n${error}\n
Please provide a corrected version that addresses this error.`,
  },
];

export const parseTestResultsPrompt = ({
  testFileContents,
  testOutput,
}: {
  testFileContents: string;
  testOutput: string;
}): string => `Given the test file contents and test results output, analyze the failed tests and return an array of failed test information. Each failed test should include:
- testName: The name of the failed test
- errorMessage: The error message or reason for failure
- testCode: The actual test code that failed

Return the data in the following JSON structure:
[{
  "testName": string,
  "errorMessage": string,
  "testCode": string
}]

Test File Contents:
${testFileContents}

Test Results Output:
${testOutput}`;

// Add this new prompt function alongside the existing ones
export const generateRequiredTestsPrompt = ({
  sourceCode,
  existingTests,
  requiredCount,
}: {
  sourceCode: string;
  existingTests: string;
  requiredCount: number;
}): Array<ChatCompletionMessageParam> => [
  baseSystemMessage,
  {
    role: 'system',
    content: `
Your task is to expand the test suite to include at least ${requiredCount} meaningful tests.
Build upon existing tests while ensuring comprehensive coverage.

Key requirements:
1. Use the existing renderComponent helper
2. Add enough tests to reach at least ${requiredCount} total tests
3. Ensure each new test covers unique scenarios
4. Focus on meaningful coverage, not just quantity

Test scenarios to consider:
- Different prop combinations and values
- User interactions and state changes
- Error handling and edge cases
- Accessibility features
- Component lifecycle
- Integration with parent components
- Conditional rendering
- Event handlers and callbacks
${outputFormatInstructions}`,
  },
  {
    role: 'user',
    content: `
Component source:\n${sourceCode}\n
Current test file:\n${existingTests}\n
Please enhance the test suite to include at least ${requiredCount} meaningful tests while maintaining quality and coverage.`,
  },
];

/*
OLD:
export const generateInitialTests = (
  inputOutputSamples: string,
  sourceCode: string,
): Array<ChatCompletionMessageParam> => [
  {
    role: 'system',
    content:
      'You are a test generation assistant. Generate React Testing Library tests based on the provided component code and examples.',
  },
  {
    role: 'system',
    content: `
<expertise level>
You are a test generation assistant. Generate React Testing Library tests in Typescript based on the provided component code and examples
</expertise level>

<output format>
Order your response as follows:

1. Imports
2. Describe block for the component under test
3. A renderComponent function that renders the component under test
4. A single, basic test that uses the renderComponent function and gets the test to pass.

However, the response should be in a runnable format. The goal is for me to be able to take what you give me and run my test runner against it. Do not include jsx wrapping tags around the output.

Do not include \`\`\`typescript at the beginning or end of your response or section headings.
</output format>
`,
  },
  {
    role: 'user',
    content: `
<context>
I am working on an AI tool that will automatically generate tests for provided React components.
</context>

<request>
I need you to write a test file using React Testing Library, Jest, and Typescript, based on the provided input file I give
</request>

<example input and outputs>
Here are some example tests:\n${inputOutputSamples}
</example input and outputs>

<input file>
Here is the source code of the component I want you to write tests for:\n${sourceCode}\n
</input file>

<key information>
Consider the following key points:
- Avoid snapshot tests
- Test AND import the component being exported from the source code. Only import what you know exists.
- Use the most appropriate react-testing-library selector. Prefer \`byRole\` and \`byLabelText\` queries over \`byText\` queries
- Create a top-level \`renderComponent\` function that renders the component using the \`react-testing-library\`'s \`render\` function. Our function should take in a \`Partial\` of the props of the component we are testing, which can be a set of overrides.
- That \`renderComponent\` function will get called by all the tests.
- First, your goal is to just get one basic test to pass which calls \`renderComponent\` correctly and
- Mock out dependencies that aren't relevant to you.
- Return the content in a runnable format. The goal is for me to be able to take what you give me and run my test runner against it. Do not include jsx wrapping tags around the output.

</key information>

<desired outcome>
The final output should be a runnable test file I can run with jest
</desired outcome>
`,
  },
];
*/

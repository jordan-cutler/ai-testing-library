import { ChatCompletionMessageParam } from 'openai';
// const writeTestRules = `
// Rules:

// - Avoid snapshot tests
// - Use the most appropriate react-testing-library selector. Prefer `byRole` and `byLabelText` queries over `byText` queries
// - Create a top-level `renderComponent` function that renders the component using the `react-testing-library`'s `render` function. Our function should take in a `Partial` of the props of the component we are testing, which can be a set of overrides.
// - That `renderComponent` function will get called by all the tests.
// - First, your goal is to just get one basic test to pass which calls `renderComponent` correctly and
// - Mock out dependencies that aren't relevant to you.

// Step 1: Create a test plan, always starting with a basic rendering assertion.

// For the other tests, they should aim to test behavior as a user would use this component.

// For example, if it's a form component, we'd want to try various combinations of entering user input and testing interesting scenarios.

// Step 2: Make the first, basic test pass. Once we have this test passing. We can move onto the others.

// `;

// const writeInitialPassingTest = () => `
// ${writeTestRules}

// <TODO>

// `

// const modifyFailedTests = (failedTestsInfo: string) => `

// <TODO>

// `

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

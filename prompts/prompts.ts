
const writeTestRules = `
Rules:

- Avoid snapshot tests
- Use the most appropriate react-testing-library selector. Prefer `byRole` and `byLabelText` queries over `byText` queries
- Create a top-level `renderComponent` function that renders the component using the `react-testing-library`'s `render` function. Our function should take in a `Partial` of the props of the component we are testing, which can be a set of overrides.
- That `renderComponent` function will get called by all the tests.
- First, your goal is to just get one basic test to pass which calls `renderComponent` correctly and
- Mock out dependencies that aren't relevant to you.

Step 1: Create a test plan, always starting with a basic rendering assertion.

For the other tests, they should aim to test behavior as a user would use this component.

For example, if it's a form component, we'd want to try various combinations of entering user input and testing interesting scenarios.

Step 2: Make the first, basic test pass. Once we have this test passing. We can move onto the others.

`;

const writeInitialPassingTest = () => `
${writeTestRules}

<TODO>

`

const modifyFailedTests = (failedTestsInfo: string) => `

<TODO>

`

export const prompts = {
  writeTestRules,
  writeInitialPassingTest,
  modifyFailedTests
}

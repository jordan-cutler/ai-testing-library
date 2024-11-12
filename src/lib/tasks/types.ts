import { TestSummary } from "src/lib/types";

export type WriteAndRunTestsTask = (testContents: string) => Promise<TestSummary>;
// patterns.ts
import { Pattern } from "./patterns_common";

import patternsPart1 from "./patterns_part1";
import patternsPart2 from "./patterns_part2";
import patternsPart3 from "./patterns_part3";
import patternsPart4 from "./patterns_part4";

const patterns: Pattern[] = [
  ...patternsPart1,
  ...patternsPart2,
  ...patternsPart3,
  ...patternsPart4,
];

export default patterns;
export * from "./patterns_common";

// patterns.ts - 升級版本型態系統入口
import { Pattern } from "./patterns_common";

import patternsPart1 from "./patterns_part1";
import patternsPart2 from "./patterns_part2";
import patternsPart3 from "./patterns_part3";
import patternsPart4 from "./patterns_part4";

// 合併所有型態
const patterns: Pattern[] = [
  ...patternsPart1,
  ...patternsPart2,
  ...patternsPart3,
  ...patternsPart4,
];

export default patterns;

// 匯出所有核心功能
export * from "./patterns_common";

// 便利函數
export { patterns as allPatterns };
export const patternCount = patterns.length;

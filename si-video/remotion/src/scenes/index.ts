import type React from "react";
import { S02, S03, S04, S05, S06 } from "./motility1";
import { S07, S08, S09, S10, S11 } from "./motility2";
import { S12, S13, S14, S15 } from "./digestion1";
import { S16, S17, S18, S19 } from "./digestion2";
import { S21, S22, S23, S24 } from "./absorption1";
import { S25, S26, S27, S28, S29, S30, S31 } from "./absorption2";

export const SCENES: Record<string, React.FC> = {
  s02: S02,
  s03: S03,
  s04: S04,
  s05: S05,
  s06: S06,
  s07: S07,
  s08: S08,
  s09: S09,
  s10: S10,
  s11: S11,
  s12: S12,
  s13: S13,
  s14: S14,
  s15: S15,
  s16: S16,
  s17: S17,
  s18: S18,
  s19: S19,
  s21: S21,
  s22: S22,
  s23: S23,
  s24: S24,
  s25: S25,
  s26: S26,
  s27: S27,
  s28: S28,
  s29: S29,
  s30: S30,
  s31: S31,
};

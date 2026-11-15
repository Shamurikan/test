export const C = {
  amber: '#E8902A', amberL: '#F7D3A1', amberD: '#B8651A',
  teal: '#2A8FB8', tealL: '#BFE1EF', tealD: '#1D6688',
  red: '#D64541', redL: '#F4B9B4', redD: '#8E2B26', violet: '#7B5EA7', violetL: '#D9CCEA',
  green: '#4CA36B', greenL: '#CDE8D6', gold: '#E3B23C', goldL: '#F6E3AE',
  grey: '#8A8F98', greyL: '#D5D7DC', greyD: '#6B7079', ink: '#2B2D33', ink2: '#5A5E66',
  paper: '#FBF7F0', paper2: '#F3ECE0', olive: '#9C8B34', oliveL: '#E3DBA8', bile: '#8C9140',
  water: '#D7ECF6', lilac: '#A98BC6', pink: '#F2C9C2', pinkD: '#C98479',
  flesh: '#F4D9BF', fleshD: '#C99A72', panc: '#F3C77E', pancD: '#C98F3A', white: '#FFFFFF',
} as const;
export type ColorName = keyof typeof C;

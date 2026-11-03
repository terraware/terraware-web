// A length with no unit, which CSS only accepts as zero. `height`, `width` and the like are plain
// pixel counts as HTML attributes, so a component that passes them to a style prop has to add the
// unit itself.
const UNITLESS_LENGTH = /^-?\d*\.?\d+$/;

/**
 * Turns a size given the way an HTML attribute gives it into one CSS can use, leaving a value that
 * already carries a unit untouched.
 *
 * Needed wherever a bare number reaches a style prop: MUI's `sx` and system props append `px` to a
 * number but not to a numeric string, so `'100'` would be dropped as invalid and a fraction such as
 * `0.75` would quietly become a percentage of the parent instead of three quarters of a pixel.
 */
export const cssSize = (value?: string | number): string | number | undefined =>
  value !== undefined && UNITLESS_LENGTH.test(String(value)) ? `${value}px` : value;

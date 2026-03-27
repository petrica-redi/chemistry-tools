/**
 * Bisection root-finding on f(pH) = 0 over [a, b] in pH space.
 * Returns pH value where f crosses zero.
 */
export function bisect(
  fn: (pH: number) => number,
  a: number,
  b: number,
  tol = 1e-12,
  maxIter = 200
): number {
  let fa = fn(a);
  const fb = fn(b);
  if (!isFinite(fa) || !isFinite(fb) || fa * fb > 0) return (a + b) / 2;

  for (let i = 0; i < maxIter; i++) {
    const m = (a + b) / 2;
    const fm = fn(m);
    if (Math.abs(fm) < 1e-18 || (b - a) < tol) return m;
    if (fm * fa > 0) {
      a = m;
      fa = fm;
    } else {
      b = m;
    }
  }
  return (a + b) / 2;
}

/**
 * Linear interpolation between two values.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Format a number with appropriate precision.
 */
export function formatNum(v: number, precision = 3): string {
  if (Math.abs(v) >= 0.01) return v.toPrecision(precision);
  return v.toExponential(2);
}

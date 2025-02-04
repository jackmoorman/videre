type UsePerformanceOptions = {
  precision?: number;
};

export function usePerformance(opts?: UsePerformanceOptions) {
  const precision = opts?.precision || 2;
  const start = performance.now();

  const stop = () => {
    const end = performance.now();
    const seconds = (end - start) / 1000;
    return Number(seconds.toFixed(precision));
  };

  return stop;
}

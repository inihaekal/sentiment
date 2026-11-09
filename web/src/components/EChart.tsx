"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface EChartProps {
  option: echarts.EChartsOption;
  height?: number | string;
  style?: React.CSSProperties;
}

export default function EChart({ option, height = 300, style }: EChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Detect dark mode
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (!chartRef.current) {
      chartRef.current = echarts.init(ref.current, isDark ? "dark" : undefined, {
        renderer: "canvas",
      });
    }

    const chart = chartRef.current;

    // Apply transparent background for dark mode
    const mergedOption = {
      ...option,
      backgroundColor: "transparent",
    };

    chart.setOption(mergedOption, true);

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);

    // Listen for color scheme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onThemeChange = () => {
      chart.dispose();
      const newDark = mediaQuery.matches;
      chartRef.current = echarts.init(ref.current!, newDark ? "dark" : undefined, {
        renderer: "canvas",
      });
      chartRef.current.setOption({ ...option, backgroundColor: "transparent" }, true);
    };
    mediaQuery.addEventListener("change", onThemeChange);

    return () => {
      window.removeEventListener("resize", onResize);
      mediaQuery.removeEventListener("change", onThemeChange);
    };
  }, [option]);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height, ...style }}
    />
  );
}

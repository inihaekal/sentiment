"use client";

import EChart from "@/components/EChart";
import { topicSentimentData, topicLabel } from "@/lib/dummy-data";
import type { EChartsOption } from "echarts";

export default function TopicsPage() {
  // Heatmap data: [topicIndex, sentimentIndex, value]
  const sentimentTypes = ["Positif", "Negatif", "Netral"];
  const topicNames = topicSentimentData.map((d) => topicLabel(d.topic));

  const heatmapData: [number, number, number][] = [];
  topicSentimentData.forEach((d, ti) => {
    heatmapData.push([ti, 0, d.positif]);
    heatmapData.push([ti, 1, d.negatif]);
    heatmapData.push([ti, 2, d.netral]);
  });

  const maxVal = Math.max(...heatmapData.map((d) => d[2]));

  const heatmapOption: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { data: [number, number, number] };
        return `${topicNames[p.data[0]]}<br/>${sentimentTypes[p.data[1]]}: <b>${p.data[2]}</b>`;
      },
    },
    grid: { left: 160, right: 40, top: 40, bottom: 60 },
    xAxis: {
      type: "category",
      data: topicNames,
      axisLabel: { fontSize: 11, rotate: 35, interval: 0 },
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: sentimentTypes,
      axisLabel: { fontSize: 12 },
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: {
        color: ["#f0f9ff", "#3478ff", "#1e40af"],
      },
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        type: "heatmap",
        data: heatmapData,
        label: { show: true, fontSize: 12, fontWeight: 600 },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.3)" },
        },
      },
    ],
  };

  // Net Score bar chart
  const sortedByNet = [...topicSentimentData].sort((a, b) => a.net - b.net);

  const netScoreOption: EChartsOption = {
    tooltip: { trigger: "axis" },
    grid: { left: 160, right: 30, top: 10, bottom: 30 },
    xAxis: { type: "value", axisLabel: { fontSize: 11 } },
    yAxis: {
      type: "category",
      data: sortedByNet.map((d) => topicLabel(d.topic)),
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: "bar",
        data: sortedByNet.map((d) => ({
          value: d.net,
          itemStyle: {
            color: d.net >= 0 ? "#10b981" : "#ef4444",
            borderRadius: d.net >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
          },
        })),
        barWidth: "60%",
        label: {
          show: true,
          position: "right",
          fontSize: 11,
          fontWeight: 600,
          formatter: (params: unknown) => {
            const p = params as { value: number };
            return p.value > 0 ? `+${p.value}` : `${p.value}`;
          },
        },
      },
    ],
  };

  // Stacked bar
  const stackedOption: EChartsOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 11 } },
    grid: { left: 160, right: 30, top: 10, bottom: 40 },
    xAxis: { type: "value", axisLabel: { fontSize: 11 } },
    yAxis: {
      type: "category",
      data: topicSentimentData.map((d) => topicLabel(d.topic)),
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        name: "Positif",
        type: "bar",
        stack: "total",
        data: topicSentimentData.map((d) => d.positif),
        itemStyle: { color: "#10b981", borderRadius: [0, 0, 0, 0] },
      },
      {
        name: "Netral",
        type: "bar",
        stack: "total",
        data: topicSentimentData.map((d) => d.netral),
        itemStyle: { color: "#94a3b8" },
      },
      {
        name: "Negatif",
        type: "bar",
        stack: "total",
        data: topicSentimentData.map((d) => d.negatif),
        itemStyle: { color: "#ef4444", borderRadius: [0, 4, 4, 0] },
      },
    ],
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Analisis Persepsi Publik per Topik</h1>
        <p className="page-subtitle">
          Evaluasi bagaimana masyarakat menilai pilar operasional Brantas Abipraya (Kualitas Proyek, K3, CSR, Integritas, dll.)
        </p>
      </div>

      <div className="page-content">
        <div className="card animate-fade-in delay-1" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <span className="card-title">Peta Panas (Heatmap) Sentimen per Kategori Topik</span>
              <span className="card-subtitle">Semakin pekat warna biru, semakin padat jumlah komentar warga pada topik tersebut</span>
            </div>
          </div>
          <div className="card-body">
            <EChart option={heatmapOption} height={320} />
          </div>
        </div>

        <div className="grid-2col">
          <div className="card animate-fade-in delay-2">
            <div className="card-header">
              <div>
                <span className="card-title">Skor Citra Bersih (Net Sentiment)</span>
                <span className="card-subtitle">Selisih komentar positif dikurangi komentar negatif</span>
              </div>
            </div>
            <div className="card-body">
              <EChart option={netScoreOption} height={350} />
            </div>
          </div>

          <div className="card animate-fade-in delay-3">
            <div className="card-header">
              <div>
                <span className="card-title">Komposisi Respon per Topik</span>
                <span className="card-subtitle">Perbandingan persentase positif, netral, dan negatif</span>
              </div>
            </div>
            <div className="card-body">
              <EChart option={stackedOption} height={350} />
            </div>
          </div>
        </div>

        {/* Topic table */}
        <div className="card animate-fade-in delay-4" style={{ marginTop: 24 }}>
          <div className="card-header">
            <div>
              <span className="card-title">Rincian Data Persepsi Publik</span>
              <span className="card-subtitle">Data komparasi sentimen warga per bidang operasional</span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kategori Topik</th>
                  <th style={{ minWidth: 160 }}>Perbandingan Respon</th>
                  <th style={{ textAlign: "right" }}>Positif</th>
                  <th style={{ textAlign: "right" }}>Negatif</th>
                  <th style={{ textAlign: "right" }}>Netral</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                  <th style={{ textAlign: "right" }}>Skor Citra</th>
                </tr>
              </thead>
              <tbody>
                {topicSentimentData
                  .sort((a, b) => (b.positif + b.negatif + b.netral) - (a.positif + a.negatif + a.netral))
                  .map((d) => {
                    const total = d.positif + d.negatif + d.netral;
                    const posPct = Math.round((d.positif / total) * 100);
                    const negPct = Math.round((d.negatif / total) * 100);

                    return (
                      <tr key={d.topic}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{topicLabel(d.topic)}</td>
                        <td>
                          <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--bg-tertiary)", width: "100%" }}>
                            <div style={{ width: `${posPct}%`, background: "var(--color-positif)" }} title={`Positif: ${posPct}%`} />
                            <div style={{ width: `${100 - posPct - negPct}%`, background: "var(--text-tertiary)", opacity: 0.5 }} title="Netral" />
                            <div style={{ width: `${negPct}%`, background: "var(--color-negatif)" }} title={`Negatif: ${negPct}%`} />
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{ color: "var(--color-positif)", fontWeight: 700 }}>{d.positif}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{ color: "var(--color-negatif)", fontWeight: 700 }}>{d.negatif}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{ color: "var(--text-tertiary)" }}>{d.netral}</span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{total}</td>
                        <td style={{ textAlign: "right" }}>
                          <span
                            className="badge"
                            style={{
                              background: d.net >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                              color: d.net >= 0 ? "var(--color-positif)" : "var(--color-negatif)",
                              fontWeight: 700,
                            }}
                          >
                            {d.net > 0 ? `+${d.net}` : d.net}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

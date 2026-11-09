"use client";

import EChart from "@/components/EChart";
import { velocityHourly, posts, formatWIB, platformLabel, topicLabel } from "@/lib/dummy-data";
import type { EChartsOption } from "echarts";

export default function VelocityPage() {
  // Stacked area for velocity timeline
  const timelineOption: EChartsOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
    legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 11 } },
    grid: { left: 50, right: 30, top: 20, bottom: 50 },
    xAxis: {
      type: "category",
      data: velocityHourly.map((d) =>
        new Date(d.hour).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "2-digit",
          hour: "2-digit",
        })
      ),
      axisLabel: { fontSize: 10, interval: 11 },
      boundaryGap: false,
    },
    yAxis: { type: "value", name: "Jumlah Post", axisLabel: { fontSize: 10 } },
    series: [
      {
        name: "Viral",
        type: "line",
        stack: "total",
        areaStyle: { opacity: 0.7 },
        lineStyle: { width: 0 },
        symbol: "none",
        data: velocityHourly.map((d) => d.viral),
        itemStyle: { color: "#a855f7" },
      },
      {
        name: "Cepat",
        type: "line",
        stack: "total",
        areaStyle: { opacity: 0.6 },
        lineStyle: { width: 0 },
        symbol: "none",
        data: velocityHourly.map((d) => d.cepat),
        itemStyle: { color: "#f59e0b" },
      },
      {
        name: "Sedang",
        type: "line",
        stack: "total",
        areaStyle: { opacity: 0.5 },
        lineStyle: { width: 0 },
        symbol: "none",
        data: velocityHourly.map((d) => d.sedang),
        itemStyle: { color: "#3b82f6" },
      },
      {
        name: "Lambat",
        type: "line",
        stack: "total",
        areaStyle: { opacity: 0.3 },
        lineStyle: { width: 0 },
        symbol: "none",
        data: velocityHourly.map((d) => d.lambat),
        itemStyle: { color: "#94a3b8" },
      },
    ],
  };

  // Max velocity sparkline
  const maxVelocityOption: EChartsOption = {
    tooltip: { trigger: "axis" },
    grid: { left: 50, right: 30, top: 10, bottom: 30 },
    xAxis: {
      type: "category",
      data: velocityHourly.map((d) =>
        new Date(d.hour).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "2-digit",
          hour: "2-digit",
        })
      ),
      axisLabel: { fontSize: 10, interval: 11 },
      boundaryGap: false,
    },
    yAxis: { type: "value", name: "Max Velocity", axisLabel: { fontSize: 10 } },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: "#a855f7" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(168,85,247,0.2)" },
              { offset: 1, color: "rgba(168,85,247,0.02)" },
            ],
          },
        },
        data: velocityHourly.map((d) => d.max_velocity.toFixed(1)),
      },
    ],
  };

  const viralPosts = posts
    .filter((p) => p.spread_label === "viral" || p.spread_label === "cepat")
    .sort((a, b) => b.spread_velocity - a.spread_velocity)
    .slice(0, 15);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Radar Isu Viral & Kecepatan Sebar</h1>
        <p className="page-subtitle">
          Deteksi dini percepatan penyebaran postingan warga dan media sebelum menjadi viral secara masif
        </p>
      </div>

      <div className="page-content">
        <div className="card animate-fade-in delay-1" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <span className="card-title">Tren Kecepatan Sebar Percakapan (7 Hari Terakhir)</span>
              <span className="card-subtitle">Volume sebaran berdasarkan tingkatan laju (Lambat, Sedang, Cepat, dan Viral)</span>
            </div>
          </div>
          <div className="card-body">
            <EChart option={timelineOption} height={300} />
          </div>
        </div>

        <div className="card animate-fade-in delay-2" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <span className="card-title">Grafik Puncak Kecepatan (Peringatan Lonjakan Mendadak)</span>
              <span className="card-subtitle">Titik puncak percepatan interaksi per jam</span>
            </div>
          </div>
          <div className="card-body">
            <EChart option={maxVelocityOption} height={200} />
          </div>
        </div>

        <div className="card animate-fade-in delay-3">
          <div className="card-header">
            <div>
              <span className="card-title">Daftar Postingan Viral & Paling Cepat Menyebar</span>
              <span className="card-subtitle">Postingan yang memerlukan perhatian respons komunikasi segera</span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th style={{ minWidth: 280 }}>Teks</th>
                  <th>Topik</th>
                  <th>Sentimen</th>
                  <th>Velocity</th>
                  <th>Label</th>
                  <th>Engagement</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {viralPosts.map((post) => (
                  <tr key={post.id}>
                    <td><span className={`badge badge-${post.platform}`}>{platformLabel(post.platform)}</span></td>
                    <td>
                      <div style={{
                        maxWidth: 320,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontSize: "0.84rem",
                      }}>
                        {post.text}
                      </div>
                    </td>
                    <td><span className="badge badge-netral" style={{ fontSize: "0.7rem" }}>{topicLabel(post.topic)}</span></td>
                    <td><span className={`badge badge-${post.sentiment}`}>{post.sentiment}</span></td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", fontFamily: "monospace" }}>
                        {post.spread_velocity.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${post.spread_label === "viral" ? "badge-viral" : "badge-kritis"}`}>
                        {post.spread_label}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {post.likes} suka · {post.replies} balasan · {post.shares} sebar
                    </td>
                    <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{formatWIB(post.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

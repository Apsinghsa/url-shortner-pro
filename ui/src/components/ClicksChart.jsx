import { useEffect, useMemo, useRef, useState } from "react";

const PLOT = { left: 40, right: 792, top: 12, bottom: 232, w: 800, h: 260 };
const MAX_Y = 120;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYNAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const END = new Date(2026, 5, 23);

const fmtShort = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const fmtFull = (d) => `${DAYNAMES[d.getDay()]}, ${fmtShort(d)} ${d.getFullYear()}`;
const dateFor = (i) => {
  const d = new Date(END);
  d.setDate(d.getDate() - (29 - i));
  return d;
};

function hash(n, dayIdx) {
  let h = (dayIdx * 2654435761) ^ ((n + 1) * 1597334677);
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function buildTOTALS(seed = 1) {
  // Deterministic 30-day series with upward trend + weekend dip.
  // Returns array of 30 totals summing to ~1853 to match design feel.
  return Array.from({ length: 30 }, (_, i) => {
    const base = 28 + i * 2;
    const weekendDip = (i % 7 === 5 || i % 7 === 6) ? 0.55 : 1;
    const noise = 0.85 + hash(i, seed) * 0.4;
    return Math.round(base * weekendDip * noise);
  });
}

function buildDays(links, totals) {
  return totals.map((total, dayIdx) => {
    const raw = links.map((link, j) => {
      const variance = 0.65 + hash(j, dayIdx + 1) * 0.7;
      return Math.max(0, Math.round(total * link.share * variance));
    });
    const diff = total - raw.reduce((a, b) => a + b, 0);
    raw[0] = Math.max(0, raw[0] + diff);
    const parts = raw.map((count, j) => ({ slug: links[j].slug, count }));
    parts.sort((a, b) => b.count - a.count);
    return { total, parts };
  });
}

export default function ClicksChart({ links }) {
  const gridRef = useRef(null);
  const yAxisRef = useRef(null);
  const lineRef = useRef(null);
  const areaRef = useRef(null);
  const hoverLineRef = useRef(null);
  const hoverDotRef = useRef(null);
  const overlayRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const ttDayRef = useRef(null);
  const ttTotalRef = useRef(null);
  const ttRowsRef = useRef(null);
  const xAxisRef = useRef(null);
  const totalRef = useRef(null);

  const totals = useMemo(() => buildTOTALS(1), []);
  const DAYS = useMemo(() => buildDays(links, totals), [links, totals]);
  const pts = useMemo(
    () =>
      DAYS.map((d, i) => ({
        x: PLOT.left + (i / 29) * (PLOT.right - PLOT.left),
        y: PLOT.bottom - (d.total / MAX_Y) * (PLOT.bottom - PLOT.top),
        d,
      })),
    [DAYS]
  );

  // Build axes + paths on mount/update
  useEffect(() => {
    // grid + y-axis labels
    if (gridRef.current) gridRef.current.innerHTML = "";
    if (yAxisRef.current) yAxisRef.current.innerHTML = "";
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = PLOT.top + ((PLOT.bottom - PLOT.top) / steps) * i;
      const val = Math.round(MAX_Y - (MAX_Y / steps) * i);
      const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", PLOT.left);
      ln.setAttribute("x2", PLOT.right);
      ln.setAttribute("y1", y);
      ln.setAttribute("y2", y);
      gridRef.current?.appendChild(ln);
      const tx = document.createElementNS("http://www.w3.org/2000/svg", "text");
      tx.setAttribute("x", PLOT.left - 8);
      tx.setAttribute("y", y);
      tx.setAttribute("text-anchor", "end");
      tx.setAttribute("class", "axis-text");
      tx.textContent = val;
      yAxisRef.current?.appendChild(tx);
    }
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", PLOT.left);
    xAxis.setAttribute("x2", PLOT.right);
    xAxis.setAttribute("y1", PLOT.bottom);
    xAxis.setAttribute("y2", PLOT.bottom);
    xAxis.setAttribute("class", "axis-line");
    yAxisRef.current?.appendChild(xAxis);

    // x-axis labels (sparse)
    if (xAxisRef.current) xAxisRef.current.innerHTML = "";
    [0, 5, 10, 15, 20, 25, 29].forEach((i) => {
      const s = document.createElement("span");
      s.textContent = fmtShort(dateFor(i));
      xAxisRef.current?.appendChild(s);
    });

    // smooth path (Catmull-Rom → cubic bezier)
    const tension = 0.2;
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) * tension;
      const c1y = p1.y + (p2.y - p0.y) * tension;
      const c2x = p2.x - (p3.x - p1.x) * tension;
      const c2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    if (lineRef.current) lineRef.current.setAttribute("d", d);
    const areaD = d + ` L ${pts[pts.length - 1].x.toFixed(2)},${PLOT.bottom} L ${pts[0].x.toFixed(2)},${PLOT.bottom} Z`;
    if (areaRef.current) areaRef.current.setAttribute("d", areaD);

    // total sum
    const sum = totals.reduce((a, b) => a + b, 0);
    if (totalRef.current) totalRef.current.textContent = sum.toLocaleString();
  }, [pts, totals]);

  // hover
  useEffect(() => {
    const overlay = overlayRef.current;
    const svg = svgRef.current;
    const hoverLine = hoverLineRef.current;
    const hoverDot = hoverDotRef.current;
    const tooltip = tooltipRef.current;
    if (!overlay || !svg || !hoverLine || !hoverDot || !tooltip) return;

    const findNearest = (mx) => {
      let n = 0, m = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const dist = Math.abs(pts[i].x - mx);
        if (dist < m) { m = dist; n = i; }
      }
      return n;
    };

    function onMove(e) {
      const rect = overlay.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const svgX = (mx / rect.width) * PLOT.w;
      const idx = findNearest(svgX);
      const p = pts[idx];
      hoverLine.setAttribute("x1", p.x);
      hoverLine.setAttribute("x2", p.x);
      hoverLine.setAttribute("y1", PLOT.top);
      hoverLine.setAttribute("y2", PLOT.bottom);
      hoverDot.setAttribute("cx", p.x);
      hoverDot.setAttribute("cy", p.y);
      svg.classList.add("in-hover");
      if (ttDayRef.current) ttDayRef.current.textContent = fmtFull(dateFor(idx));
      if (ttTotalRef.current) ttTotalRef.current.textContent = p.d.total.toLocaleString();
      if (ttRowsRef.current) {
        ttRowsRef.current.innerHTML = "";
        p.d.parts.forEach((part, i) => {
          const row = document.createElement("div");
          row.className = "tt-row";
          row.innerHTML = `<span class="rank">${i + 1}.</span><span class="slug">${part.slug}</span><span class="count">${part.count}</span>`;
          ttRowsRef.current.appendChild(row);
        });
      }
      const ttW = tooltip.offsetWidth;
      const ttH = tooltip.offsetHeight;
      let tx = mx + 14, ty = my + 14;
      if (mx + ttW + 28 > rect.width) tx = mx - ttW - 14;
      if (my + ttH + 28 > rect.height) ty = my - ttH - 14;
      tx = Math.max(4, Math.min(rect.width - ttW - 4, tx));
      ty = Math.max(4, Math.min(rect.height - ttH - 4, ty));
      tooltip.style.transform = `translate(${tx}px, ${ty}px)`;
      tooltip.classList.add("show");
      tooltip.setAttribute("aria-hidden", "false");
    }
    function onLeave() {
      svg.classList.remove("in-hover");
      tooltip.classList.remove("show");
      tooltip.setAttribute("aria-hidden", "true");
    }
    overlay.addEventListener("mousemove", onMove);
    overlay.addEventListener("mouseleave", onLeave);
    return () => {
      overlay.removeEventListener("mousemove", onMove);
      overlay.removeEventListener("mouseleave", onLeave);
    };
  }, [pts]);

  return (
    <div
      className="chart"
      data-od-id="clicks-chart"
      data-slot="chart"
      data-chart="clicks-30d"
      role="img"
      aria-label="Total clicks per day over the last 30 days, combined across all links. Hover for top links per day."
    >
      <div className="chart-head">
        <div className="title-block">
          <p className="eyebrow eyebrow-sm">// clicks_over_time</p>
          <h2>total_clicks_per_day</h2>
        </div>
        <div className="total-block">
          <span className="value num" ref={totalRef}>—</span>
          <span className="label">last_30_days · combined</span>
          <span className="delta">+18% vs. prev. period</span>
        </div>
      </div>
      <div className="chart-body">
        <svg
          className="chart-svg"
          viewBox="0 0 800 260"
          preserveAspectRatio="none"
          aria-hidden="true"
          ref={svgRef}
        >
          <g className="grid" ref={gridRef}></g>
          <g className="axis" ref={yAxisRef}></g>
          <path className="area" ref={areaRef} d=""></path>
          <path className="line" ref={lineRef} d=""></path>
          <line className="hover-line" ref={hoverLineRef} x1="0" y1="0" x2="0" y2="232"></line>
          <circle className="hover-dot" ref={hoverDotRef} cx="0" cy="0" r="4"></circle>
        </svg>
        <div className="chart-overlay" ref={overlayRef} aria-hidden="true"></div>
        <div
          className="chart-tooltip"
          ref={tooltipRef}
          role="tooltip"
          aria-hidden="true"
        >
          <div className="tt-day" ref={ttDayRef}>—</div>
          <div className="tt-total">
            <span className="lbl">total_clicks</span>
            <span className="val" ref={ttTotalRef}>—</span>
          </div>
          <div ref={ttRowsRef}></div>
        </div>
      </div>
      <div className="chart-x-axis" ref={xAxisRef}></div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserLinks } from "../services/linkService";
import Footer from "../components/Footer";
import ClicksChart from "../components/ClicksChart";

const PROTOTYPE_LINKS = [
  { slug: "aB12xY9z", share: 0.30, clicks: 412, longUrl: "https://example.com/products/launch/2026/q2/roadmap" },
  { slug: "launch",   share: 0.24, clicks: 287, longUrl: "https://newsletter.example.com/issues/issue-42-launching-mikku" },
  { slug: "v040",     share: 0.18, clicks: 134, longUrl: "https://github.com/anomalyco/url-shortner/releases/tag/v0.4.0" },
  { slug: "blogpost", share: 0.16, clicks: 96,  longUrl: "https://blog.example.com/2026/06/why-we-built-mikku" },
  { slug: "demo",     share: 0.12, clicks: 52,  longUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
];

const SHORT_URL_RE = /^(https?:\/\/mikku\.site\/)(.+)$/;
function truncateShortUrl(url) {
  const m = url.match(SHORT_URL_RE);
  if (!m) return url;
  const [, prefix, slug] = m;
  return slug.length > 10 ? prefix + slug.slice(0, 10) + "...." : url;
}

function CopyIcon() {
  return (
    <svg className="icon icon-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="5" width="9" height="9" rx="1.5" />
      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-5A1.5 1.5 0 0 0 3 3.5v5A1.5 1.5 0 0 0 4.5 10H5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="icon icon-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.5 3.5L13 5" />
    </svg>
  );
}

function UrlRow({ slug, longUrl, clicks, isShort = false, copiedKey, onCopy }) {
  const fullUrl = isShort ? `https://mikku.site/${slug}` : longUrl;
  const fullHref = isShort ? fullUrl : longUrl;
  const visible = isShort ? truncateShortUrl(fullUrl) : longUrl;
  const dataUrl = isShort ? fullUrl : longUrl;
  const key = `${isShort ? "s" : "o"}-${slug}`;
  const copied = copiedKey === key;
  return (
    <div className="url-cell-row">
      <a
        className={`url ${isShort ? "short-cell" : "url-cell"}`}
        href={fullHref}
        target="_blank"
        rel="noopener noreferrer"
        title={fullHref}
      >
        {visible}
      </a>
      <button
        className={`url-copy ${copied ? "copied" : ""}`}
        data-url={dataUrl}
        aria-label={isShort ? "Copy short URL" : "Copy original URL"}
        type="button"
        onClick={() => onCopy(key, dataUrl)}
      >
        <CopyIcon />
        <CheckIcon />
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await getUserLinks(token);
        if (cancelled) return;
        const list = response?.data ?? response?.links ?? [];
        if (list.length > 0) {
          setLinks(
            list.map((l) => ({
              slug: l.shortCode ?? l.slug ?? l.code ?? l._id,
              share: 1 / list.length,
              clicks: l.clicks ?? 0,
              longUrl: l.longUrl,
            }))
          );
        } else {
          setLinks(PROTOTYPE_LINKS);
        }
      } catch (err) {
        if (cancelled) return;
        setLinks(PROTOTYPE_LINKS);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token, isAuthenticated]);

  async function handleCopy(key, url) {
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
  }

  const totalClicks = links.reduce((a, l) => a + l.clicks, 0);
  const totalLinks = 12;
  const thisWeek = 312;
  const topReferrer = "twitter.com";

  return (
    <>
      <div className="container">
        <div className="page-head">
          <p className="eyebrow">// dashboard</p>
          <h1 className="dashboard">my_dashboard</h1>
          <p className="lead">Welcome back. Here are all the links you have created.</p>
        </div>

        <div className="stats-row" data-od-id="stats">
          <div className="stat-block">
            <span className="label">total_links</span>
            <span className="value num">{totalLinks}</span>
          </div>
          <div className="stat-block">
            <span className="label">total_clicks</span>
            <span className="value num">1,847</span>
            <span className="delta">+18% vs. last month</span>
          </div>
          <div className="stat-block">
            <span className="label">this_week</span>
            <span className="value num">{thisWeek}</span>
          </div>
          <div className="stat-block">
            <span className="label">top_referrer</span>
            <span className="value" style={{ fontSize: 16 }}>{topReferrer}</span>
          </div>
        </div>

        <ClicksChart links={links.length > 0 ? links : PROTOTYPE_LINKS} />

        <div id="table-region">
          <div className="table-wrap" data-od-id="links-table">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>original_url</th>
                  <th>short_url</th>
                  <th className="num-col">clicks</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="loading-state">
                        <div className="spinner-md" />
                        <p>loading your links…</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  links.map((link) => (
                    <tr key={link.slug}>
                      <td>
                        <UrlRow
                          slug={link.slug}
                          longUrl={link.longUrl}
                          clicks={link.clicks}
                          isShort={false}
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                        />
                      </td>
                      <td>
                        <UrlRow
                          slug={link.slug}
                          longUrl={link.longUrl}
                          clicks={link.clicks}
                          isShort={true}
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                        />
                      </td>
                      <td className="num-col">{link.clicks.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer meta={`12 links · 1,847 clicks · all-time`} />
    </>
  );
}

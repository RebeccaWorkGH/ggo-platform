"use client";
import { useState, useRef, useEffect } from "react";

const getCurrentMonth = () => new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
const getDateRange = () => {
  const now = new Date();
  const prior = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return `${prior.toLocaleDateString("en-US", { month: "long", year: "numeric" })} to ${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
};

const YEAR = new Date().getFullYear();
const MONTH = new Date().toLocaleDateString("en-US", { month: "long" });
const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const CUTOFF = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

// For each PST, we search the LISTING/NEWS pages of authoritative orgs directly
// This guarantees we get newest publications, not old popular ones
const makePSTs = () => [
  {
    id: "agri", label: "Agriculture Development", icon: "🌾",
    query: `Today is ${TODAY}. Find up to 5 research reports or articles published after ${CUTOFF} on agricultural development, food systems, smallholder farmers, food security, or crop biotechnology. Search site:worldbank.org OR site:fao.org OR site:cgiar.org OR site:gatesfoundation.org with date filter ${YEAR}. Also check https://www.fao.org/publications/en/ and https://www.cgiar.org/news-events/news/ for newest items. Only include sources clearly dated in ${YEAR} — skip anything from ${YEAR - 1} or earlier.`,
  },
  {
    id: "dpi", label: "Digital Public Infrastructure", icon: "📡",
    query: `Today is ${TODAY}. Find up to 5 research reports or articles published after ${CUTOFF} on digital public infrastructure, DPI, mobile money, digital identity, or digital transformation in LMICs. Search site:gsma.com OR site:worldbank.org OR site:itu.int with date filter ${YEAR}. Also check https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-for-development/reports/ for newest items. Only include sources clearly dated in ${YEAR} — skip anything from ${YEAR - 1} or earlier.`,
  },
  {
    id: "edu", label: "Global Education", icon: "📚",
    query: `Today is ${TODAY}. Find up to 5 research reports or articles published after ${CUTOFF} on global education, learning outcomes, girls' education, education technology, or skills development in LMICs. Search site:unicef.org OR site:worldbank.org OR site:unesco.org OR site:globalpartnership.org with date filter ${YEAR}. Only include sources clearly dated in ${YEAR} — skip anything from ${YEAR - 1} or earlier.`,
  },
  {
    id: "ifs", label: "Inclusive Financial Systems", icon: "💳",
    query: `Today is ${TODAY}. Find up to 5 research reports or articles published after ${CUTOFF} on financial inclusion, mobile money, women's financial access, fintech for development, or microfinance. Search site:cgap.org OR site:gsma.com OR site:worldbank.org OR site:imf.org with date filter ${YEAR}. Also check https://www.cgap.org/research/publications for newest items. Only include sources clearly dated in ${YEAR} — skip anything from ${YEAR - 1} or earlier.`,
  },
  {
    id: "nutrition", label: "Nutrition", icon: "🥗",
    query: `Today is ${TODAY}. Find up to 5 research reports or articles published after ${CUTOFF} on nutrition, malnutrition, food fortification, stunting, or dietary diversity in LMICs. Search site:who.int OR site:unicef.org OR site:fao.org OR site:ifpri.org with date filter ${YEAR}. Also search PubMed for nutrition LMIC ${YEAR}. Only include sources clearly dated in ${YEAR} — skip anything from ${YEAR - 1} or earlier.`,
  },
  {
    id: "wash", label: "WSH", icon: "💧",
    query: `Today is ${TODAY}. Find up to 5 research reports or articles published after ${CUTOFF} on water, sanitation and hygiene (WASH), safely managed water, WASH financing, or menstrual hygiene in LMICs. Search site:wateraid.org OR site:unicef.org OR site:who.int OR site:worldbank.org with date filter ${YEAR}. Also check https://washmatters.wateraid.org/ for newest items. Only include sources clearly dated in ${YEAR} — skip anything from ${YEAR - 1} or earlier.`,
  },
  {
    id: "ai", label: "AI & Innovation", icon: "🤖",
    query: `Today is ${TODAY}. Find up to 5 research reports or articles published after ${CUTOFF} on AI for development, AI in agriculture or health or education in LMICs, or responsible AI for global development. Search site:oecd.org OR site:worldbank.org OR site:brookings.edu OR site:cgdev.org with date filter ${YEAR}. Only include sources clearly dated in ${YEAR} — skip anything from ${YEAR - 1} or earlier.`,
  },
  {
    id: "hari", label: "Hari's Corner", icon: "📰",
    query: `Today is ${TODAY}. Find up to 5 high-signal articles published after ${CUTOFF} on global development, geopolitics, macro-economic risks, or technology and society that GGO leadership at the Gates Foundation should be tracking. Search site:economist.com OR site:ft.com OR site:project-syndicate.org OR site:weforum.org OR site:ourworldindata.org with date filter ${YEAR}. Only include sources clearly dated in ${YEAR} — skip anything from ${YEAR - 1} or earlier.`,
  },
];

const makeSystemPrompt = (pstLabel) => `You are the GGO Insights Platform digest writer for the Gates Foundation's ${pstLabel} team. Today is ${TODAY}.

YOUR MOST IMPORTANT RULE: Every source you include MUST have a verified publication date in ${YEAR} (after ${CUTOFF}). Before writing up any article, confirm its publication date. If you cannot confirm it was published in ${YEAR}, DO NOT include it. It is better to include 1-2 verified recent articles than 5 articles of unknown or old dates.

Search the specific URLs and queries provided. For each source found, check the publication date first — if it says ${YEAR - 1} or earlier anywhere on the page, skip it entirely and search for something newer.

For each article found, write an entry in EXACTLY this format:

ARTICLE: [Full Article Title]
SOURCE: [Organization/Author, Year]
SUMMARY: [2-3 sentences summarizing what the article argues. Be specific — cite data points and main conclusions.]
TAKEAWAYS:
- [**Bold key term**]: [1-2 sentence explanation]
- [**Bold key term**]: [1-2 sentence explanation]
- [**Bold key term**]: [1-2 sentence explanation]
RECOMMENDATIONS:
- [**Bold key term**]: [1-2 sentence recommendation]
- [**Bold key term**]: [1-2 sentence recommendation]
- [**Bold key term**]: [1-2 sentence recommendation]
---END---

After all articles, write:

SYNTHESIS_TITLE: [A compelling thematic title for this month's ${pstLabel} synthesis]
SYNTHESIS_BODY:
[Paragraph 1: 3-4 sentences connecting the main themes.]

[Paragraph 2: 3-4 sentences on the most important tension or trade-off.]

[Paragraph 3: 3-4 sentences on implications for GGO leadership.]

SYNTHESIS_RECS:
- [**Bold action**]: [1-2 sentence recommendation]
- [**Bold action**]: [1-2 sentence recommendation]
- [**Bold action**]: [1-2 sentence recommendation]
---SYNTHESIS_END---

Use real sources found via web search. Cite real data. Do not fabricate.`;

// Static PSTs list for UI rendering (sidebars, home grid, etc.)
const PSTs = [
  { id: "agri",      label: "Agriculture Development",       icon: "🌾" },
  { id: "dpi",       label: "Digital Public Infrastructure", icon: "📡" },
  { id: "edu",       label: "Global Education",              icon: "📚" },
  { id: "ifs",       label: "Inclusive Financial Systems",   icon: "💳" },
  { id: "nutrition", label: "Nutrition",                     icon: "🥗" },
  { id: "wash",      label: "WSH",                          icon: "💧" },
  { id: "ai",        label: "AI & Innovation",               icon: "🤖" },
  { id: "hari",      label: "Hari's Corner",                 icon: "📰" },
];

async function callClaude(payload) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`API returned non-JSON response: ${text.slice(0, 120)}`);
  }
}

async function callWithSearch(systemPrompt, userQuery) {
  let messages = [{ role: "user", content: userQuery }];
  let fullText = "";
  let iters = 0;
  while (iters < 12) {
    iters++;
    const data = await callClaude({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: systemPrompt, tools: [{ type: "web_search_20250305", name: "web_search" }], messages });
    if (data.error) throw new Error(data.error.message);
    for (const b of data.content || []) { if (b.type === "text") fullText += b.text; }
    if (data.stop_reason === "end_turn") break;
    if (data.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: data.content });
      const results = (data.content || []).filter((b) => b.type === "tool_use").map((b) => ({ type: "tool_result", tool_use_id: b.id, content: "Search executed." }));
      messages.push({ role: "user", content: results });
    } else break;
  }
  return fullText;
}

async function askBriefing(digestContent, history, question) {
  const system = `You are the GGO Intelligence Briefing assistant for the Gates Foundation. You have access to the current month's GGO Insights Platform digest, generated from live web research. Answer questions from GGO leadership in a clear, synthesized, decision-ready format. Always cite the source organization and article title for specific claims. Be concise but substantive.\n\nCURRENT DIGEST CONTENT:\n${digestContent}`;
  const messages = [...history.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: question }];
  const data = await callClaude({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages });
  return data.content?.find((b) => b.type === "text")?.text || "Unable to retrieve briefing.";
}

function parseSection(text) {
  const articles = [];
  let synthesis = null;
  const blocks = text.split("---END---").filter((b) => b.trim());
  for (const block of blocks) {
    if (block.includes("SYNTHESIS_TITLE:")) {
      const t = block.match(/SYNTHESIS_TITLE:\s*(.+)/);
      const b = block.match(/SYNTHESIS_BODY:\s*([\s\S]*?)(?=SYNTHESIS_RECS:|---SYNTHESIS_END---|$)/);
      const r = block.match(/SYNTHESIS_RECS:\s*([\s\S]*?)(?=---SYNTHESIS_END---|$)/);
      if (t) synthesis = { title: t[1].trim(), body: b ? b[1].trim() : "", recs: r ? r[1].split("\n").filter((l) => l.trim().startsWith("-")).map((l) => l.replace(/^-\s*/, "").trim()) : [] };
    } else if (block.includes("ARTICLE:")) {
      const t = block.match(/ARTICLE:\s*(.+)/);
      const s = block.match(/SOURCE:\s*(.+)/);
      const su = block.match(/SUMMARY:\s*([\s\S]*?)(?=TAKEAWAYS:|$)/);
      const tk = block.match(/TAKEAWAYS:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/);
      const rc = block.match(/RECOMMENDATIONS:\s*([\s\S]*?)$/);
      const bullets = (str) => str ? str.split("\n").filter((l) => l.trim().startsWith("-")).map((l) => l.replace(/^-\s*/, "").trim()) : [];
      if (t && s) articles.push({ title: t[1].trim(), source: s[1].trim(), summary: su ? su[1].trim() : "", takeaways: bullets(tk?.[1]), recommendations: bullets(rc?.[1]) });
    }
  }
  return { articles, synthesis };
}

function Bold({ t, dark }) {
  return (t || "").split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} style={{ color: dark ? "#e8c87a" : "#8B1A1A", fontWeight: 600 }}>{p.slice(2, -2)}</strong>
      : p
  );
}

function ArticleCard({ article }) {
  return (
    <div style={A.card}>
      <div style={A.source}>{article.source}</div>
      <h3 style={A.title}>{article.title}</h3>
      <p style={A.summary}>{article.summary}</p>
      {article.takeaways?.length > 0 && (<div style={A.section}><div style={A.sectionLabel}>Key Takeaways</div>{article.takeaways.map((t, i) => <div key={i} style={A.bullet}><span style={A.dot}>•</span><span><Bold t={t} /></span></div>)}</div>)}
      {article.recommendations?.length > 0 && (<div style={A.section}><div style={A.sectionLabel}>Recommendations</div>{article.recommendations.map((r, i) => <div key={i} style={A.bullet}><span style={A.dot}>•</span><span><Bold t={r} /></span></div>)}</div>)}
    </div>
  );
}

function SynthesisCard({ synthesis }) {
  return (
    <div style={A.synth}>
      <div style={A.synthBadge}>Monthly Synthesis</div>
      <h3 style={A.synthTitle}>{synthesis.title}</h3>
      <div style={A.synthDivider} />
      {synthesis.body.split(/\n\n+/).filter((p) => p.trim()).map((p, i) => <p key={i} style={A.synthPara}>{p}</p>)}
      {synthesis.recs?.length > 0 && (<div style={A.section}><div style={{ ...A.sectionLabel, color: "#c9963a" }}>Actionable Recommendations</div>{synthesis.recs.map((r, i) => <div key={i} style={A.bullet}><span style={{ ...A.dot, color: "#c9963a" }}>›</span><span style={{ color: "#e8e2d8" }}><Bold t={r} dark /></span></div>)}</div>)}
    </div>
  );
}

function formatMsg(text) {
  return (text || "").split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: "0.5rem" }} />;
    if (line.startsWith("### ")) return <h3 key={i} style={{ color: "#e8c87a", fontFamily: "'Lora',serif", fontSize: "14px", margin: "0.5rem 0 0.2rem" }}>{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} style={{ color: "#e8c87a", fontFamily: "'Lora',serif", fontSize: "16px", margin: "0.5rem 0 0.2rem" }}>{line.slice(3)}</h2>;
    if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} style={{ margin: "0.2rem 0", paddingLeft: "8px", color: "#b8b4ac", fontSize: "13.5px" }}>{"› " + line.slice(2)}</p>;
    return <p key={i} style={{ margin: "0.15rem 0", color: "#e8e4d8", fontSize: "13.5px", lineHeight: 1.65 }}>{line}</p>;
  });
}

export default function GGOPlatform() {
  const [mode, setMode] = useState("home");
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState([]);
  const [digestData, setDigestData] = useState({});
  const [digestText, setDigestText] = useState("");
  const [activePST, setActivePST] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [generationDone, setGenerationDone] = useState(false);
  const progressRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => { progressRef.current?.scrollIntoView({ behavior: "smooth" }); }, [genProgress]);
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, chatLoading]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ggo_digest");
      if (saved) {
        const parsed = JSON.parse(saved);
        setDigestData(parsed.data || {});
        setDigestText(parsed.text || "");
        setGenerationDone(true);
      }
    } catch {}
  }, []);

  async function runGeneration() {
    const PSTs = makePSTs();
    setGenerating(true);
    setGenProgress([]);
    const newData = {};
    let fullText = `GGO INSIGHTS PLATFORM — FULL MONTHLY DIGEST\nGenerated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}\n\n`;

    for (const pst of PSTs) {
      setGenProgress((p) => [...p, { type: "start", label: `Starting ${pst.label}…`, id: pst.id }]);
      try {
        const raw = await callWithSearch(makeSystemPrompt(pst.label), pst.query);
        const { articles, synthesis } = parseSection(raw);
        newData[pst.id] = { articles, synthesis };
        fullText += `\n=== ${pst.label.toUpperCase()} ===\n\n`;
        articles.forEach((a) => {
          fullText += `${a.title}\n${a.source}\n\n${a.summary}\n\nKey Takeaways:\n`;
          a.takeaways.forEach((t) => (fullText += `• ${t.replace(/\*\*/g, "")}\n`));
          fullText += "\nRecommendations:\n";
          a.recommendations.forEach((r) => (fullText += `• ${r.replace(/\*\*/g, "")}\n`));
          fullText += "\n";
        });
        if (synthesis) {
          fullText += `\nSynthesis: ${synthesis.title}\n${synthesis.body.replace(/\*\*/g, "")}\n\n`;
          synthesis.recs.forEach((r) => (fullText += `• ${r.replace(/\*\*/g, "")}\n`));
        }
        setDigestData({ ...newData });
        setGenProgress((p) => [...p, { type: "done", label: `${pst.label} — ${articles.length} articles`, id: pst.id }]);
      } catch (e) {
        setGenProgress((p) => [...p, { type: "error", label: `${pst.label} — failed: ${e.message}`, id: pst.id }]);
      }
    }

    setDigestText(fullText);
    setGenerationDone(true);
    setGenerating(false);
    try { localStorage.setItem("ggo_digest", JSON.stringify({ data: newData, text: fullText })); } catch {}
  }

  function exportToPDF() {
    const month = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const bold = (t) => (t || "").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GGO Insights — ${month}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;color:#1a0e00;background:#faf8f4;font-size:13px}
.cover{background:#1a0e00;color:#f5f0e8;padding:64px 56px;min-height:100vh;display:flex;flex-direction:column;justify-content:center;page-break-after:always}
.cover-eye{font-size:10px;letter-spacing:.18em;color:#c9963a;text-transform:uppercase;margin-bottom:20px}
.cover-title{font-family:'Lora',serif;font-size:42px;font-weight:600;margin-bottom:12px;line-height:1.2}
.cover-date{font-size:14px;color:#8a7a6a;margin-bottom:40px}
.cover-line{height:1px;background:#3a2510;margin-bottom:32px}
.cover-desc{font-size:14px;color:#c8c0b0;line-height:1.8;max-width:500px}
.cover-toc{margin-top:48px}.cover-toc-title{font-size:10px;letter-spacing:.14em;color:#c9963a;text-transform:uppercase;margin-bottom:16px}
.cover-toc-item{font-size:13px;color:#8a7a6a;margin-bottom:8px;display:flex;gap:12px;align-items:center}
.cover-toc-dot{width:6px;height:6px;border-radius:50%;background:#c9963a;flex-shrink:0}
.pst{padding:48px 56px;page-break-before:always}
.pst-hdr{display:flex;align-items:center;gap:12px;margin-bottom:32px;padding-bottom:16px;border-bottom:2px solid #e8e0d4}
.pst-icon{font-size:22px}.pst-name{font-family:'Lora',serif;font-size:24px;font-weight:600;color:#1a0e00}
.article{background:#fff;border:1px solid #e8e0d4;border-top:3px solid #8B1A1A;border-radius:8px;padding:24px 28px;margin-bottom:20px;page-break-inside:avoid}
.art-src{font-size:11px;color:#8B1A1A;font-style:italic;font-family:'Lora',serif;margin-bottom:6px}
.art-title{font-family:'Lora',serif;font-size:17px;font-weight:600;color:#1a0e00;margin-bottom:10px;line-height:1.3}
.art-sum{font-size:13px;color:#3a3432;line-height:1.75;margin-bottom:14px}
.sec-lbl{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8B1A1A;font-weight:500;margin:14px 0 8px}
.bullet{display:flex;gap:8px;font-size:13px;line-height:1.6;color:#3a3432;margin-bottom:6px}
.bdot{color:#8B1A1A;flex-shrink:0;font-weight:600}strong{color:#8B1A1A;font-weight:600}
.synth{background:#1a0e00;border-radius:8px;padding:28px 32px;margin-top:24px;page-break-inside:avoid}
.synth-badge{display:inline-block;background:rgba(201,150,58,.15);color:#c9963a;font-size:10px;letter-spacing:.14em;text-transform:uppercase;border-radius:4px;padding:3px 8px;margin-bottom:12px}
.synth-title{font-family:'Lora',serif;font-size:18px;font-weight:600;color:#f5f0e8;margin-bottom:12px;line-height:1.3}
.synth-line{height:1px;background:#3a2510;margin-bottom:14px}
.synth-p{font-size:13px;color:#c8c0b0;line-height:1.8;margin-bottom:10px}
.synth-lbl{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#c9963a;font-weight:500;margin:14px 0 8px}
.synth-b{display:flex;gap:8px;font-size:13px;line-height:1.6;color:#e8e2d8;margin-bottom:6px}
.synth-dot{color:#c9963a;flex-shrink:0}.synth strong{color:#e8c87a}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.cover,.synth{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>`;
    html += `<div class="cover"><div class="cover-eye">Gates Foundation · GGO Division · Confidential</div><h1 class="cover-title">GGO Insights Platform</h1><div class="cover-date">${month} · Monthly Intelligence Digest</div><div class="cover-line"></div><div class="cover-desc">Autonomous research synthesis across ${totalDone} PST areas. Generated from live web research and AI synthesis. For internal GGO leadership use.</div><div class="cover-toc"><div class="cover-toc-title">Contents</div>`;
    PSTs.forEach((p) => { if (pstDone(p.id)) html += `<div class="cover-toc-item"><div class="cover-toc-dot"></div>${p.icon} ${p.label} — ${digestData[p.id]?.articles?.length || 0} articles</div>`; });
    html += `</div></div>`;
    PSTs.forEach((pst) => {
      const d = digestData[pst.id];
      if (!d?.articles?.length) return;
      html += `<div class="pst"><div class="pst-hdr"><span class="pst-icon">${pst.icon}</span><span class="pst-name">${pst.label}</span></div>`;
      d.articles.forEach((a) => {
        html += `<div class="article"><div class="art-src">${a.source}</div><div class="art-title">${a.title}</div><div class="art-sum">${a.summary}</div>`;
        if (a.takeaways?.length) { html += `<div class="sec-lbl">Key Takeaways</div>`; a.takeaways.forEach((t) => { html += `<div class="bullet"><span class="bdot">•</span><span>${bold(t)}</span></div>`; }); }
        if (a.recommendations?.length) { html += `<div class="sec-lbl">Recommendations</div>`; a.recommendations.forEach((r) => { html += `<div class="bullet"><span class="bdot">•</span><span>${bold(r)}</span></div>`; }); }
        html += `</div>`;
      });
      if (d.synthesis) {
        const { title, body, recs } = d.synthesis;
        html += `<div class="synth"><div class="synth-badge">Monthly Synthesis</div><div class="synth-title">${title}</div><div class="synth-line"></div>`;
        body.split(/\n\n+/).filter((p) => p.trim()).forEach((p) => { html += `<div class="synth-p">${p}</div>`; });
        if (recs?.length) { html += `<div class="synth-lbl">Actionable Recommendations</div>`; recs.forEach((r) => { html += `<div class="synth-b"><span class="synth-dot">›</span><span>${bold(r)}</span></div>`; }); }
        html += `</div>`;
      }
      html += `</div>`;
    });
    html += `</body></html>`;
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to export PDF."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 800);
  }

  async function sendChat(q) {
    if (!q.trim() || chatLoading) return;
    const userMsg = { role: "user", content: q };
    setChatHistory((h) => [...h, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const ans = await askBriefing(digestText, chatHistory, q);
      setChatHistory((h) => [...h, { role: "assistant", content: ans }]);
    } catch { setChatHistory((h) => [...h, { role: "assistant", content: "Error retrieving briefing." }]); }
    setChatLoading(false);
  }

  const pstDone = (id) => !!(digestData[id]?.articles?.length);
  const totalDone = PSTs.filter((p) => pstDone(p.id)).length;

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .pst-tab:hover{background:#2a1a08!important;color:#e8c87a!important}
        .msg-input:focus{outline:none;border-color:#c9963a!important}
        .sugg:hover{background:#2a1a08!important;color:#c8b898!important}
        .nav-btn:hover{opacity:0.8}
      `}</style>

      <div style={S.nav}>
        <div style={S.navLogo} onClick={() => setMode("home")}><span style={S.navLogoMark}>GGO</span><span style={S.navLogoSub}>Insights Platform</span></div>
        <div style={S.navCenter}>
          {[["home", "Home"], ["generate", "Digest Generator"], ["briefing", "Intelligence Briefing"]].map(([m, l]) => (
            <button key={m} className="nav-btn" style={{ ...S.navBtn, ...(mode === m ? S.navBtnActive : {}) }} onClick={() => setMode(m)}>{l}</button>
          ))}
        </div>
        <div style={S.navRight}>
          {generationDone && <span style={S.navBadge}>{totalDone}/11 PSTs</span>}
          {generationDone && <button className="nav-btn" style={{ ...S.navBtn, marginLeft: "8px", color: C.accent, border: `1px solid ${C.accent}44`, borderRadius: "6px" }} onClick={exportToPDF}>⬇ Export PDF</button>}
        </div>
      </div>

      {mode === "home" && (
        <div style={S.homePage}>
          <div style={S.homeHero}>
            <div style={S.homeEyebrow}>GATES FOUNDATION · GGO DIVISION</div>
            <h1 style={S.homeTitle}>Insights Platform</h1>
            <p style={S.homeSubtitle}>Autonomous monthly intelligence across all 11 PST areas, powered by live web research and AI synthesis.</p>
            <div style={S.homeActions}>
              <button style={S.heroBtnPrimary} onClick={() => setMode("generate")}>{generationDone ? `Regenerate Digest (${totalDone}/11 PSTs ready)` : "Generate This Month's Digest"}</button>
              {generationDone && <button style={S.heroBtnSecondary} onClick={() => setMode("briefing")}>Open Briefing →</button>}
              {generationDone && <button style={{ ...S.heroBtnSecondary, borderColor: `${C.accent}66`, color: C.accent }} onClick={exportToPDF}>⬇ Export PDF</button>}
            </div>
          </div>
          <div style={S.homeGrid}>
            {PSTs.map((pst) => (
              <div key={pst.id} style={{ ...S.homeCard, ...(pstDone(pst.id) ? S.homeCardDone : {}) }} onClick={() => { if (pstDone(pst.id)) { setActivePST(pst.id); setMode("generate"); } }}>
                <div style={S.homeCardIcon}>{pst.icon}</div>
                <div style={S.homeCardLabel}>{pst.label}</div>
                {pstDone(pst.id) ? <div style={S.homeCardCount}>{digestData[pst.id]?.articles?.length} articles</div> : <div style={S.homeCardPending}>Pending</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "generate" && (
        <div style={S.genPage}>
          <div style={S.genSidebar}>
            <div style={S.genSideTitle}>PST Areas</div>
            {PSTs.map((pst) => (
              <button key={pst.id} className="pst-tab" style={{ ...S.pstTab, ...(activePST === pst.id ? S.pstTabActive : {}), ...(pstDone(pst.id) ? S.pstTabDone : {}) }} onClick={() => setActivePST(pst.id)}>
                <span>{pst.icon}</span><span style={{ flex: 1 }}>{pst.label}</span>{pstDone(pst.id) && <span style={S.pstCheck}>✓</span>}
              </button>
            ))}
            <div style={{ marginTop: "1.5rem" }}>
              {!generating ? <button style={S.fullGenBtn} onClick={runGeneration}>{generationDone ? "↺ Regenerate All" : "⚡ Generate All PSTs"}</button>
                : <div style={S.genRunning}><div style={S.spinner} /><span>Running…</span></div>}
            </div>
          </div>
          <div style={S.genMain}>
            {genProgress.length > 0 && (
              <div style={S.progressBox}>
                <div style={S.progressTitle}>{generating ? "Generating digest…" : `Complete — ${totalDone}/11 PST areas`}</div>
                {genProgress.map((p, i) => (<div key={i} style={S.progressLine}><span style={{ color: p.type === "done" ? "#4caf50" : p.type === "error" ? "#e57373" : "#c9963a" }}>{p.type === "done" ? "✓" : p.type === "error" ? "✗" : "…"}</span>{p.label}</div>))}
                <div ref={progressRef} />
              </div>
            )}
            {activePST && digestData[activePST] ? (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={S.pstHeader}><span style={S.pstHeaderIcon}>{PSTs.find((p) => p.id === activePST)?.icon}</span><h2 style={S.pstHeaderTitle}>{PSTs.find((p) => p.id === activePST)?.label}</h2></div>
                {digestData[activePST].articles.map((art, i) => <ArticleCard key={i} article={art} />)}
                {digestData[activePST].synthesis && <SynthesisCard synthesis={digestData[activePST].synthesis} />}
              </div>
            ) : (
              <div style={S.genEmpty}>
                {generating ? <div style={{ textAlign: "center" }}><div style={{ ...S.spinner, margin: "0 auto 1rem" }} /><div style={{ color: "#c8b898", fontSize: "14px" }}>Searching and synthesizing…</div></div>
                  : <><div style={S.genEmptyIcon}>📋</div><div style={S.genEmptyTitle}>{generationDone ? "Select a PST area to view" : "Ready to generate"}</div><div style={S.genEmptyDesc}>{generationDone ? "Choose a PST area from the sidebar to read its digest." : "Click \"Generate All PSTs\" to build the full monthly digest."}</div></>}
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "briefing" && (
        <div style={S.briefPage}>
          <div style={S.briefSidebar}>
            <div style={S.briefSideTitle}>PST Areas</div>
            {PSTs.map((pst) => (
              <button key={pst.id} className="pst-tab" style={{ ...S.pstTab, ...(!pstDone(pst.id) ? { opacity: 0.4, pointerEvents: "none" } : {}) }} onClick={() => sendChat(`Give me a leadership briefing on the ${pst.label} insights from this month's digest.`)}>
                <span>{pst.icon}</span><span style={{ flex: 1, textAlign: "left" }}>{pst.label}</span>
              </button>
            ))}
            {!generationDone && <div style={S.briefNoDigest}>No digest yet. <button style={S.briefGenLink} onClick={() => setMode("generate")}>Generate first →</button></div>}
          </div>
          <div style={S.briefMain}>
            <div style={S.briefHeader}>
              <div style={S.briefHeaderTitle}>Intelligence Briefing</div>
              <div style={S.briefHeaderSub}>{generationDone ? `Powered by ${totalDone}/11 PST areas · ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}` : "Generate the digest first"}</div>
              {chatHistory.length > 0 && <button style={S.clearBtn} onClick={() => setChatHistory([])}>Clear</button>}
            </div>
            <div style={S.chatFeed}>
              {chatHistory.length === 0 && (
                <div style={S.briefEmpty}>
                  <div style={S.briefEmptyTitle}>What would you like to know?</div>
                  <div style={S.briefEmptySub}>Ask anything across this month's digest, or click a PST area on the left.</div>
                  <div style={S.suggGrid}>
                    {["What are the top 3 signals across all PSTs this month?", "What does the evidence say on AI for agricultural development?", "What are the key gender insights from this month's digest?", "What climate-development risks should leadership be tracking?", "What are the most actionable recommendations across PSTs?", "Where are the biggest cross-cutting themes this month?"].map((q, i) => (
                      <button key={i} className="sugg" style={S.sugg} onClick={() => sendChat(q)}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatHistory.map((m, i) => (
                <div key={i} style={m.role === "user" ? S.userBubble : S.aiBubble}>
                  {m.role === "user" ? <div style={S.userText}>{m.content}</div>
                    : <div style={S.aiContent}><div style={S.aiLabel}>BRIEFING</div><div style={S.aiText}>{formatMsg(m.content)}</div></div>}
                </div>
              ))}
              {chatLoading && <div style={S.aiBubble}><div style={S.aiContent}><div style={S.aiLabel}>BRIEFING</div><div style={{ display: "flex", gap: "5px" }}>{[0, 150, 300].map((d) => <span key={d} style={{ ...S.dot, animationDelay: `${d}ms` }} />)}</div></div></div>}
              <div ref={chatBottomRef} />
            </div>
            <div style={S.chatInput}>
              <input className="msg-input" style={S.msgInput} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat(chatInput)} placeholder={generationDone ? "Ask about any topic in this month's digest…" : "Generate the digest first…"} disabled={chatLoading || !generationDone} />
              <button style={{ ...S.sendBtn, ...(!chatInput.trim() || chatLoading || !generationDone ? S.sendDisabled : {}) }} onClick={() => sendChat(chatInput)} disabled={!chatInput.trim() || chatLoading || !generationDone}>Ask</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const C = { bg: "#0f1117", nav: "#12151e", panel: "#181c27", border: "#252a38", accent: "#c9963a", accentL: "#e8c87a", text: "#e8e4d8", muted: "#8a8fa8" };

const S = {
  root: { minHeight: "100vh", height: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text, display: "flex", flexDirection: "column", overflow: "hidden" },
  nav: { background: C.nav, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 1.25rem", height: "52px", gap: "1rem", flexShrink: 0 },
  navLogo: { display: "flex", alignItems: "baseline", gap: "8px", cursor: "pointer" },
  navLogoMark: { fontFamily: "'Lora',serif", fontSize: "17px", fontWeight: 600, color: C.accent },
  navLogoSub: { fontSize: "11px", color: C.muted, letterSpacing: "0.06em" },
  navCenter: { flex: 1, display: "flex", justifyContent: "center", gap: "4px" },
  navBtn: { background: "transparent", border: "none", color: C.muted, fontSize: "13px", padding: "6px 14px", borderRadius: "6px", cursor: "pointer" },
  navBtnActive: { background: `${C.accent}18`, color: C.accentL },
  navRight: { display: "flex", alignItems: "center", gap: "8px" },
  navBadge: { background: `${C.accent}22`, color: C.accent, fontSize: "11px", padding: "3px 8px", borderRadius: "20px" },
  homePage: { flex: 1, padding: "2rem", overflow: "auto" },
  homeHero: { textAlign: "center", padding: "2rem 1rem 2.5rem", maxWidth: "600px", margin: "0 auto" },
  homeEyebrow: { fontSize: "10px", letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase", marginBottom: "0.75rem" },
  homeTitle: { fontFamily: "'Lora',serif", fontSize: "32px", fontWeight: 600, color: C.text, margin: "0 0 0.75rem" },
  homeSubtitle: { fontSize: "14px", color: C.muted, lineHeight: 1.7, margin: "0 0 1.75rem" },
  homeActions: { display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" },
  heroBtnPrimary: { background: C.accent, color: "#1a0e00", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 500, cursor: "pointer" },
  heroBtnSecondary: { background: "transparent", color: C.accentL, border: `1px solid ${C.accent}44`, borderRadius: "8px", padding: "10px 16px", fontSize: "13px", cursor: "pointer" },
  homeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px", maxWidth: "900px", margin: "0 auto" },
  homeCard: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "1rem", cursor: "default", transition: "all 0.2s" },
  homeCardDone: { borderColor: `${C.accent}44`, cursor: "pointer" },
  homeCardIcon: { fontSize: "20px", marginBottom: "6px" },
  homeCardLabel: { fontSize: "12px", fontWeight: 500, color: C.text, lineHeight: 1.3 },
  homeCardCount: { fontSize: "11px", color: C.accent, marginTop: "4px" },
  homeCardPending: { fontSize: "11px", color: C.muted, marginTop: "4px" },
  genPage: { flex: 1, display: "flex", overflow: "hidden" },
  genSidebar: { width: "220px", flexShrink: 0, background: C.panel, borderRight: `1px solid ${C.border}`, padding: "1rem 0.75rem", overflowY: "auto" },
  genSideTitle: { fontSize: "10px", letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase", marginBottom: "0.5rem", padding: "0 4px" },
  pstTab: { display: "flex", alignItems: "center", gap: "7px", width: "100%", padding: "6px 8px", borderRadius: "6px", border: "none", background: "transparent", color: C.muted, fontSize: "12px", cursor: "pointer", marginBottom: "2px", textAlign: "left" },
  pstTabActive: { background: `${C.accent}18`, color: C.accentL, borderLeft: `2px solid ${C.accent}` },
  pstTabDone: { color: C.text },
  pstCheck: { color: "#4caf50", fontSize: "11px" },
  fullGenBtn: { width: "100%", background: C.accent, color: "#1a0e00", border: "none", borderRadius: "8px", padding: "9px", fontSize: "13px", fontWeight: 500, cursor: "pointer" },
  genRunning: { display: "flex", alignItems: "center", gap: "8px", color: C.muted, fontSize: "13px" },
  spinner: { width: "16px", height: "16px", border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 },
  genMain: { flex: 1, padding: "1.5rem", overflowY: "auto" },
  progressBox: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1.25rem" },
  progressTitle: { fontSize: "13px", fontWeight: 500, color: C.text, marginBottom: "0.5rem" },
  progressLine: { fontSize: "12px", color: C.muted, display: "flex", gap: "8px", marginBottom: "3px" },
  pstHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" },
  pstHeaderIcon: { fontSize: "22px" },
  pstHeaderTitle: { fontFamily: "'Lora',serif", fontSize: "20px", fontWeight: 600, color: C.text, margin: 0 },
  genEmpty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", textAlign: "center" },
  genEmptyIcon: { fontSize: "36px", marginBottom: "1rem" },
  genEmptyTitle: { fontFamily: "'Lora',serif", fontSize: "18px", color: C.text, marginBottom: "0.5rem" },
  genEmptyDesc: { fontSize: "13px", color: C.muted, maxWidth: "360px", lineHeight: 1.65 },
  briefPage: { flex: 1, display: "flex", overflow: "hidden" },
  briefSidebar: { width: "210px", flexShrink: 0, background: C.panel, borderRight: `1px solid ${C.border}`, padding: "1rem 0.75rem", overflowY: "auto" },
  briefSideTitle: { fontSize: "10px", letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase", marginBottom: "0.5rem", padding: "0 4px" },
  briefNoDigest: { fontSize: "11px", color: C.muted, marginTop: "1rem", lineHeight: 1.6 },
  briefGenLink: { background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: "11px", textDecoration: "underline", padding: 0 },
  briefMain: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  briefHeader: { padding: "1rem 1.5rem", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 },
  briefHeaderTitle: { fontFamily: "'Lora',serif", fontSize: "16px", color: C.text, fontWeight: 500 },
  briefHeaderSub: { fontSize: "12px", color: C.muted, flex: 1 },
  clearBtn: { fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" },
  chatFeed: { flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  briefEmpty: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", paddingTop: "1rem" },
  briefEmptyTitle: { fontFamily: "'Lora',serif", fontSize: "20px", color: C.text, marginBottom: "0.5rem" },
  briefEmptySub: { fontSize: "13px", color: C.muted, maxWidth: "400px", lineHeight: 1.6, marginBottom: "1.5rem" },
  suggGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxWidth: "640px", width: "100%" },
  sugg: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 12px", color: C.muted, fontSize: "12px", cursor: "pointer", textAlign: "left", lineHeight: 1.4 },
  userBubble: { display: "flex", justifyContent: "flex-end" },
  userText: { background: "#1e2336", border: `1px solid ${C.border}`, borderRadius: "10px 10px 2px 10px", padding: "10px 14px", maxWidth: "65%", fontSize: "13.5px", lineHeight: 1.6 },
  aiBubble: { display: "flex" },
  aiContent: { background: "#13161f", border: `1px solid ${C.border}`, borderRadius: "2px 10px 10px 10px", padding: "14px 16px", width: "100%" },
  aiLabel: { fontSize: "9px", letterSpacing: "0.15em", color: C.accent, marginBottom: "8px", fontWeight: 500 },
  aiText: { fontSize: "13.5px", lineHeight: 1.65, color: C.text },
  dot: { width: "6px", height: "6px", borderRadius: "50%", background: C.accent, display: "inline-block", animation: "spin 1.2s infinite" },
  chatInput: { padding: "1rem 1.5rem", borderTop: `1px solid ${C.border}`, display: "flex", gap: "8px", flexShrink: 0 },
  msgInput: { flex: 1, background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px", color: C.text, fontSize: "13.5px", outline: "none" },
  sendBtn: { background: C.accent, color: "#1a0e00", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 500, cursor: "pointer" },
  sendDisabled: { background: C.border, color: C.muted, cursor: "not-allowed" },
};

const A = {
  card: { background: "#faf8f4", border: "1px solid #e8e0d4", borderTop: "3px solid #8B1A1A", borderRadius: "10px", padding: "1.5rem 1.75rem", marginBottom: "1rem" },
  source: { fontSize: "11px", color: "#8B1A1A", fontStyle: "italic", fontFamily: "'Lora',serif", marginBottom: "4px" },
  title: { fontFamily: "'Lora',serif", fontSize: "17px", fontWeight: 600, color: "#1a0e00", margin: "0 0 0.75rem", lineHeight: 1.3 },
  summary: { fontSize: "13.5px", color: "#3a3432", lineHeight: 1.7, margin: "0 0 0.75rem" },
  section: { marginTop: "0.75rem" },
  sectionLabel: { fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8B1A1A", fontWeight: 500, marginBottom: "0.4rem" },
  bullet: { display: "flex", gap: "8px", fontSize: "13px", lineHeight: 1.6, color: "#3a3432", marginBottom: "5px", alignItems: "flex-start" },
  dot: { color: "#8B1A1A", flexShrink: 0, fontWeight: 500 },
  synth: { background: "#1a0e00", border: "1px solid #3a2510", borderRadius: "10px", padding: "1.75rem", marginBottom: "1rem" },
  synthBadge: { display: "inline-block", background: "rgba(201,150,58,0.15)", color: "#c9963a", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: "4px", padding: "3px 8px", marginBottom: "0.75rem", fontWeight: 500 },
  synthTitle: { fontFamily: "'Lora',serif", fontSize: "19px", fontWeight: 600, color: "#f5f0e8", margin: "0 0 0.75rem", lineHeight: 1.3 },
  synthDivider: { height: "1px", background: "#3a2510", marginBottom: "1rem" },
  synthPara: { fontSize: "13.5px", color: "#c8c0b0", lineHeight: 1.75, margin: "0 0 0.75rem" },
};

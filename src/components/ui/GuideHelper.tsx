"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PortfolioData } from "@/lib/types";
import { trackEvent } from "@/lib/telemetry";

interface GuideHelperProps {
  data: PortfolioData;
  onMissionSelect: (missionId: string) => void;
}

const QUICK_FACTS = [
  { icon: "💰", label: "$260K/yr saved", detail: "RTO re-architecture at ZS Associates", missionId: "mission-resilience-rearchitecture" },
  { icon: "🛡️", label: "ISO 27001 aligned", detail: "WAF hardening + 2PB data cleanup", missionId: "mission-security-compliance" },
  { icon: "⚡", label: "Team of 4 led", detail: "Full cloud delivery at Fibe", missionId: "mission-fintech-leadership" },
  { icon: "📉", label: "$4K/mo S3 savings", detail: "Lifecycle automation at Fibe", missionId: "mission-cost-optimization" },
];

const TIPS = [
  { key: "Click a node", desc: "Open mission details in the 3D hub" },
  { key: "Scroll panels", desc: "Left = timeline/career, Right = impact & skills" },
  { key: "ESC", desc: "Close any open mission card" },
  { key: "Orbit controls", desc: "Click + drag the hub to rotate" },
];

export default function GuideHelper({ data, onMissionSelect }: GuideHelperProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const handleMissionClick = (missionId: string) => {
    trackEvent("mission_open", { missionId, source: "guide_helper" });
    onMissionSelect(missionId);
    close();
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close recruiter guide" : "Open recruiter guide"}
        aria-expanded={open}
        style={{
          position: "fixed",
          bottom: "calc(var(--bar-height) + 1rem)",
          left: "1rem",
          zIndex: 600,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: open ? "var(--color-cyan)" : "rgba(3, 7, 30, 0.9)",
          border: `2px solid ${open ? "var(--color-cyan)" : "var(--color-cyan-dim)"}`,
          color: open ? "var(--color-bg)" : "var(--color-cyan)",
          fontFamily: "var(--font-heading)",
          fontSize: "1rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1px",
          transition: "all 0.2s ease",
          backdropFilter: "blur(12px)",
          boxShadow: open
            ? "0 0 20px var(--color-cyan)"
            : "0 0 10px rgba(0,245,212,0.2)",
        }}
      >
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{open ? "✕" : "?"}</span>
        <span style={{ fontSize: "0.38rem", letterSpacing: "0.1em", opacity: 0.8 }}>
          {open ? "CLOSE" : "GUIDE"}
        </span>
      </button>

      {/* Guide panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile only) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 599,
                background: "rgba(3,7,30,0.5)",
                backdropFilter: "blur(2px)",
              }}
              className="show-mobile"
            />

            <motion.aside
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              aria-label="Recruiter Guide Panel"
              role="complementary"
              className="hud-panel"
              style={{
                position: "fixed",
                bottom: "calc(var(--bar-height) + 4.5rem)",
                left: "1rem",
                width: "min(360px, calc(100vw - 2rem))",
                maxHeight: "min(600px, calc(100vh - var(--bar-height) - 6rem))",
                overflowY: "auto",
                zIndex: 600,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "0.9rem 1rem 0.75rem",
                  borderBottom: "1px solid var(--color-cyan-dim)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexShrink: 0,
                }}
              >
                <div className="status-dot" />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.65rem",
                      color: "var(--color-cyan)",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                  >
                    Recruiter Guide
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      color: "var(--color-steel)",
                      marginTop: "1px",
                    }}
                  >
                    Quick access for hiring managers
                  </div>
                </div>
              </div>

              <div style={{ padding: "0.9rem 1rem", overflowY: "auto" }}>
                {/* Quick Facts */}
                <div className="hud-label" style={{ marginBottom: "0.6rem" }}>
                  Key Highlights
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.4rem",
                    marginBottom: "1.1rem",
                  }}
                >
                  {QUICK_FACTS.map((fact, i) => (
                    <button
                      key={i}
                      onClick={() => handleMissionClick(fact.missionId)}
                      aria-label={`Go to: ${fact.label}`}
                      style={{
                        background: "rgba(0,245,212,0.05)",
                        border: "1px solid var(--color-cyan-dim)",
                        borderRadius: "var(--radius)",
                        padding: "0.55rem 0.6rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-cyan)";
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,245,212,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-cyan-dim)";
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,245,212,0.05)";
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1rem",
                          marginBottom: "0.15rem",
                          lineHeight: 1,
                        }}
                      >
                        {fact.icon}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "0.6rem",
                          color: "var(--color-cyan)",
                          fontWeight: 700,
                          marginBottom: "0.1rem",
                        }}
                      >
                        {fact.label}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.55rem",
                          color: "var(--color-steel)",
                          lineHeight: 1.3,
                        }}
                      >
                        {fact.detail}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Mission Index */}
                <div className="hud-label" style={{ marginBottom: "0.6rem" }}>
                  Mission Quick-Access
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                    marginBottom: "1.1rem",
                  }}
                >
                  {data.missions.map((mission) => (
                    <button
                      key={mission.id}
                      onClick={() => handleMissionClick(mission.id)}
                      aria-label={`Open mission: ${mission.title}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        background: `${mission.color}08`,
                        border: `1px solid ${mission.color}33`,
                        borderRadius: "var(--radius)",
                        padding: "0.5rem 0.7rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "left",
                        width: "100%",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = mission.color;
                        (e.currentTarget as HTMLButtonElement).style.background = `${mission.color}18`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${mission.color}33`;
                        (e.currentTarget as HTMLButtonElement).style.background = `${mission.color}08`;
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: mission.color,
                          boxShadow: `0 0 6px ${mission.color}`,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: "var(--color-white)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {mission.title}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.58rem",
                            color: "var(--color-steel)",
                          }}
                        >
                          {mission.company} · {mission.period}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: mission.color,
                          flexShrink: 0,
                        }}
                      >
                        ▸
                      </span>
                    </button>
                  ))}
                </div>

                {/* Navigation Tips */}
                <div className="hud-label" style={{ marginBottom: "0.6rem" }}>
                  Navigation Tips
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                    marginBottom: "1.1rem",
                  }}
                >
                  {TIPS.map((tip, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "flex-start",
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.78rem",
                      }}
                    >
                      <code
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          color: "var(--color-cyan)",
                          background: "rgba(0,245,212,0.1)",
                          border: "1px solid var(--color-cyan-dim)",
                          borderRadius: "2px",
                          padding: "0.1rem 0.35rem",
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tip.key}
                      </code>
                      <span style={{ color: "var(--color-steel)", lineHeight: 1.5 }}>
                        {tip.desc}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Contact */}
                <div className="hud-label" style={{ marginBottom: "0.6rem" }}>
                  Contact Khush
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <a
                    href={`mailto:${data.profile.email}`}
                    onClick={() =>
                      trackEvent("contact_click", { source: "guide_helper" })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      color: "var(--color-cyan)",
                      textDecoration: "none",
                      padding: "0.3rem 0",
                    }}
                  >
                    <span>✉</span>
                    <span>{data.profile.email}</span>
                  </a>
                  <a
                    href={`tel:${data.profile.phone.replace(/\s/g, "")}`}
                    onClick={() =>
                      trackEvent("contact_click", { source: "guide_helper" })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      color: "var(--color-steel-light)",
                      textDecoration: "none",
                      padding: "0.3rem 0",
                    }}
                  >
                    <span>☎</span>
                    <span>{data.profile.phone}</span>
                  </a>
                  <a
                    href={`https://${data.profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("contact_click", { source: "guide_helper" })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      color: "var(--color-steel-light)",
                      textDecoration: "none",
                      padding: "0.3rem 0",
                    }}
                  >
                    <span>in</span>
                    <span>{data.profile.linkedin}</span>
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

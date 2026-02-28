"use client";

import { useState, useEffect, useCallback, Suspense, startTransition } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { portfolioData } from "@/lib/content";
import type { Mission } from "@/lib/types";
import BootGate from "@/components/boot/BootGate";
import OperationsFeed from "@/components/ui/OperationsFeed";
import ImpactLedger from "@/components/ui/ImpactLedger";
import MissionCard from "@/components/ui/MissionCard";
import CommandBar from "@/components/ui/CommandBar";
import AudioToggle from "@/components/ui/AudioToggle";
import Fallback2DHub from "@/components/ui/Fallback2DHub";
import GuideHelper from "@/components/ui/GuideHelper";

// Dynamically import the 3D scene (client-only, no SSR)
const MissionHubScene = dynamic(
  () => import("@/components/scene/MissionHubScene"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-cyan)",
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
          }}
        >
          LOADING 3D ENVIRONMENT...
        </div>
      </div>
    ),
  }
);

function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") || canvas.getContext("webgl");
      const result = !!gl;
      startTransition(() => setSupported(result));
    } catch {
      startTransition(() => setSupported(false));
    }
  }, []);

  return supported;
}

export default function Page() {
  const [bootDone, setBootDone] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"feed" | "ledger" | null>(
    null
  );
  const webglSupported = useWebGLSupport();

  // Hash-based deep linking
  useEffect(() => {
    if (!bootDone) return;
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const mission = portfolioData.missions.find((m) => m.id === hash);
      if (mission) startTransition(() => setSelectedMission(mission));
    }
  }, [bootDone]);

  const handleMissionClick = useCallback((mission: Mission) => {
    setSelectedMission(mission);
    history.pushState(null, "", `#${mission.id}`);
  }, []);

  const handleMissionClose = useCallback(() => {
    setSelectedMission(null);
    history.pushState(null, "", " ");
  }, []);

  const handleMissionSelectFromLedger = useCallback(
    (missionId: string) => {
      const mission = portfolioData.missions.find((m) => m.id === missionId);
      if (mission) handleMissionClick(mission);
    },
    [handleMissionClick]
  );

  // If WebGL not yet determined, show nothing (avoid flash)
  if (webglSupported === null) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-cyan)",
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
          }}
        >
          INITIALIZING...
        </div>
      </div>
    );
  }

  // WebGL not supported → 2D fallback
  if (webglSupported === false) {
    return (
      <>
        <BootGate onComplete={() => {}} />
        <Fallback2DHub data={portfolioData} />
      </>
    );
  }

  return (
    <>
      {/* Boot gate */}
      <AnimatePresence>
        {!bootDone && (
          <BootGate onComplete={() => setBootDone(true)} />
        )}
      </AnimatePresence>

      {/* Main HUD layout */}
      {bootDone && (
        <div
          id="main-content"
          style={{
            position: "fixed",
            inset: 0,
            bottom: "var(--bar-height)",
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* ── Left panel: Operations Feed (desktop) ── */}
          <div
            style={{
              display: "flex",
              flexShrink: 0,
            }}
            className="hide-mobile"
          >
            <OperationsFeed data={portfolioData} />
          </div>

          {/* ── Center: 3D Mission Hub ── */}
          <div
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* HUD title overlay */}
            <div
              style={{
                position: "absolute",
                top: "0.75rem",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(0.6rem, 1.5vw, 0.85rem)",
                  color: "var(--color-cyan)",
                  textShadow: "0 0 16px var(--color-cyan)",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                Mission Hub
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  color: "var(--color-steel)",
                  letterSpacing: "0.15em",
                  marginTop: "0.15rem",
                }}
              >
                {portfolioData.missions.length} active missions · click to access
              </div>
            </div>

            <Suspense fallback={null}>
              <MissionHubScene
                missions={portfolioData.missions}
                selectedMissionId={selectedMission?.id ?? null}
                onMissionClick={handleMissionClick}
              />
            </Suspense>

            {/* Mobile panel toggles */}
            <div
              className="show-mobile"
              style={{
                position: "absolute",
                bottom: "1rem",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "0.5rem",
                zIndex: 20,
              }}
            >
              <button
                onClick={() =>
                  setMobilePanel(mobilePanel === "feed" ? null : "feed")
                }
                aria-label="Toggle Operations Feed"
                className="btn-secondary"
                style={{ fontSize: "0.7rem", padding: "0.4rem 0.8rem" }}
              >
                Timeline
              </button>
              <button
                onClick={() =>
                  setMobilePanel(mobilePanel === "ledger" ? null : "ledger")
                }
                aria-label="Toggle Impact Ledger"
                className="btn-secondary"
                style={{ fontSize: "0.7rem", padding: "0.4rem 0.8rem" }}
              >
                Impact
              </button>
            </div>
          </div>

          {/* ── Right panel: Impact Ledger (desktop) ── */}
          <div
            style={{
              display: "flex",
              flexShrink: 0,
            }}
            className="hide-mobile"
          >
            <ImpactLedger
              data={portfolioData}
              onMissionSelect={handleMissionSelectFromLedger}
            />
          </div>

          {/* Mobile drawers */}
          <AnimatePresence>
            {mobilePanel === "feed" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 100,
                  background: "rgba(3,7,30,0.6)",
                  backdropFilter: "blur(4px)",
                }}
                onClick={() => setMobilePanel(null)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "min(360px, 90vw)",
                    overflowY: "auto",
                    display: "flex",
                  }}
                >
                  <OperationsFeed data={portfolioData} />
                </div>
              </div>
            )}
            {mobilePanel === "ledger" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 100,
                  background: "rgba(3,7,30,0.6)",
                  backdropFilter: "blur(4px)",
                }}
                onClick={() => setMobilePanel(null)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "min(360px, 90vw)",
                    overflowY: "auto",
                    display: "flex",
                  }}
                >
                  <ImpactLedger
                    data={portfolioData}
                    onMissionSelect={handleMissionSelectFromLedger}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mission Modal */}
      <AnimatePresence>
        {selectedMission && (
          <MissionCard
            mission={selectedMission}
            onClose={handleMissionClose}
          />
        )}
      </AnimatePresence>

      {/* Persistent UI */}
      {bootDone && (
        <>
          <CommandBar data={portfolioData} />
          <AudioToggle />
          <GuideHelper
            data={portfolioData}
            onMissionSelect={handleMissionSelectFromLedger}
          />
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 901px) {
          .show-mobile { display: none !important; }
          .hide-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}

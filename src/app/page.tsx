import { AppShell } from "@/components/layout/AppShell";
import { DemoAdStrip } from "@/components/ads/DemoAdStrip";

export default function Home() {
  return (
    <div className="page-root">
      <AppShell />
      <DemoAdStrip />
    </div>
  );
}
// Deploy check: 2026-05-14T01:45:00+03:00
// Globe fix: VIEWER_STYLE applied to Resium Viewer for full-screen rendering

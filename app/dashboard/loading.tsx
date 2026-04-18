/**
 * Dashboard Loading Skeleton — SpaceX-inspired spectral shimmer
 */
export default function DashboardLoading() {
  return (
    <div
      className="section-cinematic bg-black"
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard content"
    >
      <div 
        className="section-photo" 
        style={{ 
          backgroundImage: "url('/space-hero.png')", 
          backgroundSize: "cover", 
          backgroundPosition: "center",
          position: "fixed"
        }} 
      />
      <div className="section-overlay" style={{ position: "fixed" }} />
      <div className="section-content relative z-20 w-full" style={{ padding: "120px clamp(24px, 6vw, 80px) 40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "32px",
          }}
          className="dashboard-grid"
        >
          <style>{`
            @media (min-width: 1024px) {
              .dashboard-grid { grid-template-columns: 280px 1fr !important; }
            }
          `}</style>

          {/* Left Sidebar Skeleton */}
          <aside aria-hidden="true">
            <div
              style={{
                background: "transparent",
                border: "none",
                borderRadius: "0",
              }}
            >
              <div style={{ padding: "24px 0 0" }}>
                <div className="skeleton" style={{ width: "64px", height: "64px", borderRadius: "50%", marginBottom: "16px" }} />
                <div className="skeleton" style={{ width: "70%", height: "14px", marginBottom: "8px" }} />
                <div className="skeleton" style={{ width: "50%", height: "10px", marginBottom: "20px" }} />
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                  <div className="skeleton" style={{ width: "80px", height: "22px", borderRadius: "12px" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                  <div className="skeleton" style={{ width: "100%", height: "36px", borderRadius: "20px" }} />
                  <div className="skeleton" style={{ width: "100%", height: "36px", borderRadius: "20px" }} />
                </div>
                <div style={{ height: "1px", background: "rgba(240,240,250,0.05)", margin: "0 0 16px" }} />
                <div className="skeleton" style={{ width: "60px", height: "8px", marginBottom: "10px" }} />
                <div className="skeleton" style={{ width: "100%", height: "44px", borderRadius: "20px" }} />
              </div>
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main style={{ display: "flex", flexDirection: "column", gap: "24px" }} aria-hidden="true">
            {/* Welcome Header Skeleton */}
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid rgba(240,240,250,0.06)" }}>
              <div className="skeleton" style={{ width: "80px", height: "8px", marginBottom: "10px" }} />
              <div className="skeleton" style={{ width: "55%", height: "28px", marginBottom: "8px" }} />
              <div className="skeleton" style={{ width: "40%", height: "14px" }} />
            </div>

            {/* Stats Grid Skeleton */}
            <div>
              <div className="skeleton" style={{ width: "80px", height: "8px", marginBottom: "16px" }} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "24px",
                  background: "transparent",
                  border: "none",
                }}
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ background: "transparent", padding: "0" }}>
                    <div className="skeleton" style={{ width: "16px", height: "16px", marginBottom: "12px" }} />
                    <div className="skeleton" style={{ width: "60px", height: "10px", marginBottom: "6px" }} />
                    <div className="skeleton" style={{ width: "80px", height: "28px", marginBottom: "4px" }} />
                    <div className="skeleton" style={{ width: "50px", height: "8px" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Insights Row Skeleton */}
            <div>
              <div className="skeleton" style={{ width: "80px", height: "8px", marginBottom: "16px" }} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "24px",
                  background: "transparent",
                  border: "none",
                }}
              >
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ background: "transparent", padding: "0" }}>
                    <div className="skeleton" style={{ width: "60%", height: "10px", marginBottom: "8px" }} />
                    <div className="skeleton" style={{ width: "40%", height: "22px", marginBottom: "4px" }} />
                    <div className="skeleton" style={{ width: "45%", height: "8px" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Activity section skeleton */}
            <div
              style={{
                background: "transparent",
                border: "none",
              }}
            >
              <div style={{ padding: "16px 0", borderBottom: "1px solid rgba(240,240,250,0.05)" }}>
                <div className="skeleton" style={{ width: "120px", height: "12px" }} />
              </div>
              <div style={{ padding: "20px 0", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "24px", background: "transparent" }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ background: "transparent", padding: "0" }}>
                    <div className="skeleton" style={{ width: "60px", height: "8px", marginBottom: "6px" }} />
                    <div className="skeleton" style={{ width: "45px", height: "20px" }} />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      <span className="sr-only">Loading dashboard, please wait...</span>
    </div>
  );
}

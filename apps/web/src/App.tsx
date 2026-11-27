import { Activity, Factory, Gauge, Layers3, ShieldCheck, Wrench } from "lucide-react";

const metrics = [
  { label: "Production orders", value: "—", note: "Connect production data to activate", icon: Layers3 },
  { label: "Machine availability", value: "—", note: "Requires registered machine telemetry", icon: Gauge },
  { label: "Open maintenance", value: "—", note: "Maintenance module not yet enabled", icon: Wrench },
  { label: "Quality yield", value: "—", note: "Requires verified inspection records", icon: ShieldCheck }
];

export default function App() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">F</span><div><strong>ForgeOS</strong><small>INDUSTRIAL OPERATIONS</small></div></div>
        <div className="nav-label">WORKSPACE</div>
        <a className="nav active"><Activity size={17}/> Overview</a>
        <a className="nav"><Factory size={17}/> Plants & assets</a>
        <a className="nav"><Layers3 size={17}/> Production</a>
        <a className="nav"><Wrench size={17}/> Maintenance</a>
        <a className="nav"><ShieldCheck size={17}/> Quality</a>
        <div className="sidebar-foot"><span className="status-dot"/> Platform foundation<br/><small>Live application shell</small></div>
      </aside>
      <section className="main">
        <header><div><span className="eyebrow">OPERATIONS / OVERVIEW</span><h1>Plant operations</h1><p>One operational workspace for production, assets, maintenance and quality.</p></div><div className="environment">FOUNDATION BUILD</div></header>
        <div className="notice"><Activity size={18}/><span><strong>Workspace initialized.</strong> Connect authenticated plant data and operational modules to populate live metrics. No sample values are presented as real production data.</span></div>
        <div className="metrics">{metrics.map(({label,value,note,icon:Icon})=><article className="metric" key={label}><div className="metric-top"><span>{label}</span><Icon size={18}/></div><strong>{value}</strong><small>{note}</small></article>)}</div>
        <section className="panel"><div className="panel-head"><div><span className="eyebrow">PLATFORM MODULES</span><h2>Operational command center</h2></div><span className="pill">Milestone 1</span></div><div className="module-grid"><div><Factory/><strong>Plant registry</strong><small>Facilities, production lines and machine hierarchy</small></div><div><Layers3/><strong>Production execution</strong><small>Orders, routing steps, shift plans and output</small></div><div><Wrench/><strong>Maintenance</strong><small>Work orders, assignments and downtime events</small></div><div><ShieldCheck/><strong>Quality management</strong><small>Inspections, non-conformance and corrective action</small></div></div></section>
        <footer>ForgeOS · Industrial Operations & Manufacturing Intelligence · Metrics activate when verified data is available.</footer>
      </section>
    </main>
  );
}

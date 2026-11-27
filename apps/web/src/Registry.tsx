import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Factory, Plus, RefreshCw, Search, Wrench } from "lucide-react";
type RegistryProps = { token: string; profile: { role: string } };
type Plant = { _id: string; code: string; name: string; status: string };
type Asset = { _id: string; assetCode: string; name: string; category: string; status: string; criticality: string; plantId: { _id: string; name: string; code: string } | string };
type ApiResponse<T> = { success: boolean; data?: T; error?: { message?: string } };
const API = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
 const response = await fetch(API + path, { ...options, credentials: "include", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token, ...options.headers } });
 const body = await response.json().catch(() => ({})) as ApiResponse<T>;
 if (!response.ok || body.data === undefined) throw new Error(body.error?.message ?? "The request could not be completed.");
 return body.data;
}
const writable = ["owner", "admin", "plant_manager", "maintenance_manager", "production_supervisor", "quality_manager"];
export function Registry({ token, profile }: RegistryProps) {
 const [plants, setPlants] = useState<Plant[]>([]), [assets, setAssets] = useState<Asset[]>([]);
 const [search, setSearch] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
 const [plantForm, setPlantForm] = useState({ code: "", name: "", city: "", country: "" });
 const [assetForm, setAssetForm] = useState({ plantId: "", assetCode: "", name: "", category: "production_machine", criticality: "medium" });
 const canWrite = writable.includes(profile.role);
 async function load() {
  try { const [p, a] = await Promise.all([request<{ plants: Plant[] }>("/plants", token), request<{ assets: Asset[] }>("/assets?limit=50&sort=updatedAt&order=desc", token)]); setPlants(p.plants); setAssets(a.assets); setAssetForm(v => ({ ...v, plantId: v.plantId || p.plants[0]?._id || "" })); }
  catch (e) { setError(e instanceof Error ? e.message : "Unable to load the registry."); }
 }
 useEffect(() => { void load(); }, [token]);
 async function createPlant(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); setBusy(true); setError(""); setNotice("");
  try { await request("/plants", token, { method: "POST", body: JSON.stringify({ code: plantForm.code, name: plantForm.name, address: { city: plantForm.city || undefined, country: plantForm.country || undefined } }) }); setPlantForm({ code: "", name: "", city: "", country: "" }); setNotice("Plant created."); await load(); }
  catch (e) { setError(e instanceof Error ? e.message : "Unable to create plant."); } finally { setBusy(false); }
 }
 async function createAsset(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); setBusy(true); setError(""); setNotice("");
  try { await request("/assets", token, { method: "POST", body: JSON.stringify(assetForm) }); setAssetForm(v => ({ ...v, assetCode: "", name: "" })); setNotice("Asset registered and audit event recorded."); await load(); }
  catch (e) { setError(e instanceof Error ? e.message : "Unable to register asset."); } finally { setBusy(false); }
 }
 async function changeStatus(asset: Asset, status: string) {
  setBusy(true); setError(""); setNotice("");
  try { await request("/assets/" + asset._id + "/status", token, { method: "PATCH", body: JSON.stringify({ status }) }); setNotice("Asset lifecycle updated."); await load(); }
  catch (e) { setError(e instanceof Error ? e.message : "Unable to update lifecycle."); } finally { setBusy(false); }
 }
 const filtered = assets.filter(a => (a.name + " " + a.assetCode + " " + a.category).toLowerCase().includes(search.toLowerCase()));
 return <section className="registry-wrap">
  <div className="registry-heading"><div><span className="eyebrow">FOUNDATION / MASTER DATA</span><h2>Plant & asset registry</h2><p>Manage organization-scoped facilities, production equipment and lifecycle records.</p></div><button className="registry-refresh" onClick={() => void load()} disabled={busy}><RefreshCw size={14}/> Refresh</button></div>
  <div className="registry-stats"><article><Factory size={17}/><strong>{plants.length}</strong><span>Plants</span></article><article><Wrench size={17}/><strong>{assets.length}</strong><span>Registered assets</span></article><article><span className="registry-dot"/><strong>{assets.filter(a => a.status === "operational").length}</strong><span>Operational</span></article></div>
  {canWrite && <div className="registry-forms">
   <form className="panel registry-form" onSubmit={createPlant}><div className="panel-heading"><div><span className="eyebrow">FACILITY STRUCTURE</span><h3>Add a plant</h3></div><Plus size={17}/></div><label>Plant code<input required minLength={2} maxLength={24} value={plantForm.code} onChange={e => setPlantForm(v => ({ ...v, code: e.target.value }))} placeholder="PLANT-01"/></label><label>Plant name<input required minLength={2} maxLength={120} value={plantForm.name} onChange={e => setPlantForm(v => ({ ...v, name: e.target.value }))} placeholder="North Manufacturing Plant"/></label><div className="registry-pair"><label>City<input value={plantForm.city} onChange={e => setPlantForm(v => ({ ...v, city: e.target.value }))} placeholder="Pune"/></label><label>Country<input value={plantForm.country} onChange={e => setPlantForm(v => ({ ...v, country: e.target.value }))} placeholder="India"/></label></div><button className="primary" disabled={busy || !plantForm.code || !plantForm.name}>Create plant <ArrowRight size={14}/></button></form>
   <form className="panel registry-form" onSubmit={createAsset}><div className="panel-heading"><div><span className="eyebrow">EQUIPMENT MASTER</span><h3>Register an asset</h3></div><Plus size={17}/></div><label>Plant<select required value={assetForm.plantId} onChange={e => setAssetForm(v => ({ ...v, plantId: e.target.value }))}><option value="">Select a plant</option>{plants.map(p => <option value={p._id} key={p._id}>{p.code} · {p.name}</option>)}</select></label><label>Asset code<input required minLength={2} maxLength={40} value={assetForm.assetCode} onChange={e => setAssetForm(v => ({ ...v, assetCode: e.target.value }))} placeholder="PRESS-001"/></label><label>Asset name<input required minLength={2} maxLength={140} value={assetForm.name} onChange={e => setAssetForm(v => ({ ...v, name: e.target.value }))} placeholder="Hydraulic press"/></label><div className="registry-pair"><label>Category<select value={assetForm.category} onChange={e => setAssetForm(v => ({ ...v, category: e.target.value }))}><option value="production_machine">Production machine</option><option value="conveyor">Conveyor</option><option value="robotics">Robotics</option><option value="packaging">Packaging</option><option value="utilities">Utilities</option><option value="inspection">Inspection</option><option value="safety">Safety</option><option value="other">Other</option></select></label><label>Criticality<select value={assetForm.criticality} onChange={e => setAssetForm(v => ({ ...v, criticality: e.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label></div><button className="primary" disabled={busy || !assetForm.plantId || !assetForm.assetCode || !assetForm.name}>Register asset <ArrowRight size={14}/></button></form>
  </div>}
  <section className="panel registry-table-panel"><div className="panel-heading"><div><span className="eyebrow">ASSET INVENTORY</span><h3>Equipment records</h3></div><label className="registry-search"><Search size={14}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code, name or category"/></label></div><div className="registry-table-scroll"><table className="registry-table"><thead><tr><th>Asset</th><th>Plant</th><th>Category</th><th>Criticality</th><th>Lifecycle</th></tr></thead><tbody>{filtered.map(asset => <tr key={asset._id}><td><strong>{asset.name}</strong><small>{asset.assetCode}</small></td><td>{typeof asset.plantId === "string" ? "—" : asset.plantId.name}</td><td>{asset.category.replaceAll("_", " ")}</td><td><span className={"criticality " + asset.criticality}>{asset.criticality}</span></td><td>{canWrite ? <select className="status-select" disabled={busy || asset.status === "decommissioned"} value={asset.status} onChange={e => void changeStatus(asset, e.target.value)}>{["commissioning", "operational", "standby", "maintenance", "decommissioned"].map(s => <option value={s} key={s}>{s.replaceAll("_", " ")}</option>)}</select> : <span className="status-select">{asset.status}</span>}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={5} className="registry-empty">No assets found. Create a plant, then register its first asset.</td></tr>}</tbody></table></div></section>
  {error && <div className="form-error" role="alert">{error}</div>}{notice && <div className="form-success" role="status">{notice}</div>}
  <p className="registry-footnote">Asset codes are unique within an organization. Lifecycle changes are validated by the API and written to append-only asset history. Evidence fields store secure references only; file uploads are not enabled in this milestone.</p>
 </section>;
}

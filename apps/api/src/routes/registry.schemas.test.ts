import test from "node:test";
import assert from "node:assert/strict";
import { createAssetSchema, createPlantSchema, statusSchema } from "./registry.schemas.js";
test("plant schema normalizes plant and line codes", () => {
  const result = createPlantSchema.parse({ code: "north-01", name: "North Plant", productionLines: [{ code: "line-a", name: "Assembly", workCells: [{ code: "cell-1", name: "Cell 1" }] }] });
  assert.equal(result.code, "NORTH-01"); assert.equal(result.productionLines[0]?.code, "LINE-A");
});
test("asset schema rejects invalid coordinates and unsupported fields", () => {
  assert.throws(() => createAssetSchema.parse({ plantId: "507f1f77bcf86cd799439011", assetCode: "press-1", name: "Press", category: "production_machine", location: { coordinates: { latitude: 120, longitude: 0 } } }));
  assert.throws(() => createAssetSchema.parse({ plantId: "507f1f77bcf86cd799439011", assetCode: "press-1", name: "Press", category: "production_machine", organizationId: "507f1f77bcf86cd799439011" }));
});
test("status schema only accepts known lifecycle states", () => {
  assert.equal(statusSchema.parse({ status: "operational" }).status, "operational");
  assert.throws(() => statusSchema.parse({ status: "running" }));
});

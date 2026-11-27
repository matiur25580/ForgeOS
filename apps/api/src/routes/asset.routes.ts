import { Router } from "express";
import { Types } from "mongoose";
import { authenticate, requireRoles } from "../middleware/auth.middleware.js";
import { Asset, ASSET_STATUSES } from "../models/asset.model.js";
import { AssetEvent } from "../models/asset-event.model.js";
import { Plant } from "../models/plant.model.js";
import { createAssetSchema, listQuerySchema, statusSchema, updateAssetSchema } from "./registry.schemas.js";
export const assetRouter = Router();
assetRouter.use(authenticate);
const writers = ["owner", "admin", "plant_manager", "maintenance_manager", "production_supervisor", "quality_manager"];
const transitions: Record<string, string[]> = {
  commissioning: ["operational", "standby", "decommissioned"],
  operational: ["standby", "maintenance", "decommissioned"],
  standby: ["operational", "maintenance", "decommissioned"],
  maintenance: ["operational", "standby", "decommissioned"],
  decommissioned: []
};
assetRouter.get("/", async (req, res, next) => { try {
  const query = listQuerySchema.parse(req.query);
  const filter: Record<string, unknown> = { organizationId: req.auth!.organizationId };
  if (query.plantId) filter.plantId = query.plantId;
  if (query.status && (ASSET_STATUSES as readonly string[]).includes(query.status)) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.criticality) filter.criticality = query.criticality;
  if (query.q) filter.$or = [{ name: { $regex: query.q, $options: "i" } }, { assetCode: { $regex: query.q, $options: "i" } }, { serialNumber: { $regex: query.q, $options: "i" } }];
  const [assets, total] = await Promise.all([
    Asset.find(filter).populate("plantId", "name code").sort({ [query.sort]: query.order === "asc" ? 1 : -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
    Asset.countDocuments(filter)
  ]);
  res.json({ success: true, data: { assets, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } } });
} catch (error) { next(error); } });
assetRouter.get("/:assetId", async (req, res, next) => { try {
  const asset = await Asset.findOne({ _id: req.params.assetId, organizationId: req.auth!.organizationId }).populate("plantId", "name code").lean();
  if (!asset) { res.status(404).json({ success: false, error: { code: "ASSET_NOT_FOUND", message: "The asset was not found in this organization." } }); return; }
  const history = await AssetEvent.find({ assetId: asset._id, organizationId: req.auth!.organizationId }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: { asset, history } });
} catch (error) { next(error); } });
assetRouter.post("/", requireRoles(...writers), async (req, res, next) => { try {
  const input = createAssetSchema.parse(req.body);
  const plant = await Plant.findOne({ _id: input.plantId, organizationId: req.auth!.organizationId, status: "active" }).select("_id productionLines").lean();
  if (!plant) { res.status(404).json({ success: false, error: { code: "PLANT_NOT_FOUND", message: "An active plant in this organization is required." } }); return; }
  if (input.productionLineCode && !plant.productionLines.some(line => line.code === input.productionLineCode)) { res.status(400).json({ success: false, error: { code: "PRODUCTION_LINE_NOT_FOUND", message: "The selected production line does not belong to this plant." } }); return; }
  if (input.workCellCode && !plant.productionLines.some(line => line.workCells.some(cell => cell.code === input.workCellCode))) { res.status(400).json({ success: false, error: { code: "WORK_CELL_NOT_FOUND", message: "The selected work cell does not belong to this plant." } }); return; }
  const asset = await Asset.create({ ...input, organizationId: req.auth!.organizationId, createdBy: req.auth!.userId, updatedBy: req.auth!.userId });
  await AssetEvent.create({ organizationId: req.auth!.organizationId, assetId: asset._id, actorUserId: req.auth!.userId, type: "asset.created", toStatus: asset.status });
  res.status(201).json({ success: true, data: { asset } });
} catch (error) { next(error); } });
assetRouter.patch("/:assetId", requireRoles(...writers), async (req, res, next) => { try {
  const input = updateAssetSchema.parse(req.body);
  const asset = await Asset.findOneAndUpdate({ _id: req.params.assetId, organizationId: req.auth!.organizationId }, { $set: { ...input, updatedBy: req.auth!.userId } }, { new: true, runValidators: true });
  if (!asset) { res.status(404).json({ success: false, error: { code: "ASSET_NOT_FOUND", message: "The asset was not found in this organization." } }); return; }
  await AssetEvent.create({ organizationId: req.auth!.organizationId, assetId: asset._id, actorUserId: req.auth!.userId, type: "asset.updated", changes: Object.keys(input) });
  res.json({ success: true, data: { asset } });
} catch (error) { next(error); } });
assetRouter.patch("/:assetId/status", requireRoles(...writers), async (req, res, next) => { try {
  const { status } = statusSchema.parse(req.body);
  const asset = await Asset.findOne({ _id: req.params.assetId, organizationId: req.auth!.organizationId });
  if (!asset) { res.status(404).json({ success: false, error: { code: "ASSET_NOT_FOUND", message: "The asset was not found in this organization." } }); return; }
  const fromStatus = asset.status;
  if (!transitions[fromStatus]?.includes(status)) { res.status(409).json({ success: false, error: { code: "INVALID_ASSET_TRANSITION", message: `Cannot transition an asset from ${fromStatus} to ${status}.` } }); return; }
  asset.status = status; asset.updatedBy = new Types.ObjectId(req.auth!.userId); await asset.save();
  await AssetEvent.create({ organizationId: req.auth!.organizationId, assetId: asset._id, actorUserId: req.auth!.userId, type: "asset.status_changed", fromStatus, toStatus: status });
  res.json({ success: true, data: { asset } });
} catch (error) { next(error); } });

import { Schema, model } from "mongoose";

export const ASSET_CATEGORIES = ["production_machine", "conveyor", "robotics", "packaging", "utilities", "inspection", "safety", "other"] as const;
export const ASSET_STATUSES = ["commissioning", "operational", "standby", "maintenance", "decommissioned"] as const;
export const ASSET_CRITICALITIES = ["low", "medium", "high", "critical"] as const;
const evidenceSchema = new Schema({ name: { type: String, required: true, trim: true, maxlength: 160 }, reference: { type: String, required: true, trim: true, maxlength: 500 }, mediaType: { type: String, trim: true, maxlength: 120 }, uploadedAt: { type: Date, default: Date.now } }, { _id: false });
const assetSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  plantId: { type: Schema.Types.ObjectId, ref: "Plant", required: true, index: true },
  assetCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 40 },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, trim: true, maxlength: 1000 },
  category: { type: String, enum: ASSET_CATEGORIES, required: true },
  status: { type: String, enum: ASSET_STATUSES, default: "commissioning", required: true },
  criticality: { type: String, enum: ASSET_CRITICALITIES, default: "medium", required: true },
  serialNumber: { type: String, trim: true, maxlength: 100 },
  model: { type: String, trim: true, maxlength: 120 },
  manufacturer: { type: String, trim: true, maxlength: 120 },
  acquiredAt: { type: Date },
  warrantyUntil: { type: Date },
  productionLineCode: { type: String, trim: true, uppercase: true, maxlength: 32 },
  workCellCode: { type: String, trim: true, uppercase: true, maxlength: 32 },
  ownerUserId: { type: Schema.Types.ObjectId, ref: "User" },
  location: { building: { type: String, trim: true, maxlength: 100 }, floor: { type: String, trim: true, maxlength: 40 }, area: { type: String, trim: true, maxlength: 100 }, coordinates: { latitude: { type: Number, min: -90, max: 90 }, longitude: { type: Number, min: -180, max: 180 } } },
  evidence: { type: [evidenceSchema], default: [] },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
assetSchema.index({ organizationId: 1, assetCode: 1 }, { unique: true });
assetSchema.index({ organizationId: 1, plantId: 1, status: 1 });
assetSchema.index({ organizationId: 1, category: 1, criticality: 1 });
assetSchema.index({ organizationId: 1, name: 1 });
assetSchema.index({ organizationId: 1, serialNumber: 1 }, { unique: true, sparse: true });
export const Asset = model("Asset", assetSchema);

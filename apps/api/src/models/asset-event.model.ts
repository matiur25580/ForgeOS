import { Schema, model } from "mongoose";
const assetEventSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
  actorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["asset.created", "asset.updated", "asset.status_changed"], required: true },
  fromStatus: { type: String },
  toStatus: { type: String },
  changes: { type: Schema.Types.Mixed }
}, { timestamps: { createdAt: true, updatedAt: false } });
assetEventSchema.index({ organizationId: 1, assetId: 1, createdAt: -1 });
export const AssetEvent = model("AssetEvent", assetEventSchema);

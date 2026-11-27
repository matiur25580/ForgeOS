import { Schema, model } from "mongoose";

const workCellSchema = new Schema({ code: { type: String, required: true, trim: true, uppercase: true, maxlength: 32 }, name: { type: String, required: true, trim: true, maxlength: 120 } }, { _id: false });
const lineSchema = new Schema({ code: { type: String, required: true, trim: true, uppercase: true, maxlength: 32 }, name: { type: String, required: true, trim: true, maxlength: 120 }, workCells: { type: [workCellSchema], default: [] } }, { _id: false });
const plantSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  code: { type: String, required: true, trim: true, uppercase: true, maxlength: 24 },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ["active", "inactive"], default: "active", required: true },
  address: { line1: { type: String, trim: true, maxlength: 160 }, city: { type: String, trim: true, maxlength: 100 }, region: { type: String, trim: true, maxlength: 100 }, postalCode: { type: String, trim: true, maxlength: 24 }, country: { type: String, trim: true, maxlength: 80 } },
  timezone: { type: String, trim: true, maxlength: 80, default: "UTC" },
  productionLines: { type: [lineSchema], default: [] },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
plantSchema.index({ organizationId: 1, code: 1 }, { unique: true });
plantSchema.index({ organizationId: 1, status: 1, name: 1 });
export const Plant = model("Plant", plantSchema);

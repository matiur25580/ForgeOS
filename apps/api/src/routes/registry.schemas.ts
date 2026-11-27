import { z } from "zod";
import { ASSET_CATEGORIES, ASSET_CRITICALITIES, ASSET_STATUSES } from "../models/asset.model.js";
const code = z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{1,39}$/).transform(v => v.toUpperCase());
const optionalText = (max: number) => z.string().trim().max(max).optional();
const line = z.object({ code: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{1,31}$/).transform(v => v.toUpperCase()), name: z.string().trim().min(1).max(120), workCells: z.array(z.object({ code: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{1,31}$/).transform(v => v.toUpperCase()), name: z.string().trim().min(1).max(120) }).strict()).max(100).default([]) }).strict();
export const createPlantSchema = z.object({ code: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{1,23}$/).transform(v => v.toUpperCase()), name: z.string().trim().min(2).max(120), description: optionalText(500), timezone: z.string().trim().min(1).max(80).default("UTC"), address: z.object({ line1: optionalText(160), city: optionalText(100), region: optionalText(100), postalCode: optionalText(24), country: optionalText(80) }).strict().optional(), productionLines: z.array(line).max(100).default([]) }).strict();
export const updatePlantSchema = createPlantSchema.partial().strict();
export const createAssetSchema = z.object({
  plantId: z.string().regex(/^[a-f\d]{24}$/i), assetCode: code, name: z.string().trim().min(2).max(140), description: optionalText(1000),
  category: z.enum(ASSET_CATEGORIES), criticality: z.enum(ASSET_CRITICALITIES).default("medium"),
  serialNumber: optionalText(100), model: optionalText(120), manufacturer: optionalText(120),
  acquiredAt: z.coerce.date().optional(), warrantyUntil: z.coerce.date().optional(),
  productionLineCode: optionalText(32), workCellCode: optionalText(32),
  location: z.object({ building: optionalText(100), floor: optionalText(40), area: optionalText(100), coordinates: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }).strict().optional() }).strict().optional(),
  evidence: z.array(z.object({ name: z.string().trim().min(1).max(160), reference: z.string().trim().min(1).max(500), mediaType: optionalText(120) }).strict()).max(30).default([])
}).strict();
export const updateAssetSchema = createAssetSchema.omit({ plantId: true, assetCode: true }).partial().strict();
export const statusSchema = z.object({ status: z.enum(ASSET_STATUSES) }).strict();
export const listQuerySchema = z.object({ q: z.string().trim().max(120).optional(), plantId: z.string().regex(/^[a-f\d]{24}$/i).optional(), status: z.string().optional(), category: z.string().optional(), criticality: z.string().optional(), sort: z.enum(["name", "assetCode", "createdAt", "updatedAt"]).default("createdAt"), order: z.enum(["asc", "desc"]).default("desc"), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }).strict();

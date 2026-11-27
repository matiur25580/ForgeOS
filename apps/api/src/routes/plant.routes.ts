import { Router } from "express";
import { authenticate, requireRoles } from "../middleware/auth.middleware.js";
import { Plant } from "../models/plant.model.js";
import { createPlantSchema, updatePlantSchema } from "./registry.schemas.js";
export const plantRouter = Router();
plantRouter.use(authenticate);
plantRouter.get("/", async (req, res, next) => { try {
  const rows = await Plant.find({ organizationId: req.auth!.organizationId }).sort({ name: 1 }).lean();
  res.json({ success: true, data: { plants: rows } });
} catch (error) { next(error); } });
plantRouter.post("/", requireRoles("owner", "admin", "plant_manager"), async (req, res, next) => { try {
  const input = createPlantSchema.parse(req.body);
  const plant = await Plant.create({ ...input, organizationId: req.auth!.organizationId, createdBy: req.auth!.userId });
  res.status(201).json({ success: true, data: { plant } });
} catch (error) { next(error); } });
plantRouter.patch("/:plantId", requireRoles("owner", "admin", "plant_manager"), async (req, res, next) => { try {
  const input = updatePlantSchema.parse(req.body);
  const plant = await Plant.findOneAndUpdate({ _id: req.params.plantId, organizationId: req.auth!.organizationId }, { $set: input }, { new: true, runValidators: true });
  if (!plant) { res.status(404).json({ success: false, error: { code: "PLANT_NOT_FOUND", message: "The plant was not found in this organization." } }); return; }
  res.json({ success: true, data: { plant } });
} catch (error) { next(error); } });

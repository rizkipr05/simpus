import { Router } from "express";
import { authenticate } from "../auth.js";
import { getById, listByType, saveDocument } from "../repositories/recordsRepository.js";

const router = Router();

router.use(authenticate);

router.get("/", async (_req, res, next) => {
  try {
    const patients = await listByType("patient");
    res.json(patients);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const patient = await getById(req.params.id);
    res.json(patient);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const patient = await saveDocument({
      ...req.body,
      _id: req.body._id || `patient:${crypto.randomUUID()}`,
      type: "patient",
    });
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const patient = await saveDocument({
      ...req.body,
      _id: req.params.id,
      type: "patient",
    });
    res.json(patient);
  } catch (error) {
    next(error);
  }
});

export default router;

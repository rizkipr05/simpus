import { Router } from "express";
import { authenticate } from "../auth.js";
import { listByType, saveDocument } from "../repositories/recordsRepository.js";

const router = Router();

router.use(authenticate);

router.get("/", async (_req, res, next) => {
  try {
    const records = await listByType("medical-record");
    res.json(records);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const record = await saveDocument({
      ...req.body,
      _id: req.body._id || `medical-record:${crypto.randomUUID()}`,
      type: "medical-record",
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const record = await saveDocument({
      ...req.body,
      _id: req.params.id,
      type: "medical-record",
    });
    res.json(record);
  } catch (error) {
    next(error);
  }
});

export default router;

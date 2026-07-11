import { Router } from "express";
import {
  getRoadmap,
  updateRoadmap,
} from "../controllers/roadmap.controller";

const router = Router();

router.get("/", getRoadmap);
router.patch("/", updateRoadmap);

export default router;
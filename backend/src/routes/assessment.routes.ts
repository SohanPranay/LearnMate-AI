import { Router } from "express";
import {
  getAssessment,
  submitAssessment,
} from "../controllers/assessment.controller";

const router = Router();

router.get("/", getAssessment);
router.post("/", submitAssessment);

export default router;
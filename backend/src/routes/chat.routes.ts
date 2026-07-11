import { Router } from "express";
import { getChatMessage, sendChatMessage } from "../controllers/chat.controller";

const router = Router();

router.get("/", getChatMessage);
router.post("/", sendChatMessage);

export default router;
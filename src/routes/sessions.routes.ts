import { Router } from "express";

import { SessionsController } from "../controllers/sessions.controller";

const sessionsController = new SessionsController();
const sessionsRouter = Router();
sessionsRouter.post("/", sessionsController.createSession);
sessionsRouter.delete("/user/:id", sessionsController.deleteAllUserSession);
sessionsRouter.delete("/expired", sessionsController.deleteAllExpired);
export default sessionsRouter;

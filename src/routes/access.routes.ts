import { Router } from "express";
import { requestMeta } from "../middlewares/requestMeta";
import { SessionController } from "../controllers/session.controller";
const sessionController = new SessionController();
const acesssRouter = Router();

acesssRouter.get(
  "/session/verify",
  requestMeta,
  sessionController.verifySession
);

export default acesssRouter;

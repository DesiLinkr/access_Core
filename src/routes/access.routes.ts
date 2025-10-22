import { Router } from "express";
import { requestMeta } from "../middlewares/requestMeta";

import { AccessController } from "../controllers/access.controller";
import { verifyAccessToken } from "../middlewares/auth.middleware";

const accessController = new AccessController();
const acesssRouter = Router();

acesssRouter.get(
  "/token/refresh",
  requestMeta,
  accessController.issueAccessToken
);

acesssRouter.get("/me", verifyAccessToken, accessController.getUserInfo);
acesssRouter.get("/history", verifyAccessToken, accessController.acesssHistory);
export default acesssRouter;

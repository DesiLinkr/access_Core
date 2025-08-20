import { Router } from "express";
import { requestMeta } from "../middlewares/requestMeta";

import { AccessController } from "../controllers/access.controller";
import { verifyAccessToken } from "../middlewares/auth.middleware";

const accessTokencontroller = new AccessController();
const acesssRouter = Router();

acesssRouter.get(
  "/token/refresh",
  requestMeta,
  accessTokencontroller.issueAccessToken
);
acesssRouter.get("/me", verifyAccessToken, accessTokencontroller.getUserInfo);

export default acesssRouter;

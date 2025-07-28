import { Router } from "express";
import { requestMeta } from "../middlewares/requestMeta";

import { AccessTokenController } from "../controllers/access.controller";

const accessTokencontroller = new AccessTokenController();
const acesssRouter = Router();

acesssRouter.get(
  "/token/refresh",
  requestMeta,
  accessTokencontroller.issueAccessToken
);
acesssRouter.get("/me", requestMeta, accessTokencontroller.getUserInfo);

export default acesssRouter;

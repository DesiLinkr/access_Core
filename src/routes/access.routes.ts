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
acesssRouter.delete("/logout", (req, res) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  return res.status(200).json({ message: "Logged out" });
});
acesssRouter.post("/verify", accessController.verifyAccessToken);

acesssRouter.get("/history", verifyAccessToken, accessController.acesssHistory);
export default acesssRouter;

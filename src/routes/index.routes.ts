import { Router } from "express";
import healthRouter from "./health.route";
import acesssRouter from "./access.routes";

const routes = Router();

routes.use("/health", healthRouter);
routes.use("/access", acesssRouter);
export default routes;

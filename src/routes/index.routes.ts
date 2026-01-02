import { Router } from "express";
import healthRouter from "./health.route";
import acesssRouter from "./access.routes";
import sessionsRouter from "./sessions.routes";

const routes = Router();

routes.use("/health", healthRouter);
routes.use("/access", acesssRouter);
routes.use("/sessions", sessionsRouter);
export default routes;

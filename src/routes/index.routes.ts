import { Router } from "express";
import healthRouter from "./health.route";

const routes = Router();

routes.use("/health", healthRouter);

export default routes;

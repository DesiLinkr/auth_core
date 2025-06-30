import { Router } from "express";
import healthRouter from "./health.route";
import AuthRouter from "./auth.routes";

const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", AuthRouter);

export default routes;

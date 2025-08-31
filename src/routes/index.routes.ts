import { Router } from "express";
import healthRouter from "./health.route";
import AuthRouter from "./auth.routes";
import settingsRouter from "./settings.routes";

const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", AuthRouter);
routes.use("/settings", settingsRouter);
export default routes;

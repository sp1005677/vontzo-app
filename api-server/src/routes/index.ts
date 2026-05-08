import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import userRouter from "./user";
import coachRouter from "./coach";
import leagueRouter from "./league";
import shopRouter from "./shop";
import gymRouter from "./gym";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/coach", coachRouter);
router.use("/league", leagueRouter);
router.use("/shop", shopRouter);
router.use("/gym", gymRouter);

export default router;

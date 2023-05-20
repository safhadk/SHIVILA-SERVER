import express from "express";
import {Register,Login,Subscribe,CheckSubscription} from "../controller/user.js";

const router = express.Router();

router.post('/register',Register)
router.post('/login',Login)
router.post('/subscribe',Subscribe)
router.get('/subscribe',CheckSubscription)

export default router;

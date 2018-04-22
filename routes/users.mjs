import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import * as Users from "../libs/Users/Users.mjs";
global._ = _;

const router = express.Router();
router.use(bodyParser.json());

router.post("/register",
  Users.validateRegister,
  (req, res, next) => {
    Users.register(req.body)
      .then((data) => res.json(data))
      .catch(next);
});

router.post("/login",
  Users.validateLogin,
  (req, res, next) => {
    Users.login(req.body)
      .then((data) => res.json(data))
      .catch(next);
});

router.get("/scores",
  (req, res, next) => {
    Users.getScores()
      .then((data) => res.json(data))
      .catch(next);
});

export default router;

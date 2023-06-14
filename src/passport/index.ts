import passport from "passport";
import local from "./local";
import jwt from "./jwt";

const initialize = () => {
    passport.use(local);
    passport.use(jwt);
}

export default initialize;

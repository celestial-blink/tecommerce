import { Strategy } from 'passport-local';
import { compare } from 'bcrypt';
import boom from "@hapi/boom";

import UserController from '../controller/user.controller';

const local = new Strategy(async (username, password, done) => {
    try {
        const userController = new UserController();
        const user = await userController.login({ username });
        if (!user) return done(boom.forbidden(), false);
        const isMatch = await compare(password, user.password);
        if (!isMatch) return done(boom.forbidden("usuario y contraseñas incorrectos"), false);
        return done(null, user);
    } catch (error) {
        done(error, false);
    }
});

export default local;

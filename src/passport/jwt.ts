import JwtStrategy, { StrategyOptions } from 'passport-jwt';
import config from '../../config';

const opts: StrategyOptions = {
    jwtFromRequest: JwtStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt_secret,
}

const jwt = new JwtStrategy.Strategy(opts, (payloadJwt, done) => {
    return done(null, payloadJwt);
});

export default jwt;

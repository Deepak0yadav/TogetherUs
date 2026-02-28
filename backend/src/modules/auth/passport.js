import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { query } from '../../db/client.js';
import { createUser, findUserByEmail, findUserByGoogleId } from './service.js';

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await query('SELECT id, email, name FROM users WHERE id = $1', [id]);
    done(null, rows[0] || null);
  } catch (e) {
    done(e);
  }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await findUserByGoogleId(profile.id);
          if (!user) {
            user = await createUser({
              email: profile.emails?.[0]?.value || `${profile.id}@google.placeholder`,
              name: profile.displayName,
              google_id: profile.id,
            });
          }
          return done(null, user);
        } catch (e) {
          return done(e);
        }
      }
    )
  );
}

export default passport;

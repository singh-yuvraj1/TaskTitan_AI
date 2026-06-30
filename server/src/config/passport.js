import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../models/User.js';
import { seedUserData } from '../../services/seedService.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error('No email found in Google profile'), null);
      }
      
      const email = profile.emails[0].value.toLowerCase().trim();
      const name = profile.displayName || '';
      
      let user = await User.findOne({ email });
      if (!user) {
        // Create a new user with a secure random password since it is OAuth
        const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
        user = await User.create({
          email,
          name,
          password: randomPassword // pre-save hook handles hashing
        });
        
        // Seed default workspace data for the new OAuth user
        try {
          await seedUserData(email);
        } catch (seedErr) {
          console.error('[SEED ERROR] OAuth seeding failed:', seedErr.message);
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;

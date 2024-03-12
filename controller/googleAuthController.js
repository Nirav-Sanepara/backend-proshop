
// Import necessary modules
import passport  from ('passport');
import { Strategy } from 'passport-google-oauth20';

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: '383198814159-i6becmdphkpnq2b2kj94k6g6vqpu7avk.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    // Check if the user already exists in the database
    const userExists = await User.findOne({ email: profile.emails[0].value });

    if (userExists) {
      // If the user exists, generate a token and send a response
      return done(null, userExists);
    } else {
      // If the user doesn't exist, create a new user and save it to the database
      const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        // Add other necessary fields from the Google profile
        // ...
        isActive: true, // You can set the default value as needed
      });

      await newUser.save();
      return done(null, newUser);
    }
  }
));

// Serialize and deserialize user functions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Use the passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to the home page or send a response
    res.redirect('/');
  }
);

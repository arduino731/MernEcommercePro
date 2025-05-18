import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { storage } from './mongoose-storage';
import { User, UserModel } from '@shared/models';

// Configure Passport with a local strategy
export const configurePassport = () => {
  // Set up local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await storage.getUserByEmail(email);
          
          // If user not found
          if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
          
          // Check if password matches
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
          
          // Return user if authentication is successful
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  // Serialize user to the session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id).lean();
      if (!user) return done(null, false);

      done(null, {
        id: user._id.toString(), // ✅ Required for req.user.id
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      done(error);
    }
  });

  
  return passport;
};

// Helper function to hash passwords
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Middleware to check if user is authenticated
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to check if user is admin
export const isAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: 'Forbidden' });
};

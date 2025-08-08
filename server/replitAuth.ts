import session from "express-session";
import type { Express, RequestHandler, Request, Response } from "express";
import { storage } from "./storage";

// Étendre les types pour les sessions
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: any;
  }
}

// Configuration pour Supabase + Vercel
const isDevelopment = process.env.NODE_ENV === 'development';

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  if (isDevelopment) {
    // Session en mémoire pour le développement
    return session({
      secret: process.env.SESSION_SECRET || 'dev-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // false pour le développement local
        maxAge: sessionTtl,
      },
    });
  }
  
  // Session pour la production (Vercel)
  return session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // true pour HTTPS en production
      maxAge: sessionTtl,
      sameSite: 'lax'
    },
  });
}

async function upsertUser(userData: {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}) {
  await storage.upsertUser(userData);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Routes d'authentification simples
  app.get("/api/login", (req: Request, res: Response) => {
    // En développement, simuler une connexion
    if (isDevelopment) {
      const testUser = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        firstName: 'Dev',
        lastName: 'User',
        profileImageUrl: 'https://via.placeholder.com/150'
      };
      
      req.session.userId = testUser.id;
      req.session.user = testUser;
      
      res.redirect('/');
    } else {
      // En production, rediriger vers la page de connexion
      res.redirect('/login');
    }
  });

  app.get("/api/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  // Route pour créer un compte (simulation)
  app.post("/api/register", async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      // Créer un ID unique
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const userData = {
        id: userId,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || email)}&background=random`
      };
      
      // Sauvegarder l'utilisateur
      await upsertUser(userData);
      
      // Créer la session
      req.session.userId = userId;
      req.session.user = userData;
      
      res.json({ success: true, user: userData });
    } catch (error) {
      console.error('Erreur inscription:', error);
      res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
  });

  // Route pour se connecter (simulation)
  app.post("/api/login", async (req, res) => {
    try {
      const { email } = req.body;
      
      // En développement, créer un utilisateur automatiquement
      if (isDevelopment) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const userData = {
          id: userId,
          email,
          firstName: 'Dev',
          lastName: 'User',
          profileImageUrl: 'https://via.placeholder.com/150'
        };
        
        await upsertUser(userData);
        
        req.session.userId = userId;
        req.session.user = userData;
        
        res.json({ success: true, user: userData });
      } else {
        // En production, vérifier l'utilisateur existant
        // TODO: Implémenter une vraie authentification
        res.status(400).json({ error: 'Authentification non implémentée en production' });
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // En développement, toujours authentifié
  if (isDevelopment) {
    if (!req.session.userId) {
      // Créer un utilisateur de test automatiquement
      const userId = 'dev-user-id';
      const userData = {
        id: userId,
        email: 'dev@example.com',
        firstName: 'Dev',
        lastName: 'User',
        profileImageUrl: 'https://via.placeholder.com/150'
      };
      
      req.session.userId = userId;
      req.session.user = userData;
      
      // Ajouter les données utilisateur à la requête
      req.user = {
        claims: { sub: userId },
        ...userData
      };
      
      return next();
    }
  }
  
  // Vérifier l'authentification
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Récupérer les données utilisateur
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  
  // Ajouter les données utilisateur à la requête
  req.user = {
    claims: { sub: user.id },
    ...user
  };
  
  next();
};

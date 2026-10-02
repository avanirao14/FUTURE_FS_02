import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './server/config/db.ts';
import authRoutes from './server/routes/authRoutes.ts';
import leadRoutes from './server/routes/leadRoutes.ts';
import noteRoutes from './server/routes/noteRoutes.ts';
import followUpRoutes from './server/routes/followUpRoutes.ts';
import dashboardRoutes from './server/routes/dashboardRoutes.ts';
import publicRoutes from './server/routes/publicRoutes.ts';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect to Database (MongoDB or persistent fallback)
  await connectDB();

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/leads', leadRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/followups', followUpRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/public', publicRoutes);

  // Global Error Handler for API
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: isProduction ? undefined : err.message,
    });
  });

  // Frontend Integration
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mini CRM Server running at http://0.0.0.0:${PORT}`);
    console.log(`📋 Future Interns Task 2 (FUTURE_FS_02) API ready`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

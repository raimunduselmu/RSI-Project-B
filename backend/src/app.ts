import { withErrorResponses } from './lib/openapiErrors.js';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { env, isProd } from './config/env.js';
import { apiRouter } from './routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();

app.set('trust proxy', 1);                     // di belakang Nginx / Cloudflare / Vercel
app.use(helmet());
app.use(cors({ origin: env.APP_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (!isProd) app.use(morgan('dev'));

app.use('/api/v1', apiRouter);

// Dokumentasi API: /api/docs
const specPath = path.resolve(process.cwd(), '../docs/api/openapi.yaml');
if (fs.existsSync(specPath)) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(withErrorResponses(YAML.parse(fs.readFileSync(specPath, 'utf8')))));
}

app.use(notFound);
app.use(errorHandler);

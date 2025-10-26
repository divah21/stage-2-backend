import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import db from '../models/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

db.sequelize.authenticate()
  .then(() => console.log('✓ Database connected successfully'))
  .catch(err => console.error('✗ Database connection failed:', err.message));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({
    message: 'Country Currency Exchange API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      refresh: 'POST /countries/refresh',
      countries: 'GET /countries',
      country: 'GET /countries/:name',
      delete: 'DELETE /countries/:name',
      status: 'GET /status',
      image: 'GET /countries/image'
    }
  });
});

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`\n📚 Available endpoints:`);
  console.log(`   POST   /countries/refresh`);
  console.log(`   GET    /countries`);
  console.log(`   GET    /countries/:name`);
  console.log(`   DELETE /countries/:name`);
  console.log(`   GET    /status`);
  console.log(`   GET    /countries/image`);
  console.log(`\n✓ Ready to accept requests\n`);
});

export default app;

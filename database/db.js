import dotenv from 'dotenv';
dotenv.config();

const isDevelopment = process.env.NODE_ENV !== 'production';

const baseConfig = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'country_currency_db',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: isDevelopment ? console.log : false,
  pool: {
    max: isDevelopment ? 5 : 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('amazonaws.com') ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
};

const config = {
  development: baseConfig,
  production: baseConfig
};

export default config;

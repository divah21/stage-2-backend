import path, { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import { Sequelize, DataTypes } from 'sequelize';
import process from 'process';
import dbConfig from '../database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const files = fs.readdirSync(__dirname).filter(file => {
  return (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  );
});

for (const file of files) {
  const modelPath = pathToFileURL(path.join(__dirname, file)).href;
  const { default: modelDefiner } = await import(modelPath);

  if (typeof modelDefiner !== 'function') {
    continue;
  }

  const model = modelDefiner(sequelize, DataTypes);
  console.log(`✓ Loading model: ${model.name}`);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

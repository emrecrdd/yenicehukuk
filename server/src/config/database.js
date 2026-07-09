import { Sequelize } from 'sequelize';
import { config } from './env.js';
import { logger } from './logger.js';
import { initModels } from '../models/index.js';

if (!config.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL missing in environment variables");
}

export const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  logging: config.NODE_ENV === 'development'
    ? (msg) => logger.debug(msg)
    : false,

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();

    logger.info('✅ Neon PostgreSQL connected');

    initModels(sequelize);

    // 🔥 CRITICAL FIX (DEV + PROD)
    await sequelize.sync({ alter: true });
    logger.info('✅ Database synced');

    return sequelize;

  } catch (error) {
    logger.error('❌ DB connection failed:', error);

    // ❗ Render crash önleme
    console.log("⚠️ DB failed but server will continue");

    return null;
  }
};



const app = require('./src/app');
const sequelize = require('./src/config/database');

const port = process.env.PORT || 3001;

async function startServer() {
  try {
    // Sync database models (sync schema tables)
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');

    app.listen(port, () => {
      console.log(`Backend server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

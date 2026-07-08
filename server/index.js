import { app, connectToMongo } from './app.js';

const PORT = process.env.PORT || 3001;

// Start server after connecting to Mongo
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`OraSnap Express Backend is running on port ${PORT}`);
  });
});

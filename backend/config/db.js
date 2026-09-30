const mongoose = require('mongoose');

// Expose a clean `id` string (alongside `_id`) and drop `__v` on every
// model's JSON/object output, so the frontend can rely on `.id` everywhere
// without each model needing its own toJSON override.
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});
mongoose.set('toObject', { virtuals: true });

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing — set it in backend/.env');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      const last = attempt === MAX_RETRIES;
      console.error(
        `MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`
      );
      if (last) {
        console.error(
          'Impossible de joindre MongoDB. Démarrez-le puis relancez le backend.'
        );
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;

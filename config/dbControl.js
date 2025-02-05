import { MongoClient } from 'mongodb';
 
export default function MongoDB({ url }) {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
      console.log("MongoDB connection established");
      global.dbClient = client; // Store client globally
    })
    .catch((err) => {
      console.error("MongoDB error: ", err.message);
      process.exit(1); // Exit process if connection fails
    });
}
 
 
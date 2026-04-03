require('dotenv').config();
const mongoose = require('mongoose');

async function checkDb() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.\\n');

    const collections = await mongoose.connection.db.collections();
    let result = '';
    
    if (collections.length === 0) {
      result += 'No collections found in the database. The database is empty.\\n';
    } else {
      result += `Found ${collections.length} collections:\\n`;
      for (const collection of collections) {
        const count = await collection.countDocuments();
        result += `- Collection: ${collection.collectionName} (Documents: ${count})\\n`;
        if (count > 0) {
          const sample = await collection.findOne();
          result += `  Sample Document: ${JSON.stringify(sample)}\\n`;
        }
      }
    }
    require('fs').writeFileSync('output.json', JSON.stringify({ success: true, message: 'Connected successfully', data: result }));
  } catch (error) {
    require('fs').writeFileSync('output.json', JSON.stringify({ error: error.message }));
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

checkDb();

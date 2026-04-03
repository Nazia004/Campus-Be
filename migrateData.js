const { MongoClient } = require('mongodb');

const oldUri = "mongodb://aditiii_27:asdrtfyguhij456@ac-eekd9mt-shard-00-00.ydl3xxo.mongodb.net:27017,ac-eekd9mt-shard-00-01.ydl3xxo.mongodb.net:27017,ac-eekd9mt-shard-00-02.ydl3xxo.mongodb.net:27017/?ssl=true&replicaSet=atlas-5woi3r-shard-0&authSource=admin&appName=Cluster0";
const newUri = "mongodb://naziaquadri67_db_user:kV1unH4zxwZAN1om@ac-2zydjwd-shard-00-00.imv5lyx.mongodb.net:27017,ac-2zydjwd-shard-00-01.imv5lyx.mongodb.net:27017,ac-2zydjwd-shard-00-02.imv5lyx.mongodb.net:27017/?ssl=true&replicaSet=atlas-13wb0l-shard-0&authSource=admin&appName=Cluster0";

async function migrateData() {
  const oldClient = new MongoClient(oldUri);
  const newClient = new MongoClient(newUri);

  try {
    console.log("Connecting to the old database...");
    await oldClient.connect();
    const oldDb = oldClient.db();

    console.log("Connecting to the new database...");
    await newClient.connect();
    const newDb = newClient.db();

    let logOutput = "Migration started.\\n";
    // Get all collections from the old DB
    const collections = await oldDb.listCollections().toArray();
    logOutput += `Found ${collections.length} collections to migrate.\\n`;

    for (let colInfo of collections) {
      const collectionName = colInfo.name;
      logOutput += `Processing collection: ${collectionName}\\n`;

      const oldCollection = oldDb.collection(collectionName);
      const newCollection = newDb.collection(collectionName);

      // Fetch all documents
      const docs = await oldCollection.find({}).toArray();

      if (docs.length > 0) {
        // Insert into new database ignoring duplicates
        try {
          await newCollection.insertMany(docs, { ordered: false });
          logOutput += `  -> Successfully migrated ${docs.length} documents for ${collectionName}.\\n`;
        } catch (insertErr) {
          if (insertErr.code === 11000 || (insertErr.writeErrors && insertErr.writeErrors.some(e => e.code === 11000))) {
            logOutput += `  -> Inserted ${insertErr.insertedCount} documents for ${collectionName} (skipped duplicates).\\n`;
          } else {
            logOutput += `  -> Error inserting ${collectionName}: ${insertErr.message}\\n`;
          }
        }
      } else {
        logOutput += `  -> No documents found in ${collectionName}, skipping.\\n`;
      }
    }

    logOutput += "\\nMigration completed successfully!\\n";
    require('fs').writeFileSync('migrationLog.txt', logOutput);

  } catch (error) {
    require('fs').writeFileSync('migrationLog.txt', `Migration failed: ${error.message}`);
  } finally {
    // Close connections
    await oldClient.close();
    await newClient.close();
  }
}

migrateData();

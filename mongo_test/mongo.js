const dotenv = require('dotenv').config()
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_CONNECTION_URI.replace('$MONGO_USER', process.env.MONGO_USER).replace('$MONGO_PW', process.env.MONGO_PW)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connectMongo = async () => {
    await client.connect().then(res => {
        console.log('connected to mongo')
    });
}

const getCollection = (dbName, collectionName) => {
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    return collection
}

const disconnectMongo = async () => {
    await client.close()
        .then(res => {
            console.log("disconnected from mongo")
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })
}

(async () =>{
    const NUM_EXECUTIONS = 10
    let avgFetch = 0
    const totalStartMS = Date.now()
    for (let i = 0; i < NUM_EXECUTIONS; i++) {
        console.time('connMongo')
        await connectMongo();
        console.timeEnd('connMongo')
        console.time('collFetch')
        const coll = getCollection('spaghetti', 'article')
        console.timeEnd('collFetch')
        console.time('dbFetch')
        const startFetchMS = Date.now()
        const entry = await coll.findOne();
        avgFetch += Date.now() - startFetchMS
        console.timeEnd('dbFetch')
        await disconnectMongo();
    }
    console.log(`Run done, total/avg ms: ${Date.now() - totalStartMS} ${avgFetch / NUM_EXECUTIONS}`)
})();

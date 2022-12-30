const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, ServerDescriptionChangedEvent } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sqqe8rp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const myTaskCollection = client.db("simpleTaskManagement").collection("myTask");
        const myCompletedTaskCollection = client.db("simpleTaskManagement").collection("myCompletedTask");

        app.post('/mytask', async (req, res) => {
            const task = req.body;
            const result = await myTaskCollection.insertOne(task);
            res.send(result)
        })

        app.get('/mytask', async (req, res) => {
            const query = {};
            const tasks = await myTaskCollection.find(query).toArray();
            res.send(tasks);
        })

        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const task = await myTaskCollection.findOne(query);
            res.send(task);
        })

        app.put('/mytask/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const task = req.body;
            // console.log(updatedTask);
            const option = { upsert: true }
            const updatedTask = {
                $set: {
                    name: task.name
                }
            }
            const result = await myTaskCollection.updateOne(filter, updatedTask, option);
            res.send(result);
        })

        app.delete('/mytask/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await myTaskCollection.deleteOne(filter);
            res.send(result);
        })

        app.put("/completedtasks/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    completed: true,
                },
            };
            const result = await myTaskCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        app.get("/completedtasks", async (req, res) => {
            const query = { completed: true, email: req.query.email };
            const result = await myTaskCollection.find(query).toArray();
            res.send(result);
        });

        app.get("/mytasks", async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = { email: req.query.email };
            }
            const result = await myTaskCollection.find(query).toArray();
            res.send(result);
        });


    } finally {

    }
}

run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("Simple task management server is running")
})

app.listen(port, () => console.log(`Simple task management is running on ${port}`))
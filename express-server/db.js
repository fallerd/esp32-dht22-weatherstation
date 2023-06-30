import { MongoClient } from "mongodb";
import 'dotenv/config';

const mongoInfo = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.f1z2lxc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(mongoInfo);
const database = client.db('weather');
const sensors = database.collection('sensors');

let initialized = false;
const knownSensors = []

function isConnected() {
    return !!client && !!client.topology && client.topology.isConnected()
}

export async function initializeDB() {
    console.log('initializing DB')
    const result = await sensors.find();
    for await (const doc of result) {
        console.log('found sensor', doc.sensor)
        knownSensors.push(doc.sensor); 
    }
    initialized = true;
}

async function exists(sensor) {
    return knownSensors.includes(sensor)
}

async function appendNewSensor({ sensor, temp, humidity, date }) {
    try {
        const doc = {
            sensor: sensor,
            data: [
                {
                    temp,
                    humidity,
                    date
                }
            ]
        }
        const result = await sensors.insertOne(doc);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
        knownSensors.push(sensor); 
    } finally {
    }
}

export async function update(data) {
    if (initialized && isConnected()) {
        const { sensor, temp, humidity, date } = data
        try {
            const filter = { sensor };
            if (await exists(sensor)) {
                console.log('attempting update')
    
                const updateDocument = {
                    $push: {
                        data: {
                            temp,
                            humidity,
                            date
                        }
                    },
                };
                const result = await sensors.updateOne(filter, updateDocument);
                // console.log(result);
            } else {
                appendNewSensor(data)
            }
        } finally {
        }
    } else {
        console.error('not connected!')
    }
}

export async function getData() {
    console.log('getdata api called')
    const data = [];

    if (initialized && isConnected()) {
        const result = await sensors.find();
        for await (const doc of result) {
            data.push(doc); 
        }
    } else {
        console.error('not connected!')
    }
    return data;
}

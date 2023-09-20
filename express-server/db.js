import { MongoClient } from "mongodb";
import 'dotenv/config';

const mongoInfo = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.f1z2lxc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(mongoInfo);
client.connect()
const database = client.db('weather');
const sensors = database.collection('sensors');
const dataPoints = database.collection('data');
console.log(isConnected())

function isConnected() {
    return !!client && !!client.topology && client.topology.isConnected()
}

export async function update(data) {
    if (isConnected()) {
        const { sensor, temp, humidity, date } = data
        try {
            const doc = {
                sensor,
                temp,
                humidity,
                date
            }
            const result = await dataPoints.insertOne(doc);
        } finally {
        }
    } else {
        console.error('not connected!')
    }
}

function generateSensorAggregatePipeline(sensor) {
    return [
        {
          '$match': {
            'sensor': sensor
          }
        }, {
          '$group': {
            '_id': {
              '$dateToString': {
                'format': '%Y-%m-%dT%H', 
                'date': '$date'
              }
            }, 
            'temp': {
              '$avg': '$temp'
            }, 
            'humidity': {
              '$avg': '$humidity'
            }, 
            'count': {
              '$sum': 1
            }
          }
        }, {
          '$sort': {
            '_id': 1
          }
        }, {
          '$project': {
              'humidity': { '$trunc': [ "$humidity", 1 ] },
              'temp': { '$trunc': [ "$temp", 1 ] }
          }
        }, {
          '$addFields': {
            'date': {
              '$dateAdd': {
                'startDate': {
                  '$dateFromString': {
                    'dateString': '$_id'
                  }
                }, 
                'unit': 'minute', 
                'amount': 30
              }
            }
          }
        }, {
          '$unset': [
            'count', '_id'
          ]
        }
    ];
}

async function getSensorData(sensor) {
    const pipeline = generateSensorAggregatePipeline(sensor)

    const aggCursor = dataPoints.aggregate(pipeline);
    
    const data = []
    for await (const doc of aggCursor) {
        doc.date = new Date(doc.date).getTime()
        data.push(doc)
    }
    return data
}

export async function getData() {
    console.log('getdata api called')
    const start = new Date().getTime()
    
    const data = [];

    if (isConnected()) {
        data.push(...[{
            sensor: '1',
            data: await getSensorData('1')
        },
        {
            sensor: '2',
            data: await getSensorData('2')
        },
        {
            sensor: '3',
            data: await getSensorData('3')
        },
        {
            sensor: '4',
            data: await getSensorData('4')
        }])
        console.log(data[0].data[0])

        // /// TODO: pull only necessary data (e.g. either by date range or pull all data but only pull nth data over time)
        // // and transform it into sensible data structure that the app can read
        // // or reformat the way the app reads data so transforming it is not necessary
        // for await (const doc of result) {
        //     data.push(doc); 
        // }
    } else {
        console.error('getdata: not connected!')
    }
    console.log('getdata time', new Date().getTime() - start);
    return data;
}

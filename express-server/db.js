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
            console.log("inserting",doc)
            const result = await dataPoints.insertOne(doc);
            console.log(result)

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

        let [sensor1Data, sensor2Data, sensor3Data, sensor4Data] = await Promise.all([getSensorData('1'), getSensorData('2'), getSensorData('3'), getSensorData('4')]);

        data.push(...[{
            sensor: '1',
            data: sensor1Data
        },
        {
            sensor: '2',
            data: sensor2Data
        },
        {
            sensor: '3',
            data: sensor3Data
        },
        {
            sensor: '4',
            data: sensor4Data
        }])
    } else {
        console.error('getdata: not connected!')
    }
    console.log('getdata time', new Date().getTime() - start);
    return data;
}

import { MongoClient, ObjectId } from "mongodb";
import 'dotenv/config';

const mongoInfo = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.f1z2lxc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(mongoInfo);
client.connect()
const database = client.db('weather');
const dataPoints = database.collection('data');
const databaseDistance = client.db('distance');
const distanceCollection = databaseDistance.collection('distance');
console.log(isConnected())
const DistanceDocumentId = new ObjectId('664116e78fb5b2099b4ab2eb')

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

export async function updateDistance(data) {
    if (isConnected()) {
        const { distance, date } = data
        try {
            const doc = {
                distance,
                date
            }
            console.log("updating",doc)
            const result = await distanceCollection.updateOne({_id: DistanceDocumentId}, {$set: doc});
            console.log(result)

        } finally {
        }
    } else {
        console.error('not connected!')
    }
}

function generateSensorAggregatePipeline(sensor, daysToShow) {
    const dateLimit = daysToShow > 0 ? new Date(Date.now() - daysToShow * 24 * 60 * 60 * 1000) : null;

    // Raw data passthrough for last 24 hours
    if (parseInt(daysToShow) === 1) {
        return [
            {
                '$match': {
                    'sensor': sensor,
                    'date': { '$gte': dateLimit }
                }
            },
            {
                '$sort': { 'date': 1 }
            }
        ];
    }

    return [
        {
            '$match': {
                'sensor': sensor,
                ...(dateLimit && { 'date': { '$gte': dateLimit } })
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

async function getSensorData(sensor, daysToShow) {
    const pipeline = generateSensorAggregatePipeline(sensor, daysToShow)

    const aggCursor = dataPoints.aggregate(pipeline);
    
    const data = []
    for await (const doc of aggCursor) {
        doc.date = new Date(doc.date).getTime()
        data.push(doc)
    }
    return data
}

export async function getData(daysToShow) {
    console.log('getdata api called')
    const start = new Date().getTime()
    const data = [];

    if (isConnected()) {

        let [sensor1Data, sensor2Data, sensor3Data, sensor4Data] = await Promise.all([getSensorData('1', daysToShow), getSensorData('2', daysToShow), getSensorData('3', daysToShow), getSensorData('4', daysToShow)]);

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

export async function getDistance() {
    console.log('getDistance api called')
    const start = new Date().getTime()
    let data = {distance: 0, date: start}
    if (isConnected()) {
      try {
        data = await distanceCollection.findOne({_id: DistanceDocumentId});
    } catch (error) {
        console.error('getDistance: error fetching data', error);
    }
    } else {
        console.error('getDistance: not connected!')
    }
    console.log('getDistance time', new Date().getTime() - start);
    return data;
}

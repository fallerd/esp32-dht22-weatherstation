import { MongoClient, ObjectId } from "mongodb";
import 'dotenv/config';

const mongoInfo = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.f1z2lxc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(mongoInfo, {
  serverSelectionTimeoutMS: 5000, // Fail fast if no network
  connectTimeoutMS: 10000,
});

export async function connectDB() {
  try {
      await client.connect();
      console.log("Connected successfully to MongoDB");
  } catch (err) {
      console.error("Failed to connect to MongoDB", err);
      // We don't exit the process here so that the server can 
      // potentially try to reconnect later or be restarted by systemd
      throw err; 
  }
}

const database = client.db('weather');
const dataPoints = database.collection('data');
const databaseDistance = client.db('distance');
const distanceCollection = databaseDistance.collection('distance');
console.log('db is connected:', isConnected())
const DistanceDocumentId = new ObjectId('664116e78fb5b2099b4ab2eb')

const DateRangeDays = Object.freeze({
  hours12: 0.5,
  days1: 1,
  days3: 3,
  days7: 7,
  days30: 30,
  all: -1,
  default: 3,
});

const allowedDaysToShow = new Set([
  DateRangeDays.hours12,
  DateRangeDays.days1,
  DateRangeDays.days3,
  DateRangeDays.days7,
  DateRangeDays.days30,
  DateRangeDays.all,
]);

function normalizeDaysToShow(daysToShow) {
  const parsed = Number(daysToShow);
  if (allowedDaysToShow.has(parsed)) {
    return parsed;
  }

  console.warn('Invalid daysToShow received, defaulting to 3:', daysToShow);
  return DateRangeDays.default;
}

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

    // Raw data passthrough for last 12/24 hours
    // > 0 because -1 means "all time"
    if (daysToShow > 0 && daysToShow <= DateRangeDays.days1) {
        return [
            {
                '$match': {
                    'sensor': sensor,
                    'date': { '$gte': dateLimit }
                }
            },
            {
                '$sort': { 'date': 1 }
            },
            {
                '$project': {
                    '_id': 0,
                    'temp': 1,
                    'humidity': 1,
                    'date': { '$toLong': '$date' }
                }
            }
        ];
    }
    // All-time mode: 2 points/day (low/high) using original event timestamps. commented as this is more compute intensive, but slightly more accurate for identifying trends in the data. leaving the code here in case i want to switch back in the future
    // if (daysToShow === DateRangeDays.all) {
    //     return [
    //         {
    //             $match: {
    //                 sensor,
    //             },
    //         },
    //         {
    //             $group: {
    //                 _id: {
    //                     $dateTrunc: {
    //                         date: "$date",
    //                         unit: "day",
    //                     },
    //                 },
    //                 low: {
    //                     $top: {
    //                         sortBy: { temp: 1, date: 1 },
    //                         output: {
    //                             temp: "$temp",
    //                             humidity: "$humidity",
    //                             date: "$date",
    //                         },
    //                     },
    //                 },
    //                 high: {
    //                     $top: {
    //                         sortBy: { temp: -1, date: -1 },
    //                         output: {
    //                             temp: "$temp",
    //                             humidity: "$humidity",
    //                             date: "$date",
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $project: {
    //                 points: ["$low", "$high"],
    //             },
    //         },
    //         {
    //             $unwind: "$points",
    //         },
    //         {
    //             $replaceRoot: {
    //                 newRoot: {
    //                     temp: { $trunc: ["$points.temp", 1] },
    //                     humidity: { $trunc: ["$points.humidity", 1] },
    //                     date: { $toLong: "$points.date" },
    //                 },
    //             },
    //         },
    //         {
    //             $sort: { date: 1 },
    //         },
    //     ];
    // }
    
    const hourBinSize = daysToShow === DateRangeDays.all ? 4 : 1; // 4 hour bins for all time, 1 hour bins for anything else
    const hourBinMidpoint = hourBinSize * 60 / 2; // in minutes, used to adjust the timestamp to the middle of the bin

    return [
      {
        $match: {
          sensor,
          ...(dateLimit && { date: { $gte: dateLimit } }),
        },
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$date",
              unit: "hour",
              binSize: hourBinSize,
            },
          },
          temp: { $avg: "$temp" },
          humidity: { $avg: "$humidity" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
            temp: { $trunc: ["$temp", 1] },
            humidity: { $trunc: ["$humidity", 1] },
            date: {
                $toLong: {
                    $dateAdd: {
                        startDate: "$_id",
                        unit: "minute",
                        amount: hourBinMidpoint
                    }
                }
            }
        },
      },
    ];
}

async function getSensorData(sensor, daysToShow) {
    const pipeline = generateSensorAggregatePipeline(sensor, daysToShow)

    const aggCursor = dataPoints.aggregate(pipeline);
    
    const data = []
    for await (const doc of aggCursor) {
        if (doc.date instanceof Date) {
            console.warn('Unexpected Date object in doc.date, converting to timestamp:', doc.date);
            doc.date = doc.date.getTime();
        }
        data.push(doc);
    }
    return data
}

export async function getData(daysToShow) {
    console.log('getdata api called')
    const start = new Date().getTime()
    const data = [];
    const safeDaysToShow = normalizeDaysToShow(daysToShow);
    if (isConnected()) {

    let [sensor1Data, sensor2Data, sensor3Data, sensor4Data] = await Promise.all([getSensorData('1', safeDaysToShow), getSensorData('2', safeDaysToShow), getSensorData('3', safeDaysToShow), getSensorData('4', safeDaysToShow)]);

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

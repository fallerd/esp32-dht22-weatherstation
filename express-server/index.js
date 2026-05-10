import { update, updateDistance, getData, getDistance, connectDB } from './db.js'
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const port = 3069;
const app = express();

// parse application/json
app.use(bodyParser.json());
// allow cors only from localhost:3000 for local react app development
app.use(cors({
  origin: function(origin, callback){
    if (origin) {
      console.log('cors',origin)
    }
   
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(origin === 'http://localhost:3000') {
      return callback(null, true)
    } else {
      return callback(new Error('Not allowed by CORS'))
    }
  }
}));
app.use(express.static('../react-client/build'));

app.get('/data/', (req, res) => {
  console.log('request received', req.body);
  const daysToShow = req.query.days;
  console.log("showing days",daysToShow)

  getData(daysToShow).then(data => {
    console.log('Data loaded:', data.length > 0)
    res.json({ message: "Hello from Express!", data });
  }).catch(err => {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  });
});
app.get('/distance/', (req, res) => {
  console.log('distance request received', req.body);

  getDistance().then(data => {
    console.log('Distance loaded:', data)
    res.json({ message: "Hello from Express!", data });
  }).catch(err => {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  });
});

app.post("/addData/", function (req, res) {
  console.log('request received', req.body);
  const tempC = req.body.temp;
  const tempF = ((tempC * 9/5) + 32).toFixed(1);
  console.log(`Sensor ${req.body.sensor}:  ${tempF}°F`);

  update({
    sensor: req.body.sensor,
    temp: parseFloat(tempF),
    humidity: req.body.humidity,
    date: new Date()
  })

  res.send("success");
});

app.post("/postDistance/", function (req, res) {
  console.log('request received', req.body);
  const distance = req.body.distance;
  console.log(`Distance ${distance}"`);

  updateDistance({
    date: new Date(),
    distance
  })

  res.send("success");
});


async function startServer() {
  try {
      console.log("Connecting to DB...");
      await connectDB();
      
      app.listen(port, () => {
          console.log(`App listening on port ${port}!`);
      });
  } catch (err) {
      console.error("Server failed to start due to DB error. Exiting...");
      process.exit(1); // Exit with failure so the OS restarts the service
  }
}

startServer();
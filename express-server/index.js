import { update, updateDistance, getData, getDistance } from './db.js'
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const port = 3000;
const app = express();

// parse application/json
app.use(bodyParser.json());
// allow cors only from localhost:3000 for local react app development
app.use(cors({
  origin: function(origin, callback){
    console.log('cors',origin)
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
  })
});
app.get('/distance/', (req, res) => {
  console.log('distance request received', req.body);

  getDistance().then(data => {
    console.log('Distance loaded:', data)
    res.json({ message: "Hello from Express!", data });
  })
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

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});

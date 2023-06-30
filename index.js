import { update, initializeDB } from './db.js'
import express from 'express';
import bodyParser from 'body-parser';

initializeDB();

const port = 3000;
const app = express();

// parse application/json
app.use(bodyParser.json());

app.get("/", function (req, res) {
  console.log('request recieved', req.body);
  res.send("Hello World!");
});

app.post("/addData/", function (req, res) {
//   console.log('request received', req.body);
  const tempC = req.body.temp;
  const tempF = ((tempC * 9/5) + 32).toFixed(1);
  console.log(`Sensor ${req.body.sensor}:  ${tempF}°F`);

  update({
    sensor: req.body.sensor,
    temp: parseFloat(tempF),
    humidity: req.body.humidity,
    date: Date.now() 
  })

  res.send("success");
});

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});

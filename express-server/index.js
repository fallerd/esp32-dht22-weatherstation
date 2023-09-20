import { update, getData } from './db.js'
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const port = 3000;
const app = express();

// parse application/json
app.use(bodyParser.json());
app.use(express.static('../react-client/build'));

app.get('/data/', (req, res) => {
  console.log('request received', req.body);

  getData().then(data => {
    console.log('Data loaded:', data.length > 0)
    res.json({ message: "Hello from Express!", data });
  })
});

// // let the react app to handle any unknown routes 
// // serve up the index.html if express doesn't recognize the route
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'react-client', 'build', 'index.html')); // FAILING DUE TO PATHS
// });

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

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});

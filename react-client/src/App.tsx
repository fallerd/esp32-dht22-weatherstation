import './App.scss';
import React from "react";
import Chart from './Chart';
import Current from './Current';

enum DateRanges {
  days1 = "days1",
  days3 = "days3",
  days7 = "days7",
  days30 = "days30",
  daysAll = "daysAll"
}

const DateRangeMap = {
  [DateRanges.days1]: 1,
  [DateRanges.days3]: 3,
  [DateRanges.days7]: 7,
  [DateRanges.days30]: 30,
}

type DataPoint = {
  temp: number,
  humidity: number,
  date: number
}

type Sensor = {
  sensor: number,
  data: DataPoint[]
}

function App() {
  const [rawData, setRawData] = React.useState(null);
  const [data, setData] = React.useState<Sensor[] | null>(null);
  const [dateRange, setDateRange] = React.useState(DateRanges.daysAll);

  console.log("app", data)

  React.useEffect(() => {
    fetch("/data")
      .then((res) => res.json())
      .then((data) => {
        // TODO: don't do data manipulation based on data pulls, requires re-reading DB every time, not efficient, pull data elsewhere once instead
        switch (dateRange) {
          case DateRanges.daysAll: 
            setData(data.data);
            break;
          default:
            const filteredData: Sensor[] = [];
            for (const sensor of data.data) {
              const sensorFiltered: Sensor = {
                sensor: sensor.sensor,
                data: []
              }
              const daysAgo = DateRangeMap[dateRange];
              const dateOffset = (24*60*60*1000) * daysAgo;
              const now = new Date();
              const filterMillis = now.getTime() - dateOffset;
              for (data of sensor.data) {
                if (data.date > filterMillis) {
                  sensorFiltered.data.push(data);
                } 
              }
              filteredData.push(sensorFiltered);
            }
            setData(filteredData);
        }
        setRawData(data.data)
      });
  }, [dateRange]);

  const updateRange = (event) => {
    console.log('updaterange', event.target.value)
    setDateRange(event.target.value);
  }

  return (
    <div className="App">
      {!data ?
        <p>Loading...</p> :
        <div className='graphColumn'>
          <Current originalData={data}/>
          <div className='title'>
            <label>Filter Graph Data:</label>
            <select
              id="dateRangeSelector"
              onChange={updateRange}
            >
              <option value={DateRanges.days1}>1 day</option>
              <option value={DateRanges.days3}>3 days</option>
              <option value={DateRanges.days7}>7 days</option>
              <option value={DateRanges.days30}>30 days</option>
              <option value={DateRanges.daysAll} selected>All</option>
            </select>
          </div>
          <span className='title'>Temperature</span>
          <Chart originalData={data} type="temp"/>
          <span className='title'>Humidity</span>
          <Chart originalData={data} type="humidity"/>
        </div>
      }
    </div>
  );
}

export default App;

import React from "react";
import Chart from './Chart.js';
import Current from './Current.js';
import Peak from './Peak.js';
import "./MainLayout.scss"
import CurrentHighLowSelector from "./CurrentHighLowSelector.js";

type Sensor = {
    sensor: number,
    data: DataPoint[]
}

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
  
function MainLayout({ rawData } : { rawData: Sensor[] }) {
    const filteredData: Sensor[] = []; 
    
    const [dateRange, setDateRange] = React.useState(DateRanges.days7);

    const updateRange = (event: any) => {
        setDateRange(event.target.value);
    }

    switch (dateRange) {
    case DateRanges.daysAll: 
        filteredData.push(...rawData)
        break;
    default:
        for (const sensor of rawData) {
            const sensorFiltered: Sensor = {
                sensor: sensor.sensor,
                data: []
            }
            const daysAgo = DateRangeMap[dateRange];
            const dateOffset = (24*60*60*1000) * daysAgo;
            const now = new Date();
            const filterMillis = now.getTime() - dateOffset;
            for (const data of sensor.data) {
                if (data.date > filterMillis) {
                sensorFiltered.data.push(data);
                } 
            }
            filteredData.push(sensorFiltered);
        }
    }

    return (
        <div className='graphColumn'>
          <CurrentHighLowSelector data={filteredData}/>
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
          <Chart originalData={filteredData} type="temp"/>
          <span className='title'>Humidity</span>
          <Chart originalData={filteredData} type="humidity"/>
        </div>
    );
}

export default MainLayout;

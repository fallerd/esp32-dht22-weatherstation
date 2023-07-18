import React, { useState } from "react";
import Chart from './Chart.js';
import "./MainLayout.scss"
import Selector from "./Selector.js";
import SensorsRow from "./SensorsRow.js";
import { EnabledSensors, SensorNames } from "./SensorNames.js";
import MultiSelector from "./MultiSelector.js";

type Sensor = {
    sensor: number,
    data: DataPoint[]
}

enum DisplayModes {
    current = "Current",
    high = "High",
    low = "Low",
}

export enum DateRanges {
    days1 = "1 Day",
    days3 = "3 Days",
    days7 = "7 Days",
    days30 = "30 Days",
    daysAll = "All"
}

export const DateRangeMap = {
    [DateRanges.days1]: 1,
    [DateRanges.days3]: 3,
    [DateRanges.days7]: 7,
    [DateRanges.days30]: 30,
    [DateRanges.daysAll]: Infinity
}

type DataPoint = {
    temp: number,
    humidity: number,
    date: number
}
  
function MainLayout({ rawData } : { rawData: Sensor[] }) {
    const [dateRange, setDateRange] = useState(DateRanges.days7);
    const [displayMode, setDisplayMode] = useState(DisplayModes.current);
    const [enabledSensors, setEnabledSensors] = useState<{[key: string]: Boolean}>(EnabledSensors);

    const toggleSensor = (sensor: string) => {
        let enabledSensorCount = 0;
        for (const sensorCheck of Object.keys(enabledSensors)) {
            if (enabledSensors[sensorCheck]) {
                enabledSensorCount++
            }
        }
        if (enabledSensorCount === 1 && enabledSensors[sensor]) {
            // prevent toggling off of final enabled sensor
            return
        }
        const enabledSensorsTemp = JSON.parse(JSON.stringify(enabledSensors))
        enabledSensorsTemp[sensor] = !enabledSensorsTemp[sensor]
        setEnabledSensors(enabledSensorsTemp)
    }

    const daysAgo = DateRangeMap[dateRange];

    const filteredData: Sensor[] = []; 
    switch (dateRange) {
    case DateRanges.daysAll: 
        filteredData.push(...rawData)
        break;
    default:
        for (const sensor of rawData) {
            if (enabledSensors[sensor.sensor]) {
                const sensorFiltered: Sensor = {
                    sensor: sensor.sensor,
                    data: []
                }
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
    }

    return (
        <div className='graphColumn'>
            <Selector values={DateRanges} currentValue={dateRange} setValue={setDateRange}/>
            <Selector values={DisplayModes} currentValue={displayMode} setValue={setDisplayMode}/>
            <SensorsRow originalData={filteredData} displayMode={displayMode} daysAgo={daysAgo}/>
            <MultiSelector values={SensorNames} currentValue={enabledSensors} toggleValue={toggleSensor}/>
            <span className='title'>Temperature</span>
            <Chart originalData={filteredData} type="temp"/>
            <span className='title'>Humidity</span>
            <Chart originalData={filteredData} type="humidity"/>
        </div>
    );
}

export default MainLayout;

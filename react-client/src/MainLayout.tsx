import React, { useEffect, useState } from "react";
import Chart from './Chart.js';
import "./MainLayout.scss"
import Selector from "./Selector.js";
import SensorsRow from "./SensorsRow.js";
import { DefaultEnabledSensors, SensorNames } from "./SensorNames.js";
import MultiSelector from "./MultiSelector.js";
import { TiRefresh } from "react-icons/ti";

type Sensor = {
    sensor: number,
    data: DataPoint[]
}

enum DisplayModes {
    current = "Current",
    high = "High",
    low = "Low",
    avg = "Avg"
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
    [DateRanges.daysAll]: -1
}

const getDateRange = (days: number) => {
    for (const key of Object.keys(DateRangeMap)) {
        if (DateRangeMap[key as DateRanges] === days) {
            return key;
        }
    }
    return DateRanges.days7;
}

type DataPoint = {
    temp: number,
    humidity: number,
    date: number
}

type EnabledSensors = {[key: string]: Boolean}

const filterDataByDateRange = (rawData: Sensor[], daysAgo: number, enabledSensors: EnabledSensors) => {
    const filteredData: Sensor[] = []; 
    if (daysAgo === DateRangeMap[DateRanges.daysAll]) {
        for (const sensor of rawData) {
            if (enabledSensors[sensor.sensor]) {
                filteredData.push(sensor);
            }
        }
    } else {
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

    return filteredData;
}
interface MainLayoutProps {
  rawData: Sensor[];
  setDays: Function;
  refreshData: (event: any) => void;
  days: number;
  loading: boolean;
}

function MainLayout({ rawData, days, setDays, loading, refreshData }: MainLayoutProps) {
    const [displayMode, setDisplayMode] = useState(DisplayModes.current);
    const [enabledSensors, setEnabledSensors] = useState<EnabledSensors>(DefaultEnabledSensors);

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

    const filteredData = filterDataByDateRange(rawData, days, enabledSensors); 

    const dateRange = getDateRange(days);
    const setDateRange = (dateRange: DateRanges) => {
        setDays(DateRangeMap[dateRange]);
    }

    return (
        <div className='graphColumn'>
            <Selector values={DateRanges} currentValue={dateRange} setValue={setDateRange} loading={loading}/>
            <div className="refresh-row" onClick={refreshData}><TiRefresh className="refresh-icon" />Refresh Data</div>
            <div className={loading ? 'loading graphColumn' : 'graphColumn'}>
                <Selector values={DisplayModes} currentValue={displayMode} setValue={setDisplayMode}/>
                <SensorsRow originalData={filteredData} displayMode={displayMode} daysAgo={days}/>
                <MultiSelector values={SensorNames} currentValue={enabledSensors} toggleValue={toggleSensor}/>
                <span className='title'>Temperature</span>
                <Chart originalData={filteredData} type="temp"/>
                <span className='title'>Humidity</span>
                <Chart originalData={filteredData} type="humidity"/>
            </div>
        </div>
    );
}

export default MainLayout;

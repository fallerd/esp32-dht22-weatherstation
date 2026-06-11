import React, { useState } from "react";
import Chart from './Chart.js';
import "./MainLayout.scss"
import Selector from "./Selector.js";
import SensorsRow from "./SensorsRow.js";
import { DefaultEnabledSensors, NamesToSensors, SensorNames } from "./SensorNames.js";
import MultiSelector from "./MultiSelector.js";
import { TiRefresh } from "react-icons/ti";

type Sensor = {
    sensor: string,
    data: DataPoint[]
}

enum DisplayModes {
    current = "Current",
    high = "High",
    low = "Low",
    avg = "Avg"
}

enum StandardDerivativeModes {
    standard = "Standard",
    derivative = "Derivative",
}

export enum DateRanges {
    hours12 = "12 Hrs",
    days1 = "1 Day",
    days3 = "3 Days",
    days7 = "7 Days",
    days30 = "30 Days",
    daysAll = "All"
}

export const DateRangeMap = {
    [DateRanges.hours12]: .5,
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
    return DateRanges.days3;
}

type DataPoint = {
    temp: number,
    humidity: number,
    date: number
}

type EnabledSensors = { [key: string]: Boolean }

const getLastDataPoint = (data?: DataPoint[]): DataPoint | null => {
    if (!data || data.length === 0) return null;
    return data[data.length - 1] ?? null;
}

function computeDerivative(data: DataPoint[]): DataPoint[] {
    const derived: DataPoint[] = [];
    const clamp = (value: number, min: number, max: number): number =>
        Math.max(min, Math.min(max, value));

    for (let i = 1; i < data.length; i++) {
        const dt = (data[i].date - data[i - 1].date) / 1000; // convert ms to seconds
        if (dt === 0) continue;

        let dTemp = (data[i].temp - data[i - 1].temp) / dt;
        let dHumidity = (data[i].humidity - data[i - 1].humidity) / dt;

        // Clamp to ±0.006 to tone down buggy peaks
        dTemp = clamp(dTemp, -0.006, 0.006);
        dHumidity = clamp(dHumidity, -0.006, 0.006);

        derived.push({
            date: (data[i].date + data[i - 1].date) / 2,
            temp: Math.trunc(dTemp * 1e6) / 1e6,
            humidity: Math.trunc(dHumidity * 1e6) / 1e6
        });
    }

    return derived;
}

const filterDataByDateRange = (
    rawData: Sensor[],
    daysAgo: number,
    enabledSensors: EnabledSensors,
    includeDerivative: boolean = false
): Sensor[] => {
    const filteredData: Sensor[] = [];
    const dateOffset = (24 * 60 * 60 * 1000) * daysAgo;
    const now = new Date();
    const filterMillis = now.getTime() - dateOffset;

    for (const sensor of rawData) {
        if (!enabledSensors[sensor.sensor]) continue;

        const dataToFilter = daysAgo === DateRangeMap[DateRanges.daysAll]
            ? sensor.data
            : sensor.data.filter(d => d.date > filterMillis);

        const data = includeDerivative ? computeDerivative(dataToFilter) : dataToFilter;

        filteredData.push({
            sensor: sensor.sensor,
            data
        });
    }

    return filteredData;
};

interface MainLayoutProps {
    rawData: Sensor[];
    setDays: Function;
    refreshData: (event: any) => void;
    days: number;
    loading: boolean;
}

function MainLayout({ rawData, days, setDays, loading, refreshData }: MainLayoutProps) {
    const [displayMode, setDisplayMode] = useState(DisplayModes.current);
    const [standardDerivativeMode, setStandardDerivativeMode] = useState(StandardDerivativeModes.standard);
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

    const filteredData = filterDataByDateRange(rawData, days, enabledSensors, standardDerivativeMode === StandardDerivativeModes.derivative);

    const dateRange = getDateRange(days);
    const setDateRange = (dateRange: DateRanges) => {
        setDays(DateRangeMap[dateRange]);
    }

    function getTemperatureColor(differential: number): string {
        const clampValue = 15 // Clamp between -15 and 15
        const clampedDiff = Math.max(-clampValue, Math.min(clampValue, differential));
        const ratio = clampedDiff / clampValue; // Normalize to [-1, 1]
    
        let red = 255;
        let green = 255;
        let blue = 255;
    
        if (ratio > 0) {
            // Warmer: from white to red
            blue = green = Math.round(255 * (1 - ratio)); // Remove green & blue as it gets hotter
        } else if (ratio < 0) {
            // Colder: from white to blue (keep a little greener so not as harsh blue)
            const fade = Math.round(255 * (1 + ratio));
            red = fade;
            green = Math.round(128 + (255 - 128) * ((ratio + 1) / 1));
        }
    
        return `rgb(${red}, ${green}, ${blue})`;
    }

    const differential = (() => {
        const outsideTempData = filteredData.find((sensor) => sensor.sensor === NamesToSensors.Outside)?.data
        const insideTempData = filteredData.find((sensor) => sensor.sensor === NamesToSensors.Office)?.data
        const outsideLastPoint = getLastDataPoint(outsideTempData);
        const insideLastPoint = getLastDataPoint(insideTempData);
        if (!outsideLastPoint || !insideLastPoint) return null;
        return outsideLastPoint.temp - insideLastPoint.temp;
    })();

    const diffColor = differential !== null ? getTemperatureColor(differential) : '#ccc';

    const differentialData = (() => {
        try {
            const outsideTempData = filteredData.find((sensor) => sensor.sensor === NamesToSensors.Outside)?.data
            const insideTempData = filteredData.find((sensor) => sensor.sensor === NamesToSensors.Office)?.data
            if (!outsideTempData || !insideTempData || outsideTempData.length === 0 || insideTempData.length === 0) return null;
            const diffData: any[] = [];
            const count = Math.min(outsideTempData.length, insideTempData.length);
            for (let i = 0; i < count; i++) {
                const outData = outsideTempData[i];
                const inData = insideTempData[i];
                if (!outData || !inData) continue;
                diffData.push({
                    "differential": parseFloat((outData.temp - inData.temp).toFixed(1)),
                    "date": outData.date
                })
            }
            if (diffData.length === 0) return null;
            const formattedData= [
                {
                "sensor": "1",
                "data": diffData
                }
            ]
            return formattedData;
        } catch (e) {
            console.log('differentialdata error:', e)
            return null
        }
    })();

    return (
        <div className='graphColumn'>
            <Selector values={DateRanges} currentValue={dateRange} setValue={setDateRange} loading={loading} />
            <div className="refresh-row" onClick={refreshData}><TiRefresh className="refresh-icon" />Refresh Data</div>
            <div className={loading ? 'loading graphColumn' : 'graphColumn'}>
                <Selector values={DisplayModes} currentValue={displayMode} setValue={setDisplayMode} />
                <SensorsRow originalData={filteredData} displayMode={displayMode} daysAgo={days} />
                <MultiSelector values={SensorNames} currentValue={enabledSensors} toggleValue={toggleSensor} />
                <Selector values={StandardDerivativeModes} currentValue={standardDerivativeMode} setValue={setStandardDerivativeMode} />
                <span style={{ color: diffColor, fontSize: "16px", marginTop:"20px" }}>
                    Outside Temp Differential: {differential?.toFixed(1)}°F
                </span>
                <span className='title'>Temperature</span>
                <Chart originalData={filteredData} type="temp" />
                <span className='title'>Humidity</span>
                <Chart originalData={filteredData} type="humidity" />
                { differentialData &&
                <>
                    <span className='title'>In/Out Differential</span>
                    <Chart originalData={differentialData} type="differential" />
                </>}

            </div>
        </div>
    );
}

export default MainLayout;

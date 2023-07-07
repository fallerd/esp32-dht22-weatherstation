import React from "react";
import { Sensors } from "./Sensors";
import "./Current.scss"

function Current({ originalData }) {
    const currents = []
    for (const sensor of originalData) {
        currents.push({
            sensor: Sensors[sensor.sensor],
            temp: sensor.data[sensor.data.length-1].temp,
            humidity: sensor.data[sensor.data.length-1].humidity,
            date: sensor.data[sensor.data.length-1].date
        })
    }

    const CurrentTemps = () => {
        return currents.map((data) => <div className="sensorCurrent">
                <span>{data.sensor}</span>
                <span>Temp: {data.temp}</span>
                <span>Humidity: {data.humidity}</span>
                <span>Last Update: {new Date(data.date).toLocaleString()}</span>
            </div>
        )
    }

    return (
        <div className="currentContainer">
            <span>Current:</span>
            <div className="currentRow">
                <CurrentTemps/>
            </div>
        </div>
    );
}

export default Current;

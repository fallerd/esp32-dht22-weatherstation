import React from "react";
import { Sensors } from "./Sensors";
import "./Current.scss"

function Current({ originalData }) {
    const currents = []
    for (const sensor of originalData) {
        currents.push({
            sensor: Sensors[sensor.sensor],
            temp: sensor.data[sensor.data.length-1].temp,
            humidity: sensor.data[sensor.data.length-1].humidity
        })
    }

    const CurrentTemps = () => {
        return currents.map((data) => 
            <div className="sensorCurrent">
                <span>{data.sensor}</span>
                <span>Temp: {data.temp}</span>
                <span>Humidity: {data.humidity}</span>
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

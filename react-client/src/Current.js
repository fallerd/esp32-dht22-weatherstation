import React from "react";
import { Sensors } from "./Sensors";

function Current({ dataString }) {
    const originalData = JSON.parse(dataString);
    const currents = []
    for (const sensor of originalData) {
        console.log('butt')
        currents.push({
            sensor: Sensors[sensor.sensor],
            temp: sensor.data[sensor.data.length-1].temp,
            humidity: sensor.data[sensor.data.length-1].humidity
        })
    }

    const CurrentTemps = () => {
        return currents.map((data) => 
            <div className="sensorCurrent">
                <span>Sensor: {data.sensor}</span>
                <span>Temp: {data.temp}</span>
                <span>Humidity: {data.humidity}</span>
            </div>
        )
    }

    return (
        <div className="currentContainer">
            <span>Current:</span>
            <CurrentTemps/>
        </div>
    );
}

export default Current;

import React from "react";
import { Sensors } from "./Sensors";
import Sensor from "./Sensor";
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

    const CurrentTemps = () => currents.map((data) => <Sensor data={data}/>)

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

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
        return currents.map((data) => {
            const d = new Date(data.date)
            const datestring = d.getHours() + ":" + d.getMinutes() + ' ' + (d.getMonth()+1) + "/" + d.getDate();

            return <div className="sensorCurrent" key={data.sensor}>
                <span className="location">{data.sensor}</span>
                <span>{data.temp}°F</span>
                <span>{data.humidity}%</span>
                <span className="lastUpdate">{datestring}</span>
            </div>
            }
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

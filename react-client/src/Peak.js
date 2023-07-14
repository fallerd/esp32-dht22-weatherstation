import React, { useState } from "react";
import { Sensors } from "./Sensors";
import Sensor from "./Sensor";
import "./Peak.scss"

function Peak({ originalData }) {
    const [highLow, setHighLow] = useState(true)

    const peaks = []
    const now = Date.now()
    for (const sensor of originalData) {
        const peak = {
            sensor: Sensors[sensor.sensor],
            temp: highLow ? -Infinity : Infinity,
            humidity: highLow ? -Infinity : Infinity,
            date: sensor.data[sensor.data.length-1].date
        }
        for (let i = sensor.data.length - 1; i > -1; i--) {
            const data = sensor.data[i];
            if (highLow) {
                if (data.temp > peak.temp) {
                    peak.temp = data.temp
                    peak.humidity = data.humidity
                    peak.date = data.date
                }
            } else {
                if (data.temp < peak.temp) {
                    peak.temp = data.temp
                    peak.humidity = data.humidity
                    peak.date = data.date
                }
            }

            if (data.date < now - 86400000) { // last 24 hours
                break;
            }
        }

        peaks.push(peak)
    }

    const PeakTemps = () => peaks.map((data) => <Sensor data={data}/>)

    const toggleHighLow = () => {
        console.log(highLow)
        setHighLow(!highLow);
    }

    return (
        <div className="currentContainer">
            <span onClick={toggleHighLow}>24h High/Low:</span>
            <div className="currentRow">
                <PeakTemps/>
            </div>
        </div>
    );
}

export default Peak;

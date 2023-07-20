import React from "react";
import { SensorNames } from "./SensorNames";
import Sensor from "./Sensor";
import "./SensorsRow.scss"

function SensorsRow({ originalData, displayMode, daysAgo }) {
    const sensors = []
    const now = Date.now()
    if (displayMode === 'Current') {
        for (const sensor of originalData) {
            sensors.push({
                sensor: SensorNames[sensor.sensor],
                temp: sensor.data[sensor.data.length-1].temp,
                humidity: sensor.data[sensor.data.length-1].humidity,
                date: sensor.data[sensor.data.length-1].date
            })
        }
    } else if (displayMode === "Avg") {
        for (const sensor of originalData) {
            const peak = {
                sensor: SensorNames[sensor.sensor],
                temp: 0,
                humidity: 0,
                date: Date.now()
            }
            var totalTemp = 0;
            var totalHum = 0;
            var count = 0;

            for (const data of sensor.data) {
                totalTemp += data.temp;
                totalHum += data.humidity;
                count++;

                if (data.date < now - (24 * 60 * 60 * 1000 * daysAgo)) {
                    break;
                }
            }

            peak.temp = (totalTemp/count).toFixed(2)
            peak.humidity = (totalHum/count).toFixed(2)
    
            sensors.push(peak)
        }
    } else {
        for (const sensor of originalData) {
            const peak = {
                sensor: SensorNames[sensor.sensor],
                temp: displayMode === 'High' ? -Infinity : Infinity,
                humidity: displayMode === 'High' ? -Infinity : Infinity,
                date: sensor.data[sensor.data.length-1].date
            }
            for (let i = sensor.data.length - 1; i > -1; i--) {
                const data = sensor.data[i];
                if (displayMode === 'High') {
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
    
                if (data.date < now - (24 * 60 * 60 * 1000 * daysAgo)) {
                    break;
                }
            }
    
            sensors.push(peak)
        }
    }

    return <div className="sensorRow">
        {sensors.map((data) => <Sensor data={data}/>)}
    </div>
}

export default SensorsRow;

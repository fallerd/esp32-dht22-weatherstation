import React from "react";
import "./Sensor.scss"

function Sensor({ data }) {
    const d = new Date(data.date)
    const datestring = d.getHours() + ":" + d.getMinutes().toString().padStart(2, '0') + ' ' + (d.getMonth()+1) + "/" + d.getDate();

    return <div className="sensorSingle" key={data.sensor}>
        <span className="location">{data.sensor}</span>
        <span>{data.temp}°F</span>
        <span>{data.humidity}%</span>
        <span className="lastUpdate">{datestring}</span>
    </div>
}

export default Sensor;

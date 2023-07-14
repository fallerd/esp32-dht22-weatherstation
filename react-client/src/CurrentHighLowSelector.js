import React, { useState } from "react";
import "./CurrentHighLowSelector.scss"
import Peak from "./Peak";
import Current from "./Current";

function CurrentHighLowSelector({ data }) {
    const [which, setWhich] = useState('current')
    console.log(which)

    const WhichWidget = () => {
        switch (which) {
            case 'current':
                return <Current originalData={data}/>
            default: //case 'high'Low':
                return <Peak originalData={data} which={which}/>
        }
    }

    const setLow = () => setWhich('low')
    const setHigh = () => setWhich('high')
    const setCurrent= () => setWhich('current')

    return (
        <div className="currentHighLowSelector">
            <div className="selectorRow">
                <span className={which === 'current' ? 'selected' : ''} onClick={setCurrent}>Current</span>
                <span className={which === 'high' ? 'selected' : ''} onClick={setHigh}>High</span>
                <span className={which === 'low' ? 'selected' : ''} onClick={setLow}>Low</span>
            </div>
            <div className="sensorRow">
                <WhichWidget/>
            </div>
        </div>
    );
}

export default CurrentHighLowSelector;

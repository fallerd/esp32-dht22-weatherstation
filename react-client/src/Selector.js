import React from "react";
import "./Selector.scss"

function Selector({ values, currentValue, setValue }) {
    const setValueFromEvent = (event) => {
        if (event.target.value) {
            setValue(event.target.value)
        }
    }

    return (
        <div className="selectorRow">
            {Object.keys(values).map((key) => 
                <button className={values[key] === currentValue ? 'selected' : ''} value={values[key]} onClick={setValueFromEvent}>{values[key]}</button>
            )}
        </div>
    );
}

export default Selector;

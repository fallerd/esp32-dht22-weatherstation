import React from "react";
import "./Selector.scss"

function Selector({ values, currentValue, setValue, loading = false }) {
    const setValueFromEvent = (event) => {
        if (event.target.value) {
            setValue(event.target.value)
        }
    }

    return (
        <div className="selectorRow">
            {Object.keys(values).map((key) => 
                <button className={values[key] === currentValue ? 'selected' : ''} value={values[key]} onClick={setValueFromEvent} disabled={loading}>{values[key]}</button>
            )}
        </div>
    );
}

export default Selector;

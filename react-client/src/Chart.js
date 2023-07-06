import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import './Chart.scss';
import { Sensors } from "./Sensors";

function Chart({ originalData, type }) {
  const ref = useRef();

  useEffect(() => {
    const formattedData = [];
    for (const sensor of originalData) {
      for (const data of sensor.data) {
        const {temp, humidity, date} = data
        formattedData.push({
          sensor: Sensors[sensor.sensor],
          temp,
          humidity,
          date
        })
      }
    }

    const dataNest = Array.from(
	    d3.group(formattedData, d => d.sensor), ([key, value]) => ({key, value})
	  );

    // Declare the chart dimensions and margins.
    const width = 928;
    const height = 500;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 100;
  
    // Declare the x (horizontal position) scale.
    const x = d3.scaleTime(d3.extent(formattedData, d => d.date), [marginLeft, width - marginRight]);
  
    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear(d3.extent(formattedData, d => d[type]), [height - marginBottom, marginTop]);

    // Declare the line generator.
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d[type]));
  
    // Remove content from last draw
    d3.select(ref.current).selectAll("*").remove();

    // Create the SVG container.
    const svg = d3.select(ref.current).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    // Add the x-axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));
  
    // Add the y-axis, remove the domain line, add grid lines.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // add lines
    dataNest.forEach(function(d,i) { 
      svg.append("path")
          .style("fill", "none")
          .style("stroke", function() { // Add the colours dynamically
              return d.color = color(d.key); })
          .attr("d", line(d.value));

      // // Add the Legend
      svg.append("text")
          .attr("x", 0)  // space legend
          .attr("y", 100 + (i * 20))
          .attr("class", "legend")    // style the legend
          .style("fill", function() { // Add the colours dynamically
              return d.color = color(d.key); })
          .text(d.key); 
    });
}, [originalData]);

  return (
    <div ref={ref}/>
  );
}

export default Chart;

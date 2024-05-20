import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import './Chart.scss';
import { SensorColors, SensorNames } from "./SensorNames";

function Chart({ originalData, type }) {
  const ref = useRef();

  useEffect(() => {
    const formattedData = [];
    for (const sensor of originalData) {
      for (const data of sensor.data) {
        const {temp, humidity, date} = data
        formattedData.push({
          sensor: SensorNames[sensor.sensor],
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

    let legends = {};

    // add lines
    dataNest.forEach(function(d,i) { 
      svg.append("path")
        .style("fill", "none")
        .style("stroke", function() {
            return d.color = SensorColors[d.key]; })
        .attr("d", line(d.value));

      // Add the Legend
      const legend = svg.append("text")
        .attr("x", 0)  // space legend
        .attr("y", 100 + (i * 20))
        .attr("class", "legend") // style the legend
        .style("fill", function() {
            return d.color = SensorColors[d.key]; })
        .text(d.key);
    
      // Store the legend in the array
      legends[d.key] = legend;
    });

    const hoverLine = svg.append("line")
    .style("stroke", "#fff")
    .style("stroke-width", 1)
    .style("opacity", 0)  // initially hidden
    .attr("y1", marginTop)
    .attr("y2", height - marginBottom);

    const hoverText = svg.append("text")
      .attr("opacity", 0) // initially hidden
      .attr("text-anchor", "start")
      .attr("font-size", "12px")
      .attr("fill", "white")
      .attr("x", 0)
      .attr("y", 80); // position at the top of legend

    svg.on("mousemove", function(event) {
      const mouseX = d3.pointer(event)[0];
      hoverLine.attr("x1", mouseX).attr("x2", mouseX); // move the line where the mouse is

      // Calculate the corresponding data for the x position.
      const xValue = x.invert(mouseX);
      dataNest.forEach(({ key, value }) => {
        // Find the data point that's closest to the x position.
        const i = d3.bisectLeft(value.map(d => d.date), xValue);
        const d0 = value[i - 1];
        const d1 = value[i];
        // update legend text with data points
        if (d0 && d1) {
          const d = xValue - d0.date > d1.date - xValue ? d1 : d0;
          legends[key].text(`${key}: ${d[type]}`);
        } else {
          legends[key].text(`${key}`);
        }
      });

      const date = new Date(xValue);
      const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      hoverText.text(`${formattedTime}`);
    })
    .on("mouseover", function() {
      hoverLine.style("opacity", .5);
      hoverText.attr("opacity", 1);
    })
    .on("mouseout", function() {
      hoverLine.style("opacity", 0);
      hoverText.attr("opacity", 0);
    });
}, [originalData, type]);

  return (
    <div ref={ref}/>
  );
}

export default Chart;

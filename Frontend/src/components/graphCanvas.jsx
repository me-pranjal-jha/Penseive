import { useEffect, useRef } from "react";
import * as d3 from "d3";

function GraphCanvas({ nodes, edges }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!nodes?.length || !edges?.length) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");
    svg.call(
      d3.zoom().on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
    );

    // Node id se lookup map banao
    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    // Sirf valid edges lo jahan source aur target dono exist karte hain
    const validEdges = edges
      .filter((e) => nodeById.has(e.from) && nodeById.has(e.to))
      .map((e) => ({
        source: e.from,
        target: e.to,
        type: e.type,
      }));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(validEdges).id((d) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = g.append("g")
      .selectAll("line")
      .data(validEdges)
      .enter()
      .append("line")
      .attr("stroke", "#C9A86A")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6);

    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => d.label === "File" ? 14 : 8)
      .attr("fill", (d) => d.label === "File" ? "#C9A86A" : "#4FC3F7")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(
        d3.drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const label = g.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.name || d.path?.split("/").pop() || "unknown")
      .attr("font-size", 10)
      .attr("fill", "#fff")
      .attr("dx", 12)
      .attr("dy", 4);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);

      label
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y);
    });

  }, [nodes, edges]);

  return <svg ref={svgRef} style={{ background: "#0D1117" }} />;
}

export default GraphCanvas;
document.addEventListener("DOMContentLoaded", function () {
  fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  )
    .then((response) => response.json())
    .then((data) => {
      const dataset = data.data;

      const w = 900;
      const h = 520;
      const padding = 40;

      const parseTime = d3.timeParse("%Y-%m-%d");
      const formatTime = d3.timeFormat("%Y-%m-%d");

      dataset.forEach((d) => {
        d[0] = parseTime(d[0]);
        d[1] = +d[1];
      });

      function convertDateToQuarter(date) {
        const dateComponents = date.split("-");
        const year = dateComponents[0];
        const month = dateComponents[1];

        let quarter;
        if (month <= 3) {
          quarter = "Q1";
        } else if (month <= 6) {
          quarter = "Q2";
        } else if (month <= 9) {
          quarter = "Q3";
        } else {
          quarter = "Q4";
        }

        return `${quarter} ${year}`;
      }

      function convertBillionToTrillion(number) {
        const numComponents = number.toString().split(".");
        const integerPart = numComponents[0];

        if (integerPart.length > 3) {
          return `$${(number / 1000).toFixed(2)} Trillion`;
        } else {
          return `$${number} Billion`;
        }
      }

      console.log(convertBillionToTrillion(235.67));

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(dataset, (d) => d[0]))
        .range([padding, w - padding]);

      const yScale = d3
        .scaleLinear()
        .domain(d3.extent(dataset, (d) => d[1]))
        .nice()
        .range([h - padding, 0]);

      const svg = d3
        .select("#vis-holder")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      const tooltip = d3
        .select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      svg
        .append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${h - padding})`)
        .call(xAxis);

      svg
        .append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding})`)
        .call(yAxis);

      svg
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 50)
        .attr("x", -100)
        .attr("dy", "0.75em")
        .attr("transform", "rotate(-90)")
        .text("Gross Domestic Product (x $1 Billion)");

      svg
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d[0]))
        .attr("y", (d) => yScale(d[1]))
        .attr("width", (w - padding - padding) / dataset.length)
        .attr("height", (d) => h - padding - yScale(d[1]))
        .attr("fill", "rgb(40, 40, 82)")
        .attr("class", "bar")
        .attr("data-date", (d) => formatTime(d[0]))
        .attr("data-gdp", (d) => d[1])
        .on("mouseover", (e) => {
          let date = convertDateToQuarter(e.target.getAttribute("data-date"));
          let text = `${date}
            <br>
            ${convertBillionToTrillion(e.target.getAttribute("data-gdp"))}`;
          let TTwidth = parseInt(tooltip.style("width"), 10);
          let TTheight = parseInt(tooltip.style("height"), 10);
          let maxX = window.innerWidth - TTwidth;
          let x = e.pageX - 100;
          if (x > maxX) {
            x = maxX;
          }
          let y = e.pageY - TTheight - 60;
          tooltip
            .style("opacity", 1)
            .style("left", x + "px")
            .style("top", y + "px")
            .style("color", "black")
            .html(text)
            .attr("data-date", e.target.getAttribute("data-date"));
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });
    });
});

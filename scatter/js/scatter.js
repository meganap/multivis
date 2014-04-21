/* adapted from Mike Bostock's scatter plot example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock.
adapted code Copyright 2013 Meg Pirrung */
function Scatter() {
	/*global vars*/
	var data;
	var margin;
	var windowWidth;
	var width;
	var height;
	var x;
	var y;
	var xAxis;
	var yAxis;
	var svg;
	var legend;
	var rainbow = new Rainbow();
	var color;
	var groups = [];

	this.setData = function(root) {
		data = root;
		this.initScatter();
	}

	this.initScatter = function() {
		margin = {top: 20, right: 20, bottom: 30, left: 40};
		windowWidth = document.getElementById('plot').offsetWidth;
		width = windowWidth*.97 - margin.left - margin.right;
		height = 600 - margin.top - margin.bottom;

		document.getElementById('plot').innerHTML = '<div id="scatter" class="scatter"></div><div>X axis:<select id="xaxis"></select><br>Y axis:<select id="Yaxis"></select></div>'

		x = d3.scale.linear()
		.range([0, width]);

		y = d3.scale.linear()
		    .range([height, 0]);

		xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

		yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

		svg = d3.select("#scatter").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		//get all the axes
		var axes = d3.keys(data[0])
		//remove individual as an axis
		axes.splice(axes.indexOf('Individual'),1)

		data.forEach(function(sample){
			groups.push(sample.Individual)
			var temp = {}
			axes.forEach(function(d) {
				temp[d] = +sample[d]
			});
			temp.Individual = sample.Individual
		});
		groups = this.dedupe(groups)

		rainbow.setSpectrum('green','blue','red','yellow')
		rainbow.setNumberRange(0,groups.length);

		x.domain(d3.extent(data, function(d) { return d[1]; })).nice();
		y.domain(d3.extent(data, function(d) { return d[2]; })).nice();
		this.drawPlot(data)
	}

	this.drawPlot = function(plotData) {
		svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis)
		    .append("text")
		      .attr("class", "label")
		      .attr("x", width)
		      .attr("y", -6)
		      .style("text-anchor", "end")
		      .text("Axis 1");

		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("class", "label")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Axis 2")

		  svg.selectAll(".dot")
		      .data(plotData)
		    .enter().append("circle")
		      .attr("class", "dot")
		      .attr("r", 3.5)
		      .attr("cx", function(d) { return x(d[1]); })
		      .attr("cy", function(d) { return y(d[2]); })
		      .style("fill", function(d){
				  	return '#'+rainbow.colorAt(groups.indexOf(d.Individual));
				  });

		  legend = svg.selectAll(".legend")
		      .data(groups)
		    .enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		  legend.append("rect")
		      .attr("x", width - 18)
		      .attr("width", 18)
		      .attr("height", 18)
		      .style("fill", function(d){
				  	return '#'+rainbow.colorAt(groups.indexOf(d));
				  });

		  legend.append("text")
		      .attr("x", width - 24)
		      .attr("y", 9)
		      .attr("dy", ".35em")
		      .style("text-anchor", "end")
		      .text(function(d) { return d; });
	}

  	this.dedupe = function (list) {
  	   var set = {};
  	   for (var i = 0; i < list.length; i++)
  	      set[list[i]] = true;
  	   list = [];
  	   for (var v in set)
  	      list.push(v);
  	   return list;
  	}
}
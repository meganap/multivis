/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 * __adaptation__ = "adapted from Mike Bostock's scatter plot example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock."
 */
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
	var axes = []
	var groups = [];
	var xAxisSelect;
    var yAxisSelect;
	var dotHolder;

	this.setData = function(root) {
		data = root;
		this.initScatter();
	}

	this.initScatter = function() {
		margin = {top: 20, right: 20, bottom: 120, left: 40};
		windowWidth = document.getElementById('plot').offsetWidth;
		width = windowWidth*.97 - margin.left - margin.right;
		height = 600 - margin.top - margin.bottom;

		document.getElementById('plot').innerHTML = '<div id="scatter" class="scatter"></div>'
		d3.select("#visWrapper").append("div")
			.attr("id", "axisChoosers")
			.attr("class", "axisChoosers");
		document.getElementById('axisChoosers').innerHTML = '<div id=\"legendHolder\"></div><br><div>X axis:<select id=\"Xaxis\" onchange=\"javascript:s.axisChanged()\"></select><br>Y axis:<select id=\"Yaxis\" onchange=\"javascript:s.axisChanged()\"></select></div>'


		var note = d3.select("#visWrapper").append("div")
			.html("<br><b>Use the select menus above to change the displayed axes.</b>");


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

		d3.select("#legendHolder")
			.attr("width",50)
			.attr("height",50);

		//get all the axes
		axes = d3.keys(data[0])
		//remove individual as an axis
		axes.splice(axes.indexOf('Individual'),2)

		this.setSelects()

		data.forEach(function(sample){
			groups.push(sample.Individual.substring(0,11))
			axes.forEach(function(d) {
				sample[d] = +sample[d]
			});
			sample.ID = sample.Individual
			sample.colorKey = sample.ID.substring(0,11)
			sample.uniqueID = sample.colorKey+sample.ID+xAxisSelect.selectedIndex+yAxisSelect.selectedIndex
		});
		groups = this.dedupe(groups)

		//have to add extra color on the end to make this work
		rainbow.setNumberRange(0,groups.length);
		if(groups.length == 2)
			rainbow.setSpectrum('blue','red','green')
		 else
			rainbow.setSpectrum('blue','red','green', 'yellow')

		this.drawPlot(data)
	}

	this.changeColors = function(value) {
		this.setColorBy(value)
	}

	this.setColorBy = function(value) {
		// console.log(value)
		groups = []
		data.forEach(function(sample){
			if(value == 'Environment')
			{
				if(sample.SampleID.indexOf('key') != -1 || sample.SampleID.indexOf('space') != -1)
					sample.colorKey = 'Key'
				else
					sample.colorKey = 'Finger'
			}
			else
				sample.colorKey = sample.ID.substring(0,11)

			groups.push(sample.colorKey)
			sample.uniqueID = sample.colorKey+sample.ID+xAxisSelect.selectedIndex+yAxisSelect.selectedIndex
		});
		groups = this.dedupe(groups)

		//have to add extra color on the end to make this work
		rainbow.setNumberRange(0,groups.length);
		if(groups.length == 2)
			rainbow.setSpectrum('blue','red','green')
		 else
			rainbow.setSpectrum('blue','red','green', 'yellow')

		this.drawPlot(data)
	}

	this.setSelects = function() {
		xAxisSelect = document.getElementById('Xaxis')
		yAxisSelect = document.getElementById('Yaxis')
		var option = document.createElement("option")

		for(var a in axes)
		{
			option=document.createElement("option")
			option.text = 'PC ' +axes[a]
			xAxisSelect.add(option)
			option=document.createElement("option")
			option.text = 'PC ' +axes[a]
			yAxisSelect.add(option)
		}

		xAxisSelect.selectedIndex = 0
		yAxisSelect.selectedIndex = 1
	}

	this.axisChanged = function() {
		data.forEach(function(sample){
			sample.uniqueID = sample.uniqueID = sample.colorKey+sample.ID+xAxisSelect.selectedIndex+yAxisSelect.selectedIndex
		});
		this.drawPlot(data)
	}

	this.drawLegend = function() {
	  svg.selectAll(".legend").selectAll("text").remove()
  	  svg.selectAll(".legend").selectAll("rect").remove()

  	  legend = svg.selectAll(".legend")
  	      .data(groups)
		  .attr("width", 150);

  	  legend.enter().append("g")
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

	  legend.exit().remove();
	}

	this.drawPlot = function(plotData) {
		x.domain(d3.extent(plotData, function(d) { return d[xAxisSelect.selectedIndex+1]; })).nice();
		y.domain(d3.extent(plotData, function(d) { return d[yAxisSelect.selectedIndex+1]; })).nice();

		svg.select("#xaxis").remove();
		svg.select("#yaxis").remove();
		svg.selectAll(".dot").remove();

		svg.append("g")
		      .attr("class", "x axis")
			  .attr("id", "xaxis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis)
		    .append("text")
		      .attr("class", "label")
		      .attr("x", width)
		      .attr("y", -6)
		      .style("text-anchor", "end")
		      .text("PC "+(xAxisSelect.selectedIndex+1));

		  svg.append("g")
		      .attr("class", "y axis")
			  .attr("id", "yaxis")
		      .call(yAxis)
		    .append("text")
		      .attr("class", "label")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("PC "+(yAxisSelect.selectedIndex+1))

  		var dots = svg.selectAll(".dot")
  		     .data(plotData, function(d) { return d.uniqueID; });

	    dots.enter().append("circle")
	      .attr("class", "dot")
	      .attr("r", 3.5)
	      .attr("cx", function(d) { return x(d[xAxisSelect.selectedIndex+1]); })
	      .attr("cy", function(d) { return y(d[yAxisSelect.selectedIndex+1]); })
	      .style("fill", function(d){
			  	return '#'+rainbow.colorAt(groups.indexOf(d.colorKey));
			  });

		dots.exit().remove();

		this.drawLegend()
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
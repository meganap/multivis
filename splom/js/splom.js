/* adapted from Mike Bostock's scatter plot matrix example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock.
adapted code Copyright 2013 Meg Pirrung */
function Splom() {
	/*global vars*/
	var data;
	var pc;
	var rainbow = new Rainbow();
	var color;
	// Size parameters.
    var size = 140,
        padding = 10,
        n = 4;
	//position scales
	var x = {}, y = {};
	var axis;
	var brush;
	var svg;
	var cell;
	var windowWidth;
	var width;
	var height;
	var groups = [];

	this.setData = function(root) {
		data = root;
		this.initSplom();
	}

	this.initSplom = function() {
		windowWidth = document.getElementById('plot').offsetWidth;
		width = windowWidth*.97;
		height = 600;

		document.getElementById('plot').innerHTML = '<div id="splom" class="splom"></div>'

		//get all the axes
		var axes = d3.keys(data[0])
		//remove individual as an axis
		axes.splice(axes.indexOf('Individual'),1)

		var values = []
		data.forEach(function(sample){
			groups.push(sample.Individual)
			var temp = {}
			axes.forEach(function(d) {
				temp[d] = +sample[d]
			});
			temp.Individual = sample.Individual
			values.push(temp)
		});
		groups = this.dedupe(groups)

		var compData = {axes: axes, groups: groups, values: values}

		compData.values.forEach(function(sample) {
			compData.axes.forEach(function(axis){
					var value = function(d) { return d[axis]; },
					domain = [d3.min(compData.values, value), d3.max(compData.values, value)],
					range = [padding / 2, size - padding / 2];
					x[axis] = d3.scale.linear().domain(domain).range(range);
					y[axis] = d3.scale.linear().domain(domain).range(range.reverse());
			});
		});

		rainbow.setSpectrum('green','blue','red','yellow')
		rainbow.setNumberRange(0,groups.length);

		// console.log(data)
		// Axes.
		axis = d3.svg.axis()
		      .ticks(5)
		      .tickSize(size * n);

		  // Brush.
		brush = d3.svg.brush()
		      .on("brushstart", this.brushstart)
		      .on("brush", this.brush)
		      .on("brushend", this.brushend);

		  // Root panel.
		svg = d3.select("#splom").append("svg:svg")
		      .attr("width", width)
		      .attr("height", height)
		    .append("svg:g");
		      // .attr("transform", "translate(359.5,69.5)");
		  // X-axis.
		    svg.selectAll("g.x.axis")
		        .data(axes)
		      .enter().append("svg:g")
		        .attr("class", "x axis")
		        .attr("transform", function(d, i) { return "translate(" + i * size + ",0)"; })
		        .each(function(d) { d3.select(this).call(axis.scale(x[d]).orient("bottom")); });

		    // Y-axis.
		    svg.selectAll("g.y.axis")
		        .data(axes)
		      .enter().append("svg:g")
		        .attr("class", "y axis")
		        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
		        .each(function(d) { d3.select(this).call(axis.scale(y[d]).orient("right")); });

		    // Cell and plot.
		    cell = svg.selectAll("g.cell")
		        .data(this.cross(axes, axes))
		      .enter().append("svg:g")
		        .attr("class", "cell")
		        .attr("transform", function(d) { return "translate(" + d.i * size + "," + d.j * size + ")"; })
		        .each(this.plot);

		    // Titles for the diagonal.
		    cell.filter(function(d) { return d.i == d.j; }).append("svg:text")
		        .attr("x", padding)
		        .attr("y", padding)
		        .attr("dy", ".71em")
		        .text(function(d) { return d.x; });
	}

	this.plot = function(p) {
		var cell = d3.select(this);

		    // Plot frame.
		    cell.append("svg:rect")
		        .attr("class", "frame")
		        .attr("x", padding / 2)
		        .attr("y", padding / 2)
		        .attr("width", size - padding)
		        .attr("height", size - padding);

		    // Plot dots.
		    cell.selectAll("circle")
		        .data(data)
		      .enter().append("svg:circle")
		        // .attr("class", function(d) { return 'derp'; })
				.style('fill',function(d){
				  	return '#'+rainbow.colorAt(groups.indexOf(d.Individual));
				  })
		        .attr("cx", function(d) { return x[p.x](d[p.x]); })
		        .attr("cy", function(d) { return y[p.y](d[p.y]); })
		        .attr("r", 3);

		    // Plot brush.
		    // cell.call(this.brush.x(x[p.x]).y(y[p.y]));
	}

	// Clear the previously-active brush, if any.
	  this.brushstart = function(p) {
	    if (brush.data !== p) {
	      cell.call(brush.clear());
	      brush.x(x[p.x]).y(y[p.y]).data = p;
	    }
	  }

	  // Highlight the selected circles.
	  this.brush = function(p) {
	    var e = brush.extent();
	    svg.selectAll(".cell circle").attr("class", function(d) {
	      return e[0][0] <= d[p.x] && d[p.x] <= e[1][0]
	          && e[0][1] <= d[p.y] && d[p.y] <= e[1][1]
	          ? d.species : null;
	    });
	  }

	  // If the brush is empty, select all circles.
	  this.brushend = function() {
	    if (brush.empty()) svg.selectAll(".cell circle").attr("class", function(d) {
	      return d.Individual;
	    });
	  }

	  this.cross = function(a, b) {
	    var c = [], n = a.length, m = b.length, i, j;
	    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
	    return c;
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
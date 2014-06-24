/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 * __adaptation__ = "adapted from Mike Bostock's parallel coordinates example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock."
 */

function ParallelCoordinates() {
	/*global vars*/
	var data;
	var pc;
	var rainbow = new Rainbow();
	var color;
	var groups = [];

	this.setData = function(root) {
		data = root;
		this.initParallelCoordinates();
	}

	this.initParallelCoordinates = function() {
		d3.select("#plot").append("div")
		.attr("width", "730")
		.attr("height", "600")
		.attr("id","parallelPlotWrapper");

		document.getElementById('parallelPlotWrapper').innerHTML = '<div id="parallelPlot" class="parcoords" style="width:770px;height:530px"></div>'

		data.forEach(function(d){
			d.Individual = d.Individual.substring(0,11)
			groups.push(d.Individual)
		});
		groups = this.dedupe(groups)

		rainbow.setSpectrum('green','blue','red','yellow')
		rainbow.setNumberRange(0,groups.length);

		this.drawPlot()
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

	this.drawPlot = function() {
		pc = d3.parcoords()("#parallelPlot");
		pc
		  .data(data)
		  .color(function(d){
		  	return '#'+rainbow.colorAt(groups.indexOf(d.Individual));
		  })
		  .margin({ top: 50, left: 30, bottom: 40, right: 50 })
		  .ticks(5)
		  .render()
		  .brushable();
	}
}
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
		// .attr("width", "730")
		// .attr("height", "600")
		.attr("id","parallelPlotWrapper");


		data.forEach(function(d){
			d.Individual = d.Individual.substring(0,11)
			groups.push(d.Individual)
		});
		groups = this.dedupe(groups)

		//have to add extra color on the end to make this work
		rainbow.setNumberRange(0,groups.length);
		if(groups.length == 2)
			rainbow.setSpectrum('blue','red','green')
		 else
			rainbow.setSpectrum('blue','red','green', 'yellow')

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
		document.getElementById('plot').innerHTML = '<div id="parallelPlot" class="parcoords" style="width:700px;height:530px"></div>'

		pc = d3.parcoords()("#parallelPlot");
		pc
		  .data(data)
		  .color(function(d){
		  	return '#'+rainbow.colorAt(groups.indexOf(d.colorKey || d.Individual));
		  })
		  .margin({ top: 60, left: 0, bottom: 40, right: 50 })
		  .ticks(5)
		  .render()
		  .brushable();

  		svg = d3.select("#parallelPlot").append("svg")
  		  .attr("class","parallelLegend");
  		  this.drawLegend()
	}

	this.drawLegend = function() {
	  	   svg.selectAll(".legend").selectAll("text").remove()
	       svg.selectAll(".legend").selectAll("rect").remove()

		   legend = svg.selectAll(".legend")
		       .data(groups);

		   legend.enter().append("g")
		       .attr("class", "legend")
		       .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		   legend.append("rect")
		       .attr("x", 700 + 66)
		       .attr("width", 16)
		       .attr("height", 16)
		       .style("fill", function(d){
		  		  	return '#'+rainbow.colorAt(groups.indexOf(d));
		  		  });

		   legend.append("text")
		       .attr("x", 700 + 60)
		       .attr("y", 9)
		       .attr("dy", ".35em")
		       .style("text-anchor", "end")
		       .text(function(d) { return d; });

			legend.exit().remove();
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
					sample.colorKey = sample.Individual

				groups.push(sample.colorKey)
			});
			groups = this.dedupe(groups)

			//have to add extra color on the end to make this work
			rainbow.setNumberRange(0,groups.length);
			if(groups.length == 2)
				rainbow.setSpectrum('blue','red','green')
			 else
				rainbow.setSpectrum('blue','red','green', 'yellow')

			pc
			  .data(data)
			  .updateAxes()
			  .render(); //update colors

		   this.drawLegend()//update legend
		}
}
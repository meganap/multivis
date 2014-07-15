/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 * __adaptation__ = " adapted from http://www.jasondavies.com/coffee-wheel/ and
http://bl.ocks.org/kerryrodden/7090426 Copyright 2013 Google Inc. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed
to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
and Mike Bostock's sunburst example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock."
 */

function Sunburst(jsonPath) {
	var x;
	var y;

	var width = 600,
	    height = width,
	    padding = 5,
	    radius = (Math.min(width, height))/ 2;
	var arc;
	var path;
	var root;
	var rainbow1 = new Rainbow();
	var div;
	var labelDiv;
	var sunvar = this;

	// Total size of all segments; we set this later, after loading the data.
	var totalSize = 0;

	this.initSunburst = function() {
		// this.initializeBreadcrumbTrail();

		labelDiv = d3.select("#visWrapper").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

		x = d3.scale.linear().range([0, 2 * Math.PI]);
		y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]);

		var div = d3.select("#plot")

		var note = div.append("div")
			.attr("id","note")
			.html("<br><b>Hover over arcs to see branch length.</b>");

		var svg = div.append("svg")
		    .attr("width", width)
		    .attr("height", height)
		    .append("g")
		    .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

		var partition = d3.layout.partition()
		   .value(function(d) { return d.length; });

		this.arc()

		// rainbow1.setSpectrum('red','blue')

		d3.json(jsonPath, function(root) {
			 var nodes = partition.nodes(root);
			 root = root;


			 paths = svg.selectAll("path").data(nodes);

  		     path = paths.enter().append("path")
  				 .attr("id","sunburst")
			     .attr("d", arc)
			     .attr("fill-rule", "evenodd")
			 	 .attr("display", function(d) { return d.depth ? null : "none"; })
			     .style("fill", function(d) {
					 if(d.children)
					 	return "#AAA";
					 else
					 	return "#3182bd";
			     })
  				 .on("mouseover", function(d, event){
					 this.style['opacity'] = .6;
			          labelDiv.transition()
			              .duration(200)
			              .style("opacity", .9);
			          labelDiv.html(d.length)
			              .style("left", (d3.event.pageX) + "px")
			              .style("top", (d3.event.pageY - 28) + "px");
					 })
  				 .on("mouseout", function(d){
					 this.style['opacity'] = 1;
			         labelDiv.transition()
			             .duration(500)
			             .style("opacity", 0);
				 });

			     var text = svg.selectAll("text").data(nodes);
			     var textEnter = text.enter().append("text")
			         .attr("text-anchor", function(d) {
			           return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
			         })
			         .attr("dy", ".2em")
			         .attr("transform", function(d) {
			           var multiline = (d.name || "").split(" ").length > 1,
			               angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
			               rotate = angle + (multiline ? -.5 : 0);
			           return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
			         });
			     textEnter.append("tspan")
			         .attr("x", 0)
			         .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });
			     textEnter.append("tspan")
			         .attr("x", 0)
			         .attr("dy", "1em")
			         .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });

		});

	    // Add the mouseleave handler to the bounding circle
	    d3.select("#container").on("mouseleave", this.mouseleave);
		d3.select(self.frameElement).style("height", height + "px");
	}

	this.arc = function () {
		arc = d3.svg.arc()
		    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
		    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
	}

}

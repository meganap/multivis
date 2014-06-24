/* adapted from Mike Bostock's treemap example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock.
adapted code Copyright 2013 Meg Pirrung */

function Treemap(jsonPath) {
	var w = 550,
	    h = 500,
	    x = d3.scale.linear().range([0, w]),
	    y = d3.scale.linear().range([0, h]),
	    color = d3.scale.category20c(),
	    root,
	    node;
	var treemap;
	var svg;
	var root;
	var data;
	var nodes;
	var cell;
	var plotVar = this;
	var div;

	this.initTreemap = function () {
		div = d3.select("#visWrapper").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

		treemap = d3.layout.treemap()
		    .round(false)
		    .size([w, h])
		    .sticky(true)
		    .value(function(d) { return d.length; });

		svg = d3.select("#plot").append("div")
		    .attr("class", "chart")
		    .style("width", w + "px")
		    .style("height", h + "px")
		  .append("svg:svg")
		    .attr("width", w)
		    .attr("height", h)
		  .append("svg:g")
		    .attr("transform", "translate(.5,.5)");

		d3.json(jsonPath, function(data) {
		  node = root = data;

		  nodes = treemap.nodes(root)
		      .filter(function(d) { return !d.children; });

		  cell = svg.selectAll("g")
		      .data(nodes)
		    .enter().append("svg:g")
		      .attr("class", "cell")
		      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		      .on("click", function(d) { return plotVar.zoom(node == d.parent ? root : d.parent); });

		  cell.append("svg:rect")
		  	  .attr("class", "map")
		      .attr("width", function(d) { return d.dx - 1; })
		      .attr("height", function(d) { return d.dy - 1; })
		      .style("fill", function(d) { return color(d.parent.name); })
		      .on("mouseover", function(d) {
		          this.style['opacity'] = .6;
		          div.transition()
		              .duration(200)
		              .style("opacity", .9);
		          div .html(d.name)
		              .style("left", (d3.event.pageX) + "px")
		              .style("top", (d3.event.pageY - 28) + "px");
		      })
		      .on("mouseout", function(d) {
		          this.style['opacity'] = 1;
		         div.transition()
		             .duration(500)
		             .style("opacity", 0);
		      });

		  cell.append("svg:text")
		      .attr("x", function(d) { return d.dx / 2; })
		      .attr("y", function(d) { return d.dy / 2; })
		      .attr("dy", ".35em")
		      .attr("text-anchor", "middle")
		      .text(function(d) {
				  if(d.name.width() > d.dx)
				  	return d.name.slice(0,5) + '...'
				  else
				  	return d.name;
			  })
		      .style("display", function(d) {
				  // d.w = this.getComputedTextLength();
				   if(d.name.width() < d.dx)
			   		return "block"
				   else if( (d.name.slice(0,5) + '...').width() < d.dx)
					return "block"
				   else
					return "none"
				});

		  d3.select(window).on("click", function() { plotVar.zoom(root); });

		  // d3.select("select").on("change", function() {
		  //   treemap.value(this.value == "size" ? size : count).nodes(root);
		  //   zoom(node);
		  // });
		});

	}

	this.size = function(d) {
	  return d.length;
	}

	this.count = function (d) {
	  return 1;
	}

	this.zoom = function (d) {
	  var kx = w / d.dx, ky = h / d.dy;
	  x.domain([d.x, d.x + d.dx]);
	  y.domain([d.y, d.y + d.dy]);

	  var t = svg.selectAll("g.cell").transition()
	      .duration(d3.event.altKey ? 7500 : 750)
	      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

	  t.select("rect")
	      .attr("width", function(d) { return kx * d.dx - 1; })
	      .attr("height", function(d) { return ky * d.dy - 1; })

	  t.select("text")
	      .attr("x", function(d) { return kx * d.dx / 2; })
	      .attr("y", function(d) { return ky * d.dy / 2; })
	      .text(function(d) {
			  if(d.name.width() > kx * d.dx - 1)
			  	return d.name.slice(0,5) + '...'
			  else
			  	return d.name;
		  })
	      .style("display", function(d) {
			  // d.w = this.getComputedTextLength();
			   if(d.name.width() < kx * d.dx - 1)
		   		return "block"
			   else if( (d.name.slice(0,5) + '...').width() < kx * d.dx - 1)
				return "block"
			   else
				return "none"
			});

	  node = d;
	  d3.event.stopPropagation();
	}

	String.prototype.width = function(font) {
	  var f = font || '11pt helvetica',
	      o = $('<div>' + this + '</div>')
	            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
	            .appendTo($('body')),
	      w = o.width();

	  o.remove();

	  return w;
	}
}
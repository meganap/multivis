function Sunburst(jsonPath) {
	var x;
	var y;

	var width = 600,
	    height = width,
	    padding = 5,
	    radius = (Math.min(width, height) - 2 * padding)/ 2,
	    duration = 1000;
	var arc;
	var path1;
	var root1;
	var rainbow1 = new Rainbow();
	var div;
	var sunvar = this

	// Total size of all segments; we set this later, after loading the data.
	var totalSize = 0; 

	// max index of breadcrumbs
	var max_i = 0;

	// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
	var b = {
	  w: 80, h: 30, s: 3, t: 10
	};

	this.initSunburst = function() {	
		this.initializeBreadcrumbTrail();
	
		div = d3.select("visWrapper").append("div")   
		.attr("class", "tooltip")               
		.style("opacity", 0);

		x = d3.scale.linear().range([0, 2 * Math.PI]);
		y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]);

		var div1 = d3.select("#plot")
		var svg1 = div1.append("svg")
		    .attr("width", width)
		    .attr("height", height)
		    .append("g")
		    .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

		var partition = d3.layout.partition()
		   .value(function(d) { return d.length; });

		arc = d3.svg.arc()
		    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
		    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

		rainbow1.setSpectrum('red','blue')

		d3.json(jsonPath, function(root) {
			 var nodes = partition.nodes(root);
			 root1 = root;
			 rainbow1.setNumberRange(1, sunvar.getDepth(root)-1);
			 path1 = svg1.selectAll("path").data(nodes)
		     	.enter().append("path")
			     .attr("d", arc)
			     .attr("fill-rule", "evenodd")
				 .attr("display", function(d) { return d.depth ? null : "none"; })
			     .style("fill", function(d) { return rainbow1.colorAt(d.depth); })
			     .on("click", function(d) { sunvar.click(d) })
				 .on("mouseover", function(d){ sunvar.mouseover(d,svg1) });
		});
	
	    // Add the mouseleave handler to the bounding circle
	    d3.select("#container").on("mouseleave", this.mouseleave);
		d3.select(self.frameElement).style("height", height + "px");
	}

	this.setTotalSize = function () {
		// Get total size of the tree = value of root node from partition.
		totalSize = path1.node().__data__.value;
	}

	this.click = function(d) {
		if(d.parent)
		{
		  path1.transition()
		    .duration(750)
		    .attrTween("d", this.arcTween(d.parent));
		}
	}

	this.isParentOf = function (p, c) {
	  if (p === c) return true;
	  if (p.children) {
	    return p.children.some(function(d) {
	      return this.isParentOf(d, c);
	    });
	  }
	  return false;
	}

	// Interpolate the scales!
	this.arcTween = function (d) {
	  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
	      yd = d3.interpolate(y.domain(), [d.y, 1]),
	      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
	  return function(d, i) {
	    return i
	        ? function(t) { return arc(d); }
	        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return this.arc(d); };
	  };
	}

	this.getDepth = function (obj) {
	    var depth = 0;
	    if (obj.children) {
	        obj.children.forEach(function (d) {
	            var tmpDepth = sunvar.getDepth(d)
	            if (tmpDepth > depth) {
	                depth = tmpDepth
	            }
	        })
	    }
	    return 1 + depth
	}

	this.zoomOut = function () {
	    path1.transition()
	      .duration(750)
	      .attrTween("d", this.arcTween(root1));
	}

	// Fade all but the current sequence, and show it in the breadcrumb trail.
	this.mouseover = function (d, vis) {
	  if(totalSize == 0)
	  	this.setTotalSize()
	  var percentage = (100 * d.value / totalSize).toPrecision(4);
	  var percentageString = percentage + "%";
	  if (percentage < 0.01) {
	    percentageString = "< 0.01%";
	  }
  
	  d3.select("#percentage")
	      .text(percentageString);
	  // 
	  // d3.select("#explanation")
	  //     .style("visibility", "");

	  var sequenceArray = this.getAncestors(d);
	  this.updateBreadcrumbs(sequenceArray, percentageString);
	  // updateBreadcrumbs(sequenceArray);

	  // Fade all the segments.
	  d3.selectAll("path")
	      .style("opacity", 0.3);

	  // Then highlight only those that are an ancestor of the current segment.
	  vis.selectAll("path")
	      .filter(function(node) {
	                return (sequenceArray.indexOf(node) >= 0);
	              })
	      .style("opacity", 1);
	}

	// Restore everything to full opacity when moving off the visualization.
	this.mouseleave = function (d) {

	  // Hide the breadcrumb trail
	  d3.select("#trail")
	      .style("visibility", "hidden");

	  // Deactivate all segments during transition.
	  d3.selectAll("path").on("mouseover", null);

	  // Transition each segment to full opacity and then reactivate it.
	  d3.selectAll("path")
	      .transition()
	      .duration(1000)
	      .style("opacity", 1)
	      .each("end", function() {
	              d3.select(this).on("mouseover", this.mouseover);
	            });

	  d3.select("#explanation")
	      .transition()
	      .duration(1000)
	      .style("visibility", "hidden");
	}

	// Given a node in a partition layout, return an array of all of its ancestor
	// nodes, highest first, but excluding the root.
	this.getAncestors = function (node) {
	  var path = [];
	  var current = node;
	  while (current.parent) {
	    path.unshift(current);
	    current = current.parent;
	  }
	  path.unshift(current); 
	  return path;
	}

	this.initializeBreadcrumbTrail = function () {
	  // Add the svg area.
	  var trail = d3.select("#sequence").append("svg:svg")
	      .attr("width", "100%")
	      .attr("height", 50)
	      .attr("id", "trail");
	  // Add the label at the end, for the percentage.
	  trail.append("svg:text")
	    .attr("id", "endlabel")
	    .style("fill", "#000");
	}

	// Generate a string that describes the points of a breadcrumb polygon.
	this.breadcrumbPoints = function (d, i) {
		var points = [];
		if(i == max_i-1)
		{
			  width = Math.max(d.name.width() + 20, b.w)
			  // width = b.w*2
			  points.push("0,0");
			  points.push(width + ",0");
			  points.push(width + b.t + "," + (b.h / 2));
			  points.push(width + "," + b.h);
			  points.push("0," + b.h);
			  if (d.depth > 0) { // root breadcrumb; don't include 6th vertex.
			    points.push(b.t + "," + (b.h / 2));
			  }
			  return points.join(" ");
		  }
		  else
		  {
			  points.push("0,0");
			  points.push(b.w + ",0");
			  points.push(b.w + b.t + "," + (b.h / 2));
			  points.push(b.w + "," + b.h);
			  points.push("0," + b.h);
			  if (d.depth > 0) { // root breadcrumb; don't include 6th vertex.
			    points.push(b.t + "," + (b.h / 2));
			  }
			  return points.join(" ");
		  }
	}

	String.prototype.width = function(font) {
	  var f = font || '15px sans-serif',
	      o = $('<div>' + this + '</div>')
	            .css({'font-weight': 600,'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
	            .appendTo($('body')),
	      w = o.width();

	  o.remove();

	  return w;
	}

	// Update the breadcrumb trail to show the current sequence and percentage.
	this.updateBreadcrumbs = function (nodeArray, percentageString) {
	
		// set data to empty to reset widths/labels on existing breadcrums
	    var g = d3.select("#trail")
	        .selectAll("g")
	        .data([]);
		g.enter();
		g.exit().remove();
  
	  var l = nodeArray.length
	  if(l > 5)
	  	nodeArray = nodeArray.slice(l-6,l)

	  // Data join; key function combines name and depth (= position in sequence).
	  var g = d3.select("#trail")
	      .selectAll("g")
	      .data(nodeArray, function(d) { return d.name + d.depth; });


	  // Add breadcrumb and label for entering nodes.
	  var crumbs = g.enter().append("svg:g");

	  max_i = nodeArray.length
	  var finalNodeWidth = Math.max(nodeArray[nodeArray.length-1].name.width() + 20, b.w)
  
	  // console.log(max_i)
	  crumbs.append("svg:polygon")
	      .attr("points", function(d,i) {return sunvar.breadcrumbPoints(d,i)})
	      .style("fill", function(d) { return rainbow1.colorAt(d.depth); });

	  crumbs.append("svg:text")
	      .attr("x", function(d,i) {
			  if(i != max_i-1)
	      		return (b.w + b.t) / 2
			  else
			  	return finalNodeWidth / 2 + 1
	      })
	      .attr("y", b.h / 2)
	      .attr("dy", "0.35em")
	      .attr("text-anchor", "middle")
		  .on("mouseover", function(d){
			div.transition()
				.style("opacity", .9);
	      	div.html(d.name) 
	          .style("left", (d3.event.pageX) + "px")     
	          .style("top", (d3.event.pageY - 8) + "px")}
		  )
	      .on("mouseout", function(d) {
	          this.style['opacity'] = 1;
	         div.transition()            
	             .style("opacity", 0);   
	      })
		  .on("click",function(d) { sunvar.click(d) })
	      .text(function(d, i) {
			  if(d.name.length > 8 && i != max_i-1)
			  	return d.name.slice(0,5) + '...'
			  else
			  	return d.name; 
			}
			);

	  // Set position for entering and updating nodes.
	  g.attr("transform", function(d, i) {
	    return "translate(" + i * (b.w + b.s) + ", 0)";
	  });

	  // Remove exiting nodes.
	  g.exit().remove();

	  // Now move and update the percentage at the end.
	  d3.select("#trail").select("#endlabel")
	      .attr("x", (nodeArray.length-1 + .1) * (b.w + b.s) + b.s + finalNodeWidth)
	      .attr("y", b.h / 2)
	      .attr("dy", "0.35em")
	      .attr("text-anchor", "left")
	      .text("is " + percentageString + " of this sample");

	  // Make the breadcrumb trail visible, if it's hidden.
	  d3.select("#trail")
	      .style("visibility", "");

	}
}

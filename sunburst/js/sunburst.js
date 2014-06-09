/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 * __adaptation__ = "adapted from Mike Bostock's sunburst example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock."
 */

var x;
var y;

var width = 600,
    height = width,
    padding = 5,
    radius = (Math.min(width, height) - 2 * padding)/ 2,
    duration = 1000;
var arc;
var path1;
var path2;
var root1;
var rainbow1 = new Rainbow();
var rainbow2 = new Rainbow();
var div;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

function initSunburst() {

	div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

	x = d3.scale.linear().range([0, 2 * Math.PI]);
	y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]);

	var div1 = d3.select("#plot1")
	var svg1 = div1.append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .append("g")
	    .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

	var div2 = d3.select("#plot2");
	var svg2 = div2.append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .append("g")
	    .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

	var partition = d3.layout.partition()
	//    .sort(null)
	   .value(function(d) { return d.length; });

	arc = d3.svg.arc()
	    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
	    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
	    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
	    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

	d3.json("data/test.json", function(root) {
	 var nodes = partition.nodes(root);
	 root1 = root;
	 rainbow1.setNumberRange(0, getDepth(root));
	 path1 = svg1.selectAll("path").data(nodes);
	      path1.enter().append("path")
	      .attr("d", arc)
	      .attr("fill-rule", "evenodd")
	//      .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
	      .style("fill", function(d) { return rainbow1.colorAt(d.depth); })
	      // .on("mouseover", function(d) {
	      //     this.style['opacity'] = .6;
	      //     div.transition()
	      //         .duration(200)
	      //         .style("opacity", .9);
	      //     div .html(d.name)
	      //         .style("left", (d3.event.pageX) + "px")
	      //         .style("top", (d3.event.pageY - 28) + "px");
	      // })
	      // .on("mouseout", function(d) {
	      //     this.style['opacity'] = 1;
	      //    div.transition()
	      //        .duration(500)
	      //        .style("opacity", 0);
	      // })
	      .on("click", click)
		  .on("mouseover", function(d){mouseover(d,svg1)});
	});

	d3.json("data/keyboard_w_lengths.json", function(root) {
	   var nodes = partition.nodes(root);
	   rainbow2.setNumberRange(0, getDepth(root));
	   path2 = svg2.selectAll("path").data(nodes);
	        path2.enter().append("path")
	        .attr("d", arc)
	        .attr("fill-rule", "evenodd")
	  //      .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
	        .style("fill", function(d) { return '#'+rainbow2.colorAt(d.depth); })
	        // .on("mouseover", function(d) {
	        //     this.style['opacity'] = .6;
	        //     div.transition()
	        //         .duration(200)
	        //         .style("opacity", .9);
	        //     div .html(d.name)
	        //         .style("left", (d3.event.pageX) + "px")
	        //         .style("top", (d3.event.pageY - 28) + "px");
	        // })
	        // .on("mouseout", function(d) {
	        //     this.style['opacity'] = 1;
	        //    div.transition()
	        //        .duration(500)
	        //        .style("opacity", 0);
	        // })
	        .on("click", click)
			.on("mouseover", function(d){mouseover(d,svg2)});
	});

    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);
	d3.select(self.frameElement).style("height", height + "px");
	initializeBreadcrumbTrail();
}

function click(d) {
  console.log(d)
  path1.transition()
    .duration(750)
    .attrTween("d", arcTween(d));
  path2.transition()
    .duration(750)
    .attrTween("d", arcTween(d));
}

function isParentOf(p, c) {
  if (p === c) return true;
  if (p.children) {
    return p.children.some(function(d) {
      return isParentOf(d, c);
    });
  }
  return false;
}

// Interpolate the scales!
function arcTween(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d, i) {
    return i
        ? function(t) { return arc(d); }
        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function getDepth(obj) {
    var depth = 0;
    if (obj.children) {
        obj.children.forEach(function (d) {
            var tmpDepth = getDepth(d)
            if (tmpDepth > depth) {
                depth = tmpDepth
            }
        })
    }
    return 1 + depth
}

function zoomOut() {
    path1.transition()
      .duration(750)
      .attrTween("d", arcTween(root1));
    path2.transition()
      .duration(750)
      .attrTween("d", arcTween(root1));
}

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d, vis) {

  // var percentage = (100 * d.value / totalSize).toPrecision(3);
  // var percentageString = percentage + "%";
  // if (percentage < 0.1) {
    // percentageString = "< 0.1%";
  // }
  //
  // d3.select("#percentage")
  //     .text(percentageString);
  //
  // d3.select("#explanation")
  //     .style("visibility", "");

  var sequenceArray = getAncestors(d);
  // updateBreadcrumbs(sequenceArray, percentageString);
  updateBreadcrumbs(sequenceArray);

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
function mouseleave(d) {

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
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .transition()
      .duration(1000)
      .style("visibility", "hidden");
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function initializeBreadcrumbTrail() {
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
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray) {
  var l = nodeArray.length
  if(l > 10)
  	nodeArray = nodeArray.slice(l-11,l)
  // nodeArray.unshift('...');
  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.name + d.depth; });

  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return '#'+rainbow1.colorAt(d.depth); });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
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
	  .on("click",click)
      .text(function(d) {
		  if(d.name.length > 8)
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
  // d3.select("#trail").select("#endlabel")
  //     .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
  //     .attr("y", b.h / 2)
  //     .attr("dy", "0.35em")
  //     .attr("text-anchor", "middle")
  //     .text(percentageString);

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");

}

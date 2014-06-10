/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 * __adaptation__ = "adapted from Mike Bostock's sunburst example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock."
 */

function ComparativeSunburst() {
	var x;
	var y;

	var width = 500,
	    height = width,
	    padding = 5,
	    radius = (Math.min(width, height) - 2 * padding)/ 2,
	    duration = 1000;
	var arc;
	var path1;
	var path2;
	var paths = [];
	var root1;
	var root2;
	var roots = []
	var nodes1;
	var nodes2;
	var nodes = []
	var div;
	var divs = []
	var tips1;
	var tips2;
	var tips = []
	var sync = false;
	var syncMode = "Location";
	var currentPath;
	var currentRoot;
	var sunvar = this;

	this.initJquery = function () {
		$(function() {
		    $( "input[type=button], a, button" )
		      .button()
		      .click(function( event ) {
		        event.preventDefault();
		      });
		  });
	  	$(function() {
	  	    $( "#syncToggle" )
			  .button()
		      .click(function( event ) {
				  sync = !sync
		      });
	  	  });
		$(function() {
		    $( "#sync" )
			  .buttonset()
		      .change(function( event ) {
				  syncMode = $('#syncOptions input[name=sync]:checked').val()
		      });
		  });
	}

	// this.initVals = function (error, r1, r2) {
	// 	root1 = r1
	// 	console.log(r1)
	// 	tips1 = this.getTips(root1)
	// 	root2 = r2
	// 	tips2 = this.getTips(root2)
	// 	roots.push(r1)
	// 	roots.push(r2)
	// 	tips.push(tips1)
	// 	tips.push(tips2)
	// 	this.initCanvas()
	// }

	this.setVals = function(r1, r2) {
		root1 = r1
		tips1 = this.getTips(root1)
		root2 = r2
		tips2 = this.getTips(root2)
		roots.push(r1)
		roots.push(r2)
		tips.push(tips1)
		tips.push(tips2)
		this.initCanvas()
	}

	this.drawSunburst = function (root, tips, plotDiv, plotIndex) {
		var svg = plotDiv.append("svg")
		    .attr("width", width)
		    .attr("height", height)
		    .append("g")
		    .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

		var partition = d3.layout.partition()
		//    .sort(null)
		   .value(function(d) { return d.length; });
		 var nodes = partition.nodes(root);
		 path = svg.selectAll("path").data(nodes);
		      path.enter().append("path")
		      .attr("d", arc)
		      .attr("fill-rule", "evenodd")
		      .style("fill", function(d) { return sunvar.getColor(d, tips); })
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
		      })
		      .on("click", function(d) {
				  sunvar.click(d, plotIndex);
		      });

		  return path
	}

	this.initCanvas = function () {
		div = d3.select("#visWrapper").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

		x = d3.scale.linear().range([0, 2 * Math.PI]);
		y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]);

		arc = d3.svg.arc()
		    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
		    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

		var div1 = d3.select("#plot1")
		var div2 = d3.select("#plot2");
		// for(var i = 0; i < roots.length; i++)
		// {
		// 	console.log(roots[i])
		// 	console.log(tips[i])
		// 	console.log("#plot"+(i+1))
		// 	var plotDiv = d3.select("#plot"+(i+1))
		// 	paths[i] = drawSunburst(roots[i], tips[i], plotDiv, i)
		// }


		path1 = this.drawSunburst(root1, tips2, div1, 0)
		paths[0] = path1
		path2 = this.drawSunburst(root2, tips1, div2, 1)
		paths[1] = path2

	    // Add the mouseleave handler to the bounding circle.
		d3.select(self.frameElement).style("height", height + "px");
	}

	this.getColor = function (d, otherTips) {
		if(isLeaf(d))
		{
			if(d.name)
			{
				if(otherTips.indexOf(d.name) == -1)
					return "#ff0000"
				else
					return "#0000ff"
			}
			else
				return "#ff0000"
		}
		else
		{
			var colorArray = []
			for(c in d.children)
			{
				colorArray.push(this.getColor(d.children[c], otherTips))
			}
			var color = colorArray[0]; //first child color
			for(var c = 1; c < colorArray.length; c++) //start at 1 since we already have the first color
				color = $.xcolor.average(color, colorArray[c])

			return color
		}
	}

	// function getAggregateColor(colorList) {
	// 	var newColorList = []
	// 	var colorWeights = []
	// 	for(var i = 0; i < colorList.length; i++) {
	// 		var index = newColorList.indexOf(colorList[i])
	// 		if(index != -1)
	// 			colorWeights[i]++ //if a color appears twice, increase its weight
	// 		else
	// 		{
	// 			newColorList.push(colorList[i])
	// 			colorWeights.push(1)
	// 		}
	// 	}
	//
	// 	for(var w = 0; w < colorWeights.length-1; w++) {
	//
	// 	}
	// }

	this.getTips = function (n) {
		var tips = []
		if(isLeaf(n)) {
			if(n.name != "")
				tips.push(n.name)
			return tips
		}

		for(c in n.children)
			tips.push.apply(tips, this.getTips(n.children[c]))
		return tips
	}

	function isLeaf(n) {
		if(n.children)
			return false
		else
			return true
	}

	this.click = function (d, plotIndex) {
	  currentPath = paths[plotIndex];
	  currentRoot = roots[plotIndex];

	  if(sync)
	  {
		  if(syncMode == "Location")
		  {
			  for(var i = 0; i < paths.length; i++)
			  {
				  paths[i].transition()
				    .duration(750)
				    .attrTween("d", this.arcTween(d));
			  }
	      }
		  else
		  {
			  var nodeName = d.name
			  for(var i = 0; i < roots.length; i++)
			  {
				  var node = this.getNodeMatchingName(nodeName, roots[i])
				  if(node != null)
				  {
					  paths[i].transition()
					    .duration(750)
					    .attrTween("d", this.arcTween(node));
				  }
				  else
				  	console.log(nodeName + " not in tree number " + i)
			  }
		  }
	  }
	  else
	  {
		  currentPath.transition()
		    .duration(750)
		    .attrTween("d", this.arcTween(d));
	  }
	}

	this.getNodeMatchingName = function (nodeName, tree) {
		// console.log(tree.name === nodeName)
		if(tree.name === nodeName) // found the node, return it
			return tree
		else if(isLeaf(tree))
			return null	// got to a leaf and it doesn't match, return null
		else
		{
			for(c in tree.children)
				return this.getNodeMatchingName(nodeName, tree.children[c]) // see if any children have that node
			return null // this node doesn't match and none of its children match so return null
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
	        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
	  };
	}

	this.getDepth = function (obj) {
	    var depth = 0;
	    if (obj.children) {
	        obj.children.forEach(function (d) {
	            var tmpDepth = this.getDepth(d)
	            if (tmpDepth > depth) {
	                depth = tmpDepth
	            }
	        })
	    }
	    return 1 + depth
	}

	this.zoomOut = function () {
		if(sync)
		{
			for(var i = 0; i < paths.length; i++)
			{
			    paths[i].transition()
			      .duration(750)
			      .attrTween("d", this.arcTween(currentRoot));
			}
	    }
		else
		{
		    currentPath.transition()
		      .duration(750)
		      .attrTween("d", this.arcTween(currentRoot));
		}
	}
}

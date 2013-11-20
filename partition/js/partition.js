function Partition(jsonPath) {
	var w = 1120,
	    h = 600,
	    x = d3.scale.linear().range([0, w]),
	    y = d3.scale.linear().range([0, h]);
	var vis;
	var partition;
	var g;
	var kx,ky;
	var plotVar = this;
	var div;

	this.initPartition = function() {
		div = d3.select("#visWrapper").append("div")   
		.attr("class", "tooltip")               
		.style("opacity", 0);
		
		vis = d3.select("#plot").append("div")
		    .attr("class", "chart")
		    .style("width", w + "px")
		    .style("height", h + "px")
		  .append("svg:svg")
		    .attr("width", w)
		    .attr("height", h);

		partition = d3.layout.partition()
		    .value(function(d) { return d.length; });

		d3.json(jsonPath, function(root) {
		  g = vis.selectAll("g")
		      .data(partition.nodes(root))
		    .enter().append("svg:g")
		      .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
		      .on("click", function(d) { click(d); });

		  var kx = w / root.dx,
		      ky = h / 1;

		  g.append("svg:rect")
		      .attr("width", root.dy * kx)
		      .attr("height", function(d) { return d.dx * ky; })
		      .attr("class", function(d) { return d.children ? "parent" : "child"; })
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

		  g.append("svg:text")
		      .attr("transform", transform)
			  .attr("class", "treemaptext")
		      // .attr("dy", ".35em")
			  .text(function(d) { return d.name; })
		      .style("display", function(d) { 
				  if( d.dx * ky > 12 && d.dx > this.getComputedTextLength() )
				  	return "block"
				  else
					return "none"
			  })
		      
			  
		  d3.select(window)
		      .on("click", function() { click(root); })
			  
			  
		  function click(d) {
		    if (!d.children) return;

		    kx = (d.y ? w - 40 : w) / (1 - d.y);
		    ky = h / d.dx;
		    x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
		    y.domain([d.x, d.x + d.dx]);

		    var t = g.transition()
		        .duration(d3.event.altKey ? 7500 : 750)
		        .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

		    t.select("rect")
		        .attr("width", d.dy * kx)
		        .attr("height", function(d) { return d.dx * ky; });

		    t.select("text")
		        .attr("transform", transform)
	  		    .text(function(d) {	return d.name; })
		        .style("display", function(d) { 
				  if( d.dx * ky > 12 && d.dx > this.getComputedTextLength())
				  	return "block"
				  else
					return "none"
			  });

		    d3.event.stopPropagation();
		  }
		  
		  function transform(d) {
		    return "translate(1," + d.dx * ky / 2 + ")";
		  }
		});
	}
}
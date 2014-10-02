/* adapted from Mike Bostock's donut chart example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock.
adapted code Copyright 2013 Meg Pirrung */
function DonutCharts() {
	/*global vars*/
	var radius = 74,
	    padding = 10;
	var arc;
	var pie;
	var arcHolder;
	var pies;
	var div;
	var legenddiv;
	var legendHolder;
	var biom;
	var data;
	var metadataTypes;
	var vis;
	var svg;
	var samID;
	var tax;
	var rainbow = new Rainbow();

	this.setBiom = function (root) {
	  biom = root;
	  this.initTaxonomyBarChart()
	}

	this.initTaxonomyBarChart = function () {
		rainbow.setSpectrum('#e41a1c','#377eb8','#4daf4a','#984ea3','#000000')

		div = d3.select("#donutplot").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

		legenddiv = d3.select("#donutplot").append("div")
		.attr("class", "donutLegendDiv")
		.attr("id", "donutLegendDiv")
		.attr("width", 180);

		var classification = ["Phylum","Class","Order","Family","Genus","Species"]

		vis = d3.select("#donutplot")
		legendHolder = d3.select("#donutLegendDiv")

		arc = d3.svg.arc()
		    .outerRadius(radius)
		    .innerRadius(radius - 30);

		pie = d3.layout.pie()
			    .sort(null)
			    .value(function(d) { return d.abundance; });

		  this.setData(1)

	  	 pies = vis.selectAll(".pie")
	  		.data(data)
	  		    .enter().append("svg")
	  		      .attr("class", "pie")
	  		      .attr("width", radius * 2)
	  		      .attr("height", radius * 2)
	  		    .append("g")
	  		      .attr("transform", "translate(" + radius + "," + radius + ")");

		  arcHolder = pies.selectAll(".arc")
			      .data(function(d) { return pie(d.abundances); })
			    .enter().append("path")
			      .attr("class", "arc")
			      .attr("d", arc )
				  .style("fill", function(d) { return '#'+rainbow.colorAt(d3.keys(data[d3.keys(data)[0]]['tax']).indexOf(d.data.name)); } );

		  pies.append("text")
		      .attr("dy", ".35em")
		      .style("text-anchor", "middle")
		      .text(function(d) { return d.name; });

  		this.getTotalAbundances(data)
  		this.drawTaxonomyBarVis(data)
	}

	this.getTotalAbundances = function (data) {
		var groupAbundances = {}
		for(var r in data)
		{
			var row = data[r]['abundances']
			for(var i = 0; i < row.length; i++)
			{
				if(!(row[i].name in groupAbundances))
					groupAbundances[row[i].name] = 0
				groupAbundances[row[i].name] += Math.abs(row[i].y0-row[i].y1)
			}
		}
	}

	this.setData = function (taxonomic_level) {
		data = []
		var sampleIDs = []
		var temp = {}
		tax = []

		// getBiom()

		if(biom['matrix_type'] == 'dense')
		{
			for(var i = 0; i < biom['columns'].length; i++)
			{
				sampleIDs[i] = biom['columns'][i]['id'];
				temp = {"SampleID":sampleIDs[i]}
				temp['metadata'] = biom['columns'][i]['metadata']
				temp['tax'] = {}
				for(var j = 0; j < biom['rows'].length; j++)
				{
					var classification = biom['rows'][j]['metadata']['taxonomy'][taxonomic_level]
					tax.push(classification)
					if(!(classification in temp['tax']))
						temp['tax'][classification] = 0
					temp['tax'][classification] += biom['data'][j][i]
				}
				data.push(temp)
			}
		} else {
			var temp_hash = {}
			tax = []
			for(var j = 0; j < biom['data'].length; j++)
			{
				var otuindex = biom['data'][j][0]
				var sampleindex = biom['data'][j][1]
				var value = biom['data'][j][2]
				var classification = biom['rows'][otuindex]['metadata']['taxonomy'][taxonomic_level]
				if(classification == undefined)
					continue
				tax.push(classification)
				var sampleID = biom['columns'][sampleindex]['id']
				if(!(sampleID in temp_hash))
				{
					temp_hash[sampleID] = {}
					temp_hash[sampleID]['metadata'] = biom['columns'][sampleindex]['metadata']
				}
				if(!(classification in temp_hash[sampleID]))
					temp_hash[sampleID][classification] = 0.0
				temp_hash[sampleID][classification] += value
			}

			tax = this.dedupe(tax)

			for(o in temp_hash)
			{
				temp = {"SampleID":o}
				temp['metadata'] = temp_hash[o]['metadata']
				temp['tax'] = {}
				for(var i = 0; i < tax.length; i++)
				{
					if(tax[i] in temp_hash[o])
						temp['tax'][tax[i]] = temp_hash[o][tax[i]]
					else
						temp['tax'][tax[i]] = 0.0
				}
				data.push(temp)
			}
		}

		var domain = d3.keys(data[d3.keys(data)[0]]['tax'])

	    data.forEach(function(d) {
	      // var y0 = 0;
		  d.name = d.SampleID
	      d.abundances = domain.map(function(name) { return {name: name, abundance: +d['tax'][name]}; });
		  d.total = d3.sum(d.abundances, function(a) {
			  return a.abundance
		  });
		  d.abundances.forEach(function(t) { t.percent = t.abundance/d.total; });
		  d.metadata = d['metadata']
	    });
		// y.domain([0, d3.max(data, function(d) { return d.total; })]);
		data.sort(function(a, b) { return a.SampleID.localeCompare(b.SampleID); });
		rainbow.setNumberRange(0, domain.length);
	}

	this.dedupe = function (tax) {
	   var set = {};
	   for (var i = 0; i < tax.length; i++)
	      set[tax[i]] = true;
	   tax = [];
	   for (var t in set)
	      tax.push(t);
	   return tax;
	}

	this.drawLegend = function (donutplotdata) {
		var legend = legendHolder.append("svg")
		      .attr("class", "legend")
		      .attr("width", 200)
		      .attr("height", 450)
		    .selectAll("g")
		      .data(d3.keys(data[d3.keys(donutplotdata)[0]]['tax']).slice().reverse())
		    .enter().append("g")
		      .attr("transform", function(d, i) { return "translate("+ 0 + "," + i * 20 + ")"; });

		  legend.append("rect")
		      .attr("width", 18)
		      .attr("height", 18)
		      .style("fill", function(d) { return '#'+rainbow.colorAt(d3.keys(donutplotdata[d3.keys(donutplotdata)[0]]['tax']).indexOf(d)); });

		  legend.append("text")
		      .attr("x", 24)
		      .attr("y", 9)
		      .attr("dy", ".35em")
		      .text(function(d) { return d.substring(4,d.length); });
	}

	this.drawTaxonomyBarVis = function (donutplotdata, showLabels) {
	  this.drawLegend(donutplotdata)
 	  vis.selectAll(".pie").remove();
 	  pies.selectAll("text").remove(); //remove old text that may be here

 	 pies = vis.selectAll(".pie")
    	 	.data(donutplotdata)
    		    .enter().append("svg")
    		      .attr("class", "pie")
    		      .attr("width", radius * 2)
    		      .attr("height", radius * 2)
    		    .append("g")
    		      .attr("transform", "translate(" + radius + "," + radius + ")");

  	  arcHolder = pies.selectAll('.arc')
 	  	.data(function(d) { return pie(d.abundances); })
  		    .enter().append("path")
  		      .attr("class", "arc")
  		      .attr("d", arc)
  			  .style("fill", function(d) { return '#'+rainbow.colorAt(d3.keys(data[d3.keys(data)[0]]['tax']).indexOf(d.data.name)); } )
  	  	      .on("mouseover", function(d) {
  	  	          this.style['opacity'] = .6;
  	  	          div.transition()
  	  	              .duration(200)
  	  	              .style("opacity", .9);
  	  	          div .html(d.data.name.substring(4, d.data.name.length) +": "+(d.data.percent*100).toFixed(2)+"%")
  	  	              .style("left", (d3.event.pageX) + "px")
  	  	              .style("top", (d3.event.pageY - 28) + "px");
  	  	      })
  	  	      .on("mouseout", function(d) {
  	  	          this.style['opacity'] = 1;
  	  	         div.transition()
  	  	             .duration(500)
  	  	             .style("opacity", 0);
  	  	      });

  	  pies.append("text")
  	      .attr("dy", ".35em")
  	      .style("text-anchor", "middle")
  	      .text(function(d) { return d.name; });
	}
}

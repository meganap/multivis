/* adapted from Mike Bostock's normalized stacked area chart example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock.
adapted code Copyright 2013 Meg Pirrung */
function AreaChart() {
	/*global vars*/
	var margin;
	var windowWidth;
	var width;
	var height;
	var x;
	var y;
	var area;
	var stack;
	var taxons;
	var taxon;
	var color;
	var xAxis;
	var yAxis;
	var div;
	var biom;
	var data;
	var metadataTypes;
	var vis;
	var svg;
	var samID;
	var tax;
	var xAxisLabel;
	var rainbow = new Rainbow();

	this.setBiom = function (root) {
	  biom = root;
	  this.initTaxonomyChart()
	}

	this.initTaxonomyChart = function () {
		windowWidth = document.getElementById('plot').offsetWidth;
		margin = {top: 30, right: 120, bottom: 190, left: 50};
		width = windowWidth*.97;
		height = 600 - margin.top - margin.bottom;

		x = d3.scale.ordinal()
		.rangePoints([0, width]);

		y = d3.scale.linear()
		.range([height, 0]);

		rainbow.setSpectrum('#e41a1c','#377eb8','#4daf4a','#984ea3','#000000')

		xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

		yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(d3.format(".0%"));

		div = d3.select("#plot").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

		// var classification = ["Phylum","Class","Order","Family","Genus","Species"]

		vis = d3.select("#plot")
		svg = vis.append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		    .attr("id", "chart")
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  	  	area = d3.svg.area()
  	  	    .x(function(d) { return x(d.SampleID); })
  	  	    .y0(function(d) { return y(d.y0); })
  	  	    .y1(function(d) { return y(d.y0 + d.y); });

  	  	stack = d3.layout.stack()
  	  	      .values(function(d) { return d.values; });

		  this.setData(1)
		  // this.setMetadataTypes()
 		  // this.setSelect()
 // 	  	  this.buildKey(tax)

		  x.domain(data.map(function(d) { return d.SampleID; }));
		  // x.domain(d3.extent(data, function(d) { return d.SampleID; }));

		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis);

		  svg.append("text")
		      .attr("class", "axisLabel")
		      .attr("text-anchor", "middle")
		      .attr("y", -55)
		      .attr("x", -height/2)
		      .attr("dy", ".75em")
		      .attr("transform", "rotate(-90)")
		      .text("Abundance");

		  samID = svg.selectAll(".SampleID")
		      .data(data)
		    .enter().append("g")
		      .attr("class", "SampleID")
		      .attr("transform", function(d) { return "translate(" + x(d.SampleID) + ",0)"; });


		  taxon = svg.selectAll(".taxon")
		        .data(taxons)
		      .enter().append("g")
		        .attr("class", "taxon");

			data.sort(
				function(a, b) {
					return a.SampleID.localeCompare(b.SampleID)
				}
				);
			this.getTotalAbundances(data)
			this.drawTaxonomyVis(data)
	}

	// this.changeLevel = function (taxonomic_level) {
// 		document.querySelectorAll('.selected_classification')[0].className = 'unselected_classification';
// 		document.getElementById('classification'+taxonomic_level).className = 'selected_classification'
// 		//reset stuff
// 		this.setData(taxonomic_level)
// 		this.buildKey(tax)
// 		this.sortChanged()
// 	}
//
// 	this.setSelect = function () {
// 		var sortSelect = document.getElementById('sort_by_select')
// 		var groupSelect = document.getElementById('group_by_select')
// 		var option = document.createElement("option");
// 		option.text = "SampleID"
// 		sortSelect.add(option)
// 		option = document.createElement("option");
// 		option.text = "SampleID"
// 		groupSelect.add(option)
// 		for(var m in biom['columns'][0]['metadata'])
// 		{
// 			option=document.createElement("option");
// 			option.text = m
// 			sortSelect.add(option)
// 			option=document.createElement("option");
// 			option.text = m
// 			groupSelect.add(option)
// 		}
// 	}
//
// 	this.setMetadataTypes = function () {
// 		metadataTypes = {}
// 		var keys = d3.keys(data[d3.keys(data)[0]].metadata)
// 		for(var i = 0; i < keys.length; i++)
// 			metadataTypes[keys[i]] = null;
//
// 		var firstKey = data[d3.keys(data)[0]]
// 		for(var k in metadataTypes)
// 		{
// 			var metadataType;
// 			//try to see if it is a number
// 			var n = Number(firstKey.metadata[k])
// 			if(isNaN(n)) //not a number so has to be a string
// 				metadataType = "string"
// 			else
// 				metadataType = "number"
//
// 			for(var s in data)
// 			{
// 				var val = data[s].metadata[k]
// 				if(val == "NA") //ignore NAs
// 					continue;
// 				var test = Number(val)
// 				var testType;
// 				if(isNaN(test)) //not a number so has to be a string
// 					testType = "string"
// 				else
// 					testType = "number"
//
// 				if(testType !== metadataType)
// 				{
// 					metadataType = "string"
// 					break;
// 				}
// 			}
// 			metadataTypes[k] = metadataType
// 		}
// 	}
//
// 	this.sortChanged = function () {
// 		var key = document.getElementById('sort_by_select')[document.getElementById('sort_by_select').selectedIndex].text;
// 		var metadataType = metadataTypes[key];
// 		data.sort(
// 			function(a, b) {
// 				var sortval;
// 				if(key === "SampleID")
// 					sortval = a.SampleID.localeCompare(b.SampleID);
// 				else if(a.metadata[key] === 'NA' && b.metadata[key] === 'NA')
// 					sortval = 0
// 				else if(a.metadata[key] === 'NA' && b.metadata[key] !== 'NA')
// 					sortval = -1
// 				else if(a.metadata[key] !== 'NA' && b.metadata[key] === 'NA')
// 					sortval = 1
// 				else if(metadataType === 'number')
// 					sortval = a.metadata[key] - b.metadata[key];
// 				else if (metadataType === 'string')
// 					sortval = a.metadata[key].localeCompare(b.metadata[key]);
// 				else
// 					sortval = 0
//
// 				if(sortval === 0)
// 					return a.SampleID.localeCompare(b.SampleID);
// 				else
// 					return sortval
// 				}
// 			);
//
// 		var groupsDict = {}
// 		if(key !== "SampleID")
// 		{
// 			data.forEach(function(d) {
// 				var val = d.metadata[key]
// 				if(!(val in groupsDict))
// 					groupsDict[val] = 1
// 				else
// 					groupsDict[val]++
// 			});
// 		}
//
// 		// if((groupsDict.length !== data.length) && key !== "SampleID")
// 		// 	this.drawSortHeaders(groupsDict)
//
// 		//sort by resets group by so set the index back to 0
// 		document.getElementById('group_by_select').selectedIndex = 0
// 		this.getTotalAbundances(data)
// 		this.drawTaxonomyVis(data)
// 	}

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

		// groupAbundances.sort(
		// 		function(a, b) {
		// 			console.log("a:"+a)
		// 			console.log("b:"+b)
		// 				return 0;
		// 			}
		// 		);
	}

	// this.groupChanged = function () {
// 		var groupData = []
// 		var groupCounts = {}
// 		var temp = {}
// 		var key = document.getElementById('group_by_select')[document.getElementById('group_by_select').selectedIndex].text;
// 		var sampleIDs = d3.keys(data)
//
// 		for(var i = 0; i < sampleIDs.length; i++)
// 		{
// 			var sampleID = sampleIDs[i]
// 			var val = data[sampleID].metadata[key];
// 			if(key == "SampleID")
// 				val = data[sampleID].SampleID
// 			if(!(val in temp))
// 				temp[val] = {}
//
// 			if(!(val in groupCounts))
// 				groupCounts[val] = 0
// 			groupCounts[val] += 1
//
// 			var currentTaxonomy = d3.keys(data[sampleID].tax)
// 			for(var j = 0; j < currentTaxonomy.length; j++)
// 			{
// 				var currentTax = currentTaxonomy[j]
// 				if(!(currentTax in temp[val]))
// 					temp[val][currentTax] = 0
// 				temp[val][currentTax] += data[sampleID].tax[currentTax]
// 			}
// 		}
//
// 		var groups = d3.keys(temp)
// 		var t;
// 		for(var i = 0; i < groups.length; i++)
// 		{
// 			 t = {"SampleID":groups[i]}
// 			 t['tax'] = temp[groups[i]]
// 			 t['count'] = groupCounts[groups[i]]
// 			 groupData.push(t)
// 		}
//
// 		var domain = d3.keys(groupData[d3.keys(data)[0]]['tax'])
//
// 	    groupData.forEach(function(d) {
// 	      var y0 = 0;
// 	      d.abundances = domain.map(function(name) { return { name: name, y0: y0, y1: y0 += +d['tax'][name]}; });
// 	      // d.abundances.forEach(function(d) { d.y0 /= y0; d.y1 /= y0; });
// 		  d.total = d.abundances[d.abundances.length - 1].y1;
// 		  d.metadata = d['metadata']
// 	    });
//
//   	    taxons = stack(domain.map(function(name) {
//   	        return {
//   	          name: name,
//   	          values: groupData.map(function(d) {
//   	            return {SampleID: d.SampleID, y: d['tax'][name] / d.total};
//   	          })
//   	        };
//   	      }));
//
//   		taxons.forEach(function(d) {
//   			d.values = d.values.sort(function(a, b) { return a.SampleID.localeCompare(b.SampleID); });
//   		}
//   		);
//
// 		rainbow.setNumberRange(0, domain.length);
//
// 		var metadataType = metadataTypes[key];
//
// 		//in this case the SampleID is actually the group name
// 		groupData.sort(
// 			function(a, b) {
// 				var sortval;
// 				if(a.SampleID == 'NA' && b.SampleID == 'NA')
// 					return 0
// 				else if(a.SampleID == 'NA' && b.SampleID !== 'NA')
// 					return -1
// 				else if(a.SampleID !== 'NA' && b.SampleID == 'NA')
// 					return 1
// 				else if(metadataType === 'string')
// 					return a.SampleID.localeCompare(b.SampleID);
// 				else if(metadataType === 'number')
// 					return Number(a.SampleID) - Number(b.SampleID);
// 				else
// 					return 0
// 				}
// 			);
// 		this.getTotalAbundances(groupData)
// 		this.drawTaxonomyVis(groupData, true)
// 	}

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
				// data[sampleIDs[i]] = temp
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
				// data[o] = temp
			}
		}

		// color.domain(d3.keys(data[d3.keys(data)[0]]['tax']));
		var domain = d3.keys(data[d3.keys(data)[0]]['tax'])

	    data.forEach(function(d) {
	      var y0 = 0;
	      d.abundances = domain.map(function(name) { return { name: name, y0: y0, y1: y0 += +d['tax'][name]}; });
		  d.total = d.abundances[d.abundances.length - 1].y1;
		  d.metadata = d['metadata']
	    });

  	    taxons = stack(domain.map(function(name) {
  	        return {
  	          name: name,
  	          values: data.map(function(d) {
  	            return {SampleID: d.SampleID, y: d['tax'][name] / d.total};
  	          })
  	        };
  	      }));

		// data.sort(function(a, b) { return b.total - a.total; });
		rainbow.setNumberRange(0, domain.length);

		taxons.forEach(function(d) {
			d.values = d.values.sort(function(a, b) { return a.SampleID.localeCompare(b.SampleID); });
		}
		);
	}

	// this.buildKey = function (tax) {
	// 	tax.sort()
	// 	var htmlstring = "<ul id='key'>"
	// 	for(var t in tax)
	// 		htmlstring += "<li>"+tax[t]+"</li>"
	// 	htmlstring += "</ul>"
	// 	document.getElementById("color_list").innerHTML = htmlstring;
	// }


	/* dedupe function adapted from http://community.servicenow.com/blog/slightlyloony/4113 */
	this.dedupe = function (tax) {
	   var set = {};
	   for (var i = 0; i < tax.length; i++)
	      set[tax[i]] = true;
	   tax = [];
	   for (var t in set)
	      tax.push(t);
	   return tax;
	}

	// function changeColor(tax) {
	// }

	// function drawSortHeaders(groupsDict) {
	// 	console.log("****")
	//
	// 	var groups = svg.selectAll(".groups")
	// 		.data(groupsDict)
	// 	    .enter().append("g")
	// 	      .attr("class", "groups");
	// 	groups.selectAll("rect")
	// 		.data(groupsDict)
	// 		.enter().append("rect")
	// 		.attr("x",height)
	// 		.attr("y",width)
	// 		.attr("width",20)
	// 		.attr("height",20);
	// }

	this.drawLegend = function (plotdata) {
		var legend = svg.selectAll(".legend")
		      .data(d3.keys(data[d3.keys(plotdata)[0]]['tax']).slice().reverse())
		    .enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(10," + i * 20 + ")"; });

		  legend.append("rect")
		      .attr("x", width)
		      .attr("width", 18)
		      .attr("height", 18)
		      .style("fill", function(d) { return '#'+rainbow.colorAt(d3.keys(plotdata[d3.keys(plotdata)[0]]['tax']).indexOf(d)); });

		  legend.append("text")
		      .attr("x", width + 22)
		      .attr("y", 9)
		      .attr("dy", ".35em")
		      .text(function(d) { return d; });
	}

	this.drawTaxonomyVis = function (plotdata, showLabels) {
		  x.domain(plotdata.map(function(d) { return d.SampleID; }));

		  taxon.selectAll("path").remove(); //clear old areas
		  samID.selectAll("text").remove(); //remove old text that may be here
		  svg.selectAll(".xAxisLabel").remove(); //remove old text

		  samID = svg.selectAll(".SampleID")
		      .data(plotdata)
		  	  .attr("transform", function(d) { return "translate(" + x(d.SampleID) + ",0)"; });

		  // if(showLabels)
		  // {
		  			  samID.append("text")
		  			  		  .attr("y", function(d){ return x(d.sampleID); })
		  			  		  .attr("x", -height-15)
		  			  		  .attr("text-anchor", "end")
		  			    	      .attr("transform", function(d) {
		  			    	          return "rotate(-90)";
		  			    	      })
		  			  		  .text(function(d){ return (d.SampleID); });
		  // }else{
		  // 			  svg.append("text")
		  // 			      .attr("class", "xAxisLabel")
		  // 			      .attr("text-anchor", "middle")
		  // 			      .attr("x", width/2)
		  // 			      .attr("y", height + 50)
		  // 			      .text("Sample");
		  // }

		  taxon = svg.selectAll(".taxon")
		        .data(taxons);
		      // .enter().append("g")
		      //   .attr("class", "taxon");

			  taxon.append("path")
			        .attr("class", "area")
			        .attr("d", function(d) { return area(d.values); })
			        .style("fill", function(d) { return '#'+rainbow.colorAt(d3.keys(data[d3.keys(data)[0]]['tax']).indexOf(d.name)); })
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

		  taxon.enter().append("path")
		        .attr("class", "area")
		        .attr("d", function(d) { return area(d.values); })
		        .style("fill", function(d) { return '#'+rainbow.colorAt(d3.keys(data[d3.keys(data)[0]]['tax']).indexOf(d.name)); })
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

		this.drawLegend(plotdata)
	}
}

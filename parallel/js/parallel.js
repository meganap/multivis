/* adapted from Mike Bostock's parallel coordinates example on d3js.org, d3 example code Library released under BSD license. Copyright 2013 Mike Bostock.
adapted code Copyright 2013 Meg Pirrung */
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
		pwidth = document.getElementById('plot').offsetWidth
		pheight = document.getElementById('plot').offsetHeight

		document.getElementById('plot').innerHTML = '<div id="parallelPlot" class="parcoords" style="width:'+pwidth+'px;height:'+pheight+'px"></div>'

		data.forEach(function(d){
			groups.push(d.Individual)
		});
		groups = this.dedupe(groups)

		rainbow.setSpectrum('green','blue','red','yellow')
		rainbow.setNumberRange(0,groups.length);

		// num_axes = g_fractionExplained.length-g_number_of_custom_axes;

		// var data2 = new Array();
		// parallelColorMap = {};
		// for (sid in g_spherePositions) {
		// 	var a_map = {};
		// 	var key = "";
		// 	var value = g_mappingFileData[sid][g_categoryIndex];
		// 	for (var i = 1; i < num_axes+1; i++) {
		// 		a_map['P'+i+'('+g_fractionExplainedRounded[i-1]+'%)'] = g_spherePositions[sid]['P'+i];
		// 		key += String(a_map[i]);
		// 	}
		// 	parallelColorMap[key] = value;
		// 	data2.push(a_map);
		// }
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
		  .margin({ top: 40, left: 50, bottom: 40, right: 0 })
		  .mode("queue")
		  .render()
		  .brushable()
		  .reorderable();
	}
}
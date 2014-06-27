/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 */

var s;

var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ").replace(/\//g, '')); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

var abundancehtml = "<div id=\"yaxisholder\"></div><div id=\"plot\"></div>"
var abundanceFuns = [ normStackedBar, area, donuts ]

var phyloFuns = [ sunburst, rectangularTree, radialTree, treemap ]

var multidimFuns = [ parallel, scatter, splom, threeD ]

var visFuns = [ abundanceFuns, phyloFuns, multidimFuns ]

var allFuns = [ sunburst, treemap, rectangularTree, radialTree, normStackedBar, area, donuts, threeD, scatter, splom, parallel ]

var surveyStart = "<div id=\"surveyMonkeyInfo\" style=\"width:800px;font-size:10px;color:#666;\"><div><iframe id=\"sm_e_s\" src=\"https://www.surveymonkey.com/s/"
var surveyIDs = ['RSZFG6H?c=','','','']
var surveyEnd = "\" width=\"800\" height=\"300\" style=\"border:0px;padding-bottom:4px;\" frameborder=\"0\" allowtransparency=\"true\" ></iframe></div></div>"

function buildSurvey() {
	var visType = Math.floor((Math.random()*visFuns.length)) // choose between taxonomy summary, higherarchical or multidimensional
	console.log(visType)
	var visID = Math.floor((Math.random()*visFuns[visType].length))
	console.log(visID)

	visFuns[visType][visID]();

	var surveyHTML = buildSurveyHTML(visID)
	document.getElementById('survey').innerHTML = surveyHTML
}

function buildSurveyHTML(visID) {
	var surveyID = urlParams['id']+"_"+urlParams['src']+"_1"+visID
	console.log(surveyID)
	return surveyStart + surveyID + surveyEnd
}

function changeVis() {
	allFuns[document.getElementById('visSelect').selectedIndex]()
}

function sunburst() {
	s = new Sunburst("data/keyboard_mini.json")
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	// d3.select("#visWrapper").append("div")
	// 	.attr("id", "sequence");
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");
	// d3.select("#visWrapper").append("div")
	// 	.attr("id", "text_width");
	// d3.select("#visWrapper").append("input")
	// 	.attr("type", "button")
	// 	.attr("value", "Zoom Out")
	// 	.attr("click", function() {s.zoomOut()});
	s.initSunburst()
}

function rectangularTree() {
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");

	// var newick = Newick.parse("data/keyboard_mini.tre")
	var newick = Newick.parse("((Taxon6:0.020,(Taxon7:0.076,Taxon8:0.093):0.011):0.015,(Taxon1:0.011,(Taxon2:0.032,(Taxon3:0.030,(Taxon4:0.014,Taxon5:0.050):.001):0.006):0.017):0.016);")
    var newickNodes = []
    function buildNewickNodes(node, callback) {
      newickNodes.push(node)
      if (node.branchset) {
        for (var i=0; i < node.branchset.length; i++) {
          buildNewickNodes(node.branchset[i])
        }
      }
    }
    buildNewickNodes(newick)
	d3.phylogram.build('#plot', newick, {
	          width: 550,
	          skipLabels: false
	        })
}

function radialTree() {
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");

	// var newick = Newick.parse("data/keyboard_mini.tre")
	var newick = Newick.parse("((Taxon6:0.020,(Taxon7:0.076,Taxon8:0.093):0.011):0.015,(Taxon1:0.011,(Taxon2:0.032,(Taxon3:0.030,(Taxon4:0.014,Taxon5:0.050):.001):0.006):0.017):0.016);")
    var newickNodes = []
    function buildNewickNodes(node, callback) {
      newickNodes.push(node)
      if (node.branchset) {
        for (var i=0; i < node.branchset.length; i++) {
          buildNewickNodes(node.branchset[i])
        }
      }
    }
    buildNewickNodes(newick)
	d3.phylogram.buildRadial('#plot', newick, {
	          width: 550,
	          skipLabels: false
	        })
}

// function comparativeSunburst() {
// 	s = new ComparativeSunburst()
// 	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
// 	d3.select("#visWrapper").append("div")
// 		.attr("id", "plot1")
// 		.attr("class", "plot");
// 	d3.select("#visWrapper").append("div")
// 		.attr("id", "plot2")
// 		.attr("class", "plot");
//
//   	queue()
//   		.defer(d3.json, "data/comp_small_1.json")
//   		.defer(d3.json, "data/comp_small_2.json")
//   		.await(function(error, r1, r2) { initComp(r1,r2) });
// }

function treemap() {
	s = new Treemap("data/keyboard_mini.json")
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");
	// d3.select("#visWrapper").append("div")
	// 	.attr("id", "text_width");
	s.initTreemap()
}

// function partition() {
// 	s = new Partition("sunburst/data/test.json")
// 	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
// 	d3.select("#visWrapper").append("div")
// 		.attr("id", "plot");
// 	d3.select("#visWrapper").append("div")
// 		.attr("id", "text_width");
// 	s.initPartition()
// }

// function initComp(r1,r2) {
// 	s.setVals(r1,r2)
// }

// function stackedBar() {
// 	s = new StackedBar()
// 	initAbundance()
// }

function normStackedBar() {
	s = new NormalizedStackedBar()
	d3.select("#visWrapper").html(abundancehtml)
	initAbundance()
}

// function groupedBar() {
// 	s = new GroupedBar()
// 	initAbundance()
// }

function donuts() {
	s = new DonutCharts()
	d3.select("#visWrapper").html("<div id=\"yaxisholder\"></div><div id=\"donutplot\"></div>")
	initAbundance()
}

function area() {
	s = new AreaChart()
	d3.select("#visWrapper").html(abundancehtml)
	initAbundance()
}

function initAbundance() {
	// d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	// d3.select("#visWrapper").html(abundancehtml)
  	queue()
  		.defer(d3.json, "data/subsubsetAG.biom")
  		.await(loadBiom);
}

function loadBiom(error, root) {
	s.setBiom(root)
}

function parallel() {
	s = new ParallelCoordinates()
	initMultiDim()
}

function splom() {
	s = new Splom()
	initMultiDim()
}

function scatter() {
	s = new Scatter()
	initMultiDim()
}

function threeD() {
	s = new ThreeD();
	initMultiDim()
}

function initMultiDim() {
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot")
		.attr("class", "plot");
	d3.select("#visWrapper").append("div")
		.attr("id", "toggleHolder");

	document.getElementById("toggleHolder").innerHTML = " <div id='colorBy'>Color by:<br><input type='radio' id='Individual' name='colorBy' checked='checked'><label for='Individual'>Individual</label><input type='radio' id='Environment' name='colorBy'><label for='Environment'>Environment</label></div>";

	$( "#colorBy" )
		.buttonset()
		.change(function( event ) {
	        // console.log(event.target.id)
			s.changeColors(event.target.id)
		});

  	queue()
  		.defer(d3.csv, "data/keyboard_realIDs.csv")
  		.await(loadMultiDim);
}

function loadMultiDim(error, root) {
	s.setData(root)
}

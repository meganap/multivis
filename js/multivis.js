/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 */

var s;

/* from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript */
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

var phyloFuns = [ sunburst, rectangularTree, radialTree ]

var multidimFuns = [ parallel, scatter, splom, threeD ]

var visFuns = [ abundanceFuns, phyloFuns, multidimFuns ]

var allFuns = [ sunburst, treemap, rectangularTree, radialTree, normStackedBar, area, donuts, threeD, scatter, splom, parallel ]

var surveyStart = "<div id=\"surveyMonkeyInfo\" style=\"width:800px;font-size:10px;color:#666;\"><div><iframe id=\"sm_e_s\" src=\"http://www.surveymonkey.com/s/"
var surveyIDs = ['FLMWHYQ?c=','FLZ9N9J?c=','FVVSD3C?c='] //abundance, phylogeny, multidim
var surveyEnd = "\" width=\"800\" height=\"300\" style=\"border:0px;padding-bottom:4px;\" frameborder=\"0\" allowtransparency=\"true\" ></iframe></div></div>"

var newURL = '';
var visType;
var visID;

function buildSurvey() {
	if(urlParams['admin'])
	{
		visType = urlParams['admin'][0]
		visID =  urlParams['admin'][1]
		$("#dialog-confirm").remove()

		visFuns[visType][visID]();
	}else {
		var oldIDs = []
		//if this is the initial survey there will not be any old ids
		if(urlParams['ids'])
			oldIDs = urlParams['ids'].split('_')

		var availableVisTypes = ['0', '1', '2']

		if(oldIDs.length < 3) // if length = 3 need to do demographic questions
		{
			newURL = 'http://'
			var urlPieces = document.URL.split("/")

			for(var i = 2; i < urlPieces.length - 1; i++)
				newURL += urlPieces[i]+'/'

			newURL +='?src='+urlParams['src']+'&u='+urlParams['u']+'&ids='
			console.log(newURL)
			for(var i in oldIDs)
			{
				availableVisTypes.splice(availableVisTypes.indexOf(oldIDs[i][0]),1) //remove the old visType so we don't show it again
				newURL += oldIDs[i]+'_' //keep track of old surveys in the URL
			}
			// console.log(availableVisTypes)

			visType = availableVisTypes[Math.floor((Math.random()*availableVisTypes.length))] // choose among available visTypes left
			// var visType = 0

			$.post("getVisID.php", { visType: visType })
			    .done(function( data ) {
					visID = parseInt(data);
					if(isNaN(visID))
						visID = Math.floor((Math.random()*visFuns[visType].length));
					buildPage(visID);
			     });

		}
		else
		{
			$("#visWrapper").remove()
			$("#nextSurvey").remove()
			$("#dialog-confirm").remove()
			var surveyHTML = surveyStart + 'FVDKBJX?c=' +"\" width=\"800\" height=\"1347\" style=\"border:0px;padding-bottom:4px;\" frameborder=\"0\" allowtransparency=\"true\" ></iframe></div></div>"
			document.getElementById('survey').innerHTML = surveyHTML
		}
	}
}

function buildPage(id) {
	// visID = Math.floor((Math.random()*visFuns[visType].length))
	visID = id

	//build surveymonkey custom URL
	var surveyID = surveyIDs[visType]+urlParams['u']+"_"+urlParams['src']+"_"+visType+visID
	var surveyHTML = surveyStart + surveyID + surveyEnd
	document.getElementById('survey').innerHTML = surveyHTML
	// console.log(surveyID)

	//build URL for next survey while keeping track of the current survey
	newURL += visType+''+visID
	// console.log(newURL)

	// console.log(visType)
	// console.log(visID)
	visFuns[visType][visID]();
}

function log(i, t) {
 $.post("record.php", { vis: true, visID: i, visType: t, id: urlParams['u'], src: urlParams['src']});
}

function buildSurveyHTML(visID) {
	var surveyID = urlParams['id']+"_"+urlParams['src']+"_1"+visID
	return surveyStart + surveyID + surveyEnd
}

function nextSurvey() {
	 $.post("record.php", { vis: true, visID: visID, visType: visType, id: urlParams['u'], src: urlParams['src']})
	 .done(function(data) {
	 	window.open(newURL, '_self');
	 });
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
	          width: 1050,
	          skipLabels: false
	        })
}

function radialTree() {
	// s = new Radial("data/keyboard_mini.txt");
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");

	// s.initRadialTree()

	var newick = Newick.parse("data/keyboard_mini.tre")
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
	          width: 450,
	          skipLabels: false,
			  skipBranchLengthScaling: false
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

	document.getElementById("toggleHolder").innerHTML = " <div id='colorBy'>Color by:<br><input type='radio' id='Individual' name='colorBy' checked='checked'><label for='Individual'>Individual</label><input type='radio' id='Environment' name='colorBy'><label for='Environment'>Environment</label></div><br><div id=\"note\"></div>";

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

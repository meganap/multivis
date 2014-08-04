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
/* end stackoverflow code */

var abundancehtml = "<div id=\"yaxisholder\"></div><div id=\"plot\"></div>"

//arrays for all of the different functions
var abundanceFuns = [ normStackedBar, area, donuts ]

var phyloFuns = [ sunburst, rectangularTree, radialTree ]

var multidimFuns = [ parallel, scatter, splom, threeD ]

var visFuns = [ abundanceFuns, phyloFuns, multidimFuns ]

var allFuns = [ sunburst, rectangularTree, radialTree, normStackedBar, area, donuts, threeD, scatter, splom, parallel ]

var surveyStart = "<div id=\"surveyMonkeyInfo\" style=\"width:800px;font-size:10px;color:#666;\"><div><iframe id=\"sm_e_s\" src=\"http://www.surveymonkey.com/s/"
var surveyIDs = ['FLMWHYQ?c=','FLZ9N9J?c=','FVVSD3C?c='] //surveymonkey IDs for abundance, phylogeny and multidim surveys, respectively
var surveyEnd = "\" width=\"800\" height=\"300\" style=\"border:0px;padding-bottom:4px;\" frameborder=\"0\" allowtransparency=\"true\" ></iframe></div></div>"

var newURL = '';

// visType 0 1 2; abundance, phylogeny and multidim, respectively
var visType;
// visID corresponds to which visual representation is being shown from the chosen visType category
var visID;

/* This function builds the visualization and corresponding survey to go with it. Also employs functionality
for admin mode where the user can choose which visualization they see for testing purposes. */
function buildSurvey() {
	// if you supply a url with &admin=## at the end the user can choose which visualization to show
	if(urlParams['admin'])
	{
		visType = urlParams['admin'][0]
		visID =  urlParams['admin'][1]
		$("#dialog-confirm").remove()

		visFuns[visType][visID]();
	}else {
		var oldIDs = []
		// if this is the initial survey there will not be any old ids
		if(urlParams['ids'])
			oldIDs = urlParams['ids'].split('_')

		// always starts with all available visTypes
		var availableVisTypes = ['0', '1', '2']

		if(oldIDs.length < 3) // if length < 3 this user has NOT yet seen all 3 surveys
		{
			newURL = 'http://'
			var urlPieces = document.URL.split("/")

			// start at 2 to skip the http: and the empty between the first two // since we're splitting on slashes
			for(var i = 2; i < urlPieces.length - 1; i++)
				newURL += urlPieces[i]+'/'

			// make sure to carry the src and ids forward
			newURL +='?src='+urlParams['src']+'&u='+urlParams['u']+'&ids='

			for(var i in oldIDs)
			{
				availableVisTypes.splice(availableVisTypes.indexOf(oldIDs[i][0]),1) //remove the old visType so we don't show it again
				newURL += oldIDs[i]+'_' //keep track of old surveys in the URL
			}

			visType = availableVisTypes[Math.floor((Math.random()*availableVisTypes.length))] // choose among available visTypes left

			/* get new visID based on percentages of visIDs already seen using PHP
			if the user doesn't have webGL we can't choose the 3d plot*/
			$.post("getVisID.php", { visType: visType, hasWebGl: (webgl_support() != false) })
			    .done(function( data ) {
					// try to get visID from the returned value from PHP
					visID = parseInt(data);
					// if it doesn't give us a valid ID, just choose randomly
					if(isNaN(visID))
						visID = Math.floor((Math.random()*visFuns[visType].length));
					buildPage(visID);
			     });

		}
		else // user HAS seen all 3 surveys and now needs to do demographic questions
		{
			$("#visWrapper").remove()
			$("#nextSurvey").remove()
			$("#dialog-confirm").remove()
			var surveyHTML = surveyStart + 'FVDKBJX?c=' +"\" width=\"800\" height=\"1347\" style=\"border:0px;padding-bottom:4px;\" frameborder=\"0\" allowtransparency=\"true\" ></iframe></div></div>"
			document.getElementById('survey').innerHTML = surveyHTML
		}
	}
}

/* this function builds and inserts the whole page (visualization + survey) */
function buildPage(id) {
	visID = id

	// build surveymonkey custom URL
	var surveyID = surveyIDs[visType]+urlParams['u']+"_"+urlParams['src']+"_"+visType+visID
	var surveyHTML = surveyStart + surveyID + surveyEnd
	document.getElementById('survey').innerHTML = surveyHTML

	// build URL for next survey while keeping track of the current survey
	newURL += visType+''+visID

	// call fuction to build visualization
	visFuns[visType][visID]();
}

/* this function calls a PHP function to log relevant info about the survey that was taken */
function log(i, t) {
 $.post("record.php", { vis: true, visID: i, visType: t, id: urlParams['u'], src: urlParams['src']});
}

/* this function builds the URL for the surveymonkey iframe */
function buildSurveyHTML(visID) {
	var surveyID = urlParams['id']+"_"+urlParams['src']+"_1"+visID
	return surveyStart + surveyID + surveyEnd
}

/* this function calls a PHP function to log info about the survey that was just taken and shows the user
the next survey*/
function nextSurvey() {
	 $.post("record.php", { vis: true, visID: visID, visType: visType, id: urlParams['u'], src: urlParams['src']})
	 .done(function(data) {
	 	window.open(newURL, '_self');
	 });
}

/* from http://stackoverflow.com/questions/11871077/proper-way-to-detect-webgl-support */
function webgl_support() {
   try{
    var canvas = document.createElement( 'canvas' );
    return !! window.WebGLRenderingContext && (
         canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );
   }catch( e ) { return false; }
 };
 /* end stackoverflow code */

/* this funciton builds the sunburst visualization */
function sunburst() {
	s = new Sunburst("data/keyboard_mini.json")
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");
	s.initSunburst()
}

/* this function builds the rectangular tree visualization */
function rectangularTree() {
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");

	// for some reason the Newick.parse didn't like when I had this in a file so it is hard coded for this particular application
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

/* this function builds the radial tree visualization */
function radialTree() {
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");

	// for some reason the Newick.parse didn't like when I had this in a file so it is hard coded for this particular application
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

/* this function builds the normalized stacked bar visualization */
function normStackedBar() {
	s = new NormalizedStackedBar()
	d3.select("#visWrapper").html(abundancehtml)
	initAbundance()
}

/* this function builds the donut visualization */
function donuts() {
	s = new DonutCharts()
	d3.select("#visWrapper").html("<div id=\"yaxisholder\"></div><div id=\"donutplot\"></div>")
	initAbundance()
}

/* this function builds the area visualization */
function area() {
	s = new AreaChart()
	d3.select("#visWrapper").html(abundancehtml)
	initAbundance()
}

/* this function initializes the datafile for the abundance visualizations */
function initAbundance() {
  	queue()
  		.defer(d3.json, "data/subsubsetAG.biom")
  		.await(loadBiom);
}

/* this function loads a biom file */
function loadBiom(error, root) {
	s.setBiom(root)
}

/* this function builds the parallel coordinates visualization */
function parallel() {
	s = new ParallelCoordinates()
	initMultiDim()
}

/* this function builds the scatter plot matrix visualization */
function splom() {
	s = new Splom()
	initMultiDim()
}

/* this function builds the scatter plot visualization */
function scatter() {
	s = new Scatter()
	initMultiDim()
}

/* this function builds the 3d visualization */
function threeD() {
	s = new ThreeD();
	initMultiDim()
}

/* this function initializes some html holders and the datafile for the multidimensional visualizations */
function initMultiDim() {
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot")
		.attr("class", "plot");

	// the toggle is used to change the coloring of the multidimensional visualizations
	d3.select("#visWrapper").append("div")
		.attr("id", "toggleHolder");

	document.getElementById("toggleHolder").innerHTML = " <div id='colorBy'>Color by:<br><input type='radio' id='Individual' name='colorBy' checked='checked'><label for='Individual'>Individual</label><input type='radio' id='Environment' name='colorBy'><label for='Environment'>Environment</label></div><br>";

	$( "#colorBy" )
		.buttonset()
		.change(function( event ) {
			s.changeColors(event.target.id)
		});

  	queue()
  		.defer(d3.csv, "data/keyboard_realIDs.csv")
  		.await(loadMultiDim);
}
/* this function loads the datafile for multidimensional visualizations */
function loadMultiDim(error, root) {
	s.setData(root)
}

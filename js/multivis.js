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
var surveyStart = "<div id=\"surveyMonkeyInfo\" style=\"width:800px;font-size:10px;color:#666;\"><div><iframe id=\"sm_e_s\" src=\"https://www.surveymonkey.com/s/RSZFG6H?c="
var surveyEnd = "\" width=\"800\" height=\"300\" style=\"border:0px;padding-bottom:4px;\" frameborder=\"0\" allowtransparency=\"true\" ></iframe></div></div>"

function buildSurvey() {
	// var visID = Math.floor((Math.random()*3))
	var visID = 1
	abundanceFuns[visID]();

	var surveyHTML = buildSurveyHTML(visID)
	document.getElementById('survey').innerHTML = surveyHTML
}

function buildSurveyHTML(visID) {
	var surveyID = urlParams['id']+"_"+urlParams['src']+"_1"+visID
	console.log(surveyID)
	return surveyStart + surveyID + surveyEnd
}

function sunburst() {
	s = new Sunburst("sunburst/data/test.json")
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "sequence");
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");
	d3.select("#visWrapper").append("div")
		.attr("id", "text_width");
	// d3.select("#visWrapper").append("input")
	// 	.attr("type", "button")
	// 	.attr("value", "Zoom Out")
	// 	.attr("click", function() {s.zoomOut()});
	s.initSunburst()
}

function comparativeSunburst() {
	s = new ComparativeSunburst()
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot1")
		.attr("class", "plot");
	d3.select("#visWrapper").append("div")
		.attr("id", "plot2")
		.attr("class", "plot");

  	queue()
  		.defer(d3.json, "data/comp_small_1.json")
  		.defer(d3.json, "data/comp_small_2.json")
  		.await(function(error, r1, r2) { initComp(r1,r2) });
}

function treemap() {
	s = new Treemap("sunburst/data/test.json")
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");
	d3.select("#visWrapper").append("div")
		.attr("id", "text_width");
	s.initTreemap()
}

function partition() {
	s = new Partition("sunburst/data/test.json")
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").append("div")
		.attr("id", "plot");
	d3.select("#visWrapper").append("div")
		.attr("id", "text_width");
	s.initPartition()
}

function initComp(r1,r2) {
	s.setVals(r1,r2)
}

function stackedBar() {
	s = new StackedBar()
	initAbundance()
}

function normStackedBar() {
	s = new NormalizedStackedBar()
	initAbundance()
}

function groupedBar() {
	s = new GroupedBar()
	initAbundance()
}

function donuts() {
	s = new DonutCharts()
	initAbundance()
}

function area() {
	s = new AreaChart()
	initAbundance()
}

function initAbundance() {
	// d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
	d3.select("#visWrapper").html(abundancehtml)
  	queue()
  		.defer(d3.json, "data/current")
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
  	queue()
  		.defer(d3.csv, "data/multidimdata.csv")
  		.await(loadMultiDim);
}

function loadMultiDim(error, root) {
	s.setData(root)
}

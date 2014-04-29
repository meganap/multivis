/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 */

var s;
var abundancehtml = "<div id=\"breadcrumbs\"><ul><li id=\"classification0\" class=\"selected_classification\"><a href=\"javascript:s.changeLevel('0')\">Kingdom</a></li>        <li id=\"classification1\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('1')\">Phylum</a></li>        <li id=\"classification2\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('2')\">Class</a></li>        <li id=\"classification3\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('3')\">Order</a></li>        <li id=\"classification4\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('4')\">Family</a></li>        <li id=\"classification5\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('5')\">Genus</a></li>        <li id=\"classification6\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('6')\">Species</a></li>        </ul>    </div>    <div id=\"yaxisholder\"></div> <div id=\"plot\"></div>   <div id=\"options\">        <div id=\"sort_by\">            Sort By: <select id=\"sort_by_select\" onchange=\"javascript:s.sortChanged()\">            </select>        </div>        <br />        <div id=\"group_by\">            Group By: <select id=\"group_by_select\" onchange=\"javascript:s.groupChanged()\">            </select>        </div>        <div id=\"color_list\">        </div></div>"

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

function initAbundance() {
	d3.select("#visWrapper").selectAll("div").remove()//get rid of old plots
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

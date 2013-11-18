var s;
var abundancehtml = "<div id=\"breadcrumbs\"><ul><li id=\"classification0\" class=\"selected_classification\"><a href=\"javascript:s.changeLevel('0')\">Kingdom</a></li>        <li id=\"classification1\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('1')\">Phylum</a></li>        <li id=\"classification2\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('2')\">Class</a></li>        <li id=\"classification3\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('3')\">Order</a></li>        <li id=\"classification4\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('4')\">Family</a></li>        <li id=\"classification5\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('5')\">Genus</a></li>        <li id=\"classification6\" class=\"unselected_classification\"><a href=\"javascript:s.changeLevel('6')\">Species</a></li>        </ul>    </div>    <div id=\"plot\"></div>    <div id=\"options\">        <div id=\"sort_by\">            Sort By: <select id=\"sort_by_select\" onchange=\"javascript:s.sortChanged()\">            </select>        </div>        <br />        <div id=\"group_by\">            Group By: <select id=\"group_by_select\" onchange=\"javascript:s.groupChanged()\">            </select>        </div>        <div id=\"color_list\">        </div>    </div>"

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
  		.defer(d3.json, "sunburst/data/comptree1.json")
  		.defer(d3.json, "sunburst/data/comptree2.json")
  		.await(function(error, r1, r2) { initComp(r1,r2) });
}

function initComp(r1,r2) {
	s.setVals(r1,r2)
}

function stackedBar() {
	s = new StackedBar()
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
  		.defer(d3.json, "data/rich_sparse_otu_table.biom")
  		.await(loadBiom);
}

function loadBiom(error, root) {
	s.setBiom(root)
}

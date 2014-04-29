/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 * __adaptation__ = "EMPeror by Meg Pirrung, Yoshiki Vazquez Baeza and
                  Antonio Gonzalez Pena. EMPeror BSD 2013"
 */

function ThreeD() {
	/*global vars*/
	var data;
	var rainbow = new Rainbow();
	var color;
	var groups = [];
	var g_plotSpheres = {};
	var g_segments = 8, g_rings = 8, g_radius = .02;
	var g_xAxisLength;
	var g_yAxisLength;
	var g_zAxisLength;
	var g_xMaximumValue;
	var g_yMaximumValue;
	var g_zMaximumValue;
	var g_xMinimumValue;
	var g_yMinimumValue;
	var g_zMinimumValue;
	var g_maximum;
	var g_pc1Label;
	var g_pc2Label;
	var g_pc3Label;
	var g_number_of_custom_axes = 0;
	var xAxisIndex = 1;
	var yAxisIndex = 2;
	var zAxisIndex = 3;

	// sample identifiers of all items that are plotted
	var g_plotIds = [];

	// line objects used to represent the axes
	var g_xAxisLine;
	var g_yAxisLine;
	var g_zAxisLine;

	// general multipurpose variables
	var g_elementsGroup; // group that holds the plotted shapes
	var g_spheres = []; // group that holds spheres
	var g_genericSphere; // generic sphere used for plots
	var g_categoryName = ""; // current coloring category
	var g_sphereScaler = 1.0;
	var g_sceneCamera;

	this.setData = function(root) {
		data = root;

		//get all the axes
		var axes = d3.keys(data[0])
		//remove individual as an axis
		axes.splice(axes.indexOf('Individual'),1)

		data.forEach(function(sample){
			groups.push(sample.Individual.substring(0,11))
			sample.Individual = sample.Individual.substring(0,11)
			var temp = {}
			axes.forEach(function(d) {
				sample[d] = +sample[d]
			});
		});
		groups = dedupe(groups)
		rainbow.setSpectrum('green','blue','red','yellow')
		rainbow.setNumberRange(0,groups.length);

		setMinMaxVals();

		var plot = $('#plot');
		var particles, geometry, parameters, i, h, color;
		var mouseX = 0, mouseY = 0;

		var windowWidth = Math.min(document.getElementById('visWrapper').offsetWidth,document.getElementById('visWrapper').offsetHeight), view_angle = 40, view_near = 1, view_far = 10000;
		var winAspect = document.getElementById('visWrapper').offsetWidth/document.getElementById('visWrapper').offsetHeight;

		// Detecting that webgl is activated
		if ( !window.WebGLRenderingContext ) {
			window.location = "http://get.webgl.org";
		} else {
			init();
			animate();
		}

		function init() {
			d3.select("#visWrapper").append("div")
			  .attr("id", "axislabels")
			  .attr("class", "axislabels");

			// assign a position to the camera befor associating it with other
			// objects, else the original position will be lost and not make sense
			g_sceneCamera = new THREE.PerspectiveCamera(view_angle, winAspect, view_near, view_far);

			g_sceneCamera.aspect = document.getElementById('visWrapper').offsetWidth/document.getElementById('visWrapper').offsetHeight;
			g_sceneCamera.rotation.set( 0, 0, 0 );
			g_sceneCamera.updateProjectionMatrix();
			g_sceneCamera.position.set(0 , 0, (g_maximum*4.8) + g_radius);

			$('#plot canvas').attr('width',document.getElementById('visWrapper').offsetWidth);
			$('#plot canvas').attr('height',document.getElementById('visWrapper').offsetHeight);
			// $('#plot canvas').attr('width',500);
			// $('#plot canvas').attr('height',500);

			g_mainScene = new THREE.Scene();
			g_mainScene.add(g_sceneCamera);


			g_genericSphere = new THREE.SphereGeometry(g_radius, g_segments, g_rings);
			g_elementsGroup = new THREE.Object3D();
			g_mainScene.add(g_elementsGroup);

			drawSpheres();

			// the light is attached to the camera to provide a 3d perspective
			g_sceneLight = new THREE.DirectionalLight(0x999999, 2);
			g_sceneLight.position.set(1,1,1).normalize();
			g_sceneCamera.add(g_sceneLight);

			// Adding camera
			g_sceneControl = new THREE.TrackballControls(g_sceneCamera, document.getElementById('plot'));
			g_sceneControl.rotateSpeed = 1.0;
			g_sceneControl.zoomSpeed = 1.2;
			g_sceneControl.panSpeed = 0.8;
			g_sceneControl.noZoom = false;
			g_sceneControl.noPan = false;
			g_sceneControl.staticMoving = true;
			g_sceneControl.dynamicDampingFactor = 0.3;
			g_sceneControl.keys = [ 65, 83, 68 ];

			// white is the default background color for the scene
			var rendererBackgroundColor = new THREE.Color();
			rendererBackgroundColor.setHex("0xffffff");

			// renderer, the default background color is white
			g_mainRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });

			g_mainRenderer.setClearColor(rendererBackgroundColor, 1);
			g_mainRenderer.setSize( document.getElementById('visWrapper').offsetWidth, document.getElementById('visWrapper').offsetHeight );
			g_mainRenderer.sortObjects = true;
			plot.append(g_mainRenderer.domElement);

			colorSpheres();
			drawAxisLines();
			buildAxisLabels();
			resetCamera();
		}

		function animate() {
			requestAnimationFrame( animate );
			render();

			var labelCoordinates;
			// reposition the labels for the axes in the 3D plot
			labelCoordinates = toScreenXY(new THREE.Vector3(g_xMaximumValue, g_yMinimumValue, g_zMinimumValue), g_sceneCamera, $('#plot'));
			$("#pc1_label").css('left', labelCoordinates['x'])
			$("#pc1_label").css('top', labelCoordinates['y'])
			labelCoordinates = toScreenXY(new THREE.Vector3(g_xMinimumValue, g_yMaximumValue, g_zMinimumValue), g_sceneCamera, $('#plot'));
			$("#pc2_label").css('left', labelCoordinates['x'])
			$("#pc2_label").css('top', labelCoordinates['y'])
			labelCoordinates = toScreenXY(new THREE.Vector3(g_xMinimumValue, g_yMinimumValue, g_zMaximumValue), g_sceneCamera, $('#plot'));
			$("#pc3_label").css('left', labelCoordinates['x'])
			$("#pc3_label").css('top', labelCoordinates['y'])
		}

		function render() {
			g_sceneControl.update();
			// g_mainRenderer.setSize( document.getElementById('visWrapper').offsetWidth, document.getElementById('visWrapper').offsetHeight );
			g_mainRenderer.render( g_mainScene, g_sceneCamera );
		}

		/*This function recenter the camera to the initial position it had*/
		function resetCamera() {
			// We need to reset the camera controls first before modifying the values of the camera (this is the reset view!)
			// g_sceneControl.reset();

			// g_sceneCamera.aspect = 1;
			// g_sceneCamera.rotation.set( 0, 0, 0 );
			// g_sceneCamera.updateProjectionMatrix();
		}

		function drawSpheres() {
			data.forEach(function(d) {
				//draw ball
				var mesh = new THREE.Mesh( g_genericSphere, new THREE.MeshLambertMaterial() );
				mesh.material.color = new THREE.Color()
				mesh.material.transparent = true;
				mesh.material.depthWrite = false;
				mesh.material.opacity = 1;
				mesh.position.set(d[xAxisIndex], d[yAxisIndex], d[zAxisIndex]);
				mesh.updateMatrix();
				mesh.matrixAutoUpdate = true;
				g_mainScene.add( mesh );
				var obj = { 'mesh': mesh, 'obj': d };
				g_spheres.push( obj );
			});
		}

		function colorSpheres() {
			g_spheres.forEach(function(d){
				d.mesh.material.color.setHex('0x'+rainbow.colorAt(groups.indexOf(d.obj.Individual)))
			})
		}

		function setMinMaxVals() {
			g_xMaximumValue = d3.max(data, function(d){
				return d[xAxisIndex]
			});
			g_yMaximumValue = d3.max(data, function(d){
				return d[yAxisIndex]
			});
			g_zMaximumValue = d3.max(data, function(d){
				return d[zAxisIndex]
			});
			g_xMinimumValue = d3.min(data, function(d){
				return d[xAxisIndex]
			});
			g_yMinimumValue = d3.min(data, function(d){
				return d[yAxisIndex]
			});
			g_zMinimumValue = d3.min(data, function(d){
				return d[zAxisIndex]
			});

			g_xAxisLength = g_xMaximumValue - g_xMinimumValue;
			g_yAxisLength = g_yMaximumValue - g_yMinimumValue;
			g_zAxisLength = g_zMaximumValue - g_zMinimumValue;

			g_maximum = d3.max([g_xMaximumValue,g_yMaximumValue,g_zMaximumValue]);
		}

		function drawAxisLines() {
			// removing axes, if they do not exist the scene doesn't complain
			// g_mainScene.remove(g_xAxisLine);
			// g_mainScene.remove(g_yAxisLine);
			// g_mainScene.remove(g_zAxisLine);


			// one line for each of the axes
			g_xAxisLine = makeLine([g_xMinimumValue, g_yMinimumValue, g_zMinimumValue],
				[g_xMaximumValue, g_yMinimumValue, g_zMinimumValue], '0x000000', 3);
			g_yAxisLine = makeLine([g_xMinimumValue, g_yMinimumValue, g_zMinimumValue],
				[g_xMinimumValue, g_yMaximumValue, g_zMinimumValue], '0x000000', 3);
			g_zAxisLine = makeLine([g_xMinimumValue, g_yMinimumValue, g_zMinimumValue],
				[g_xMinimumValue, g_yMinimumValue, g_zMaximumValue], '0x000000', 3);

			// axes shouldn't be transparent
			g_xAxisLine.material.transparent = false;
			g_yAxisLine.material.transparent = false;
			g_zAxisLine.material.transparent = false;

			g_mainScene.add(g_xAxisLine)
			g_mainScene.add(g_yAxisLine)
			g_mainScene.add(g_zAxisLine)
		}

		/*Utility function to draw two-vertices lines at a time

		  This function allows you to create a line with only two vertices i. e. the
		  start point and the end point, plus the color and width of the line. The
		  start and end point must be 3 elements array. The color must be a hex-string
		  or a hex number.
		*/
		function makeLine(coords_a, coords_b, color, width){
			// based on the example described in:
			// https://github.com/mrdoob/three.js/wiki/Drawing-lines
			var material, geometry, line;

			// make the material transparent and with full opacity
			material = new THREE.LineBasicMaterial({color:color, linewidth:width});
			material.matrixAutoUpdate = true;
			material.transparent = true;
			material.opacity = 1.0;

			// add the two vertices to the geometry
			geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(coords_a[0], coords_a[1], coords_a[2]));
			geometry.vertices.push(new THREE.Vector3(coords_b[0], coords_b[1], coords_b[2]));

			// the line will contain the two vertices and the described material
			line = new THREE.Line(geometry, material);

			return line;
		}

		/*Builds the axes labels from ground up after changing the axes*/
		function buildAxisLabels() {
			g_pc1Label = "Axis "+xAxisIndex
			g_pc2Label = "Axis "+yAxisIndex
			g_pc3Label = "Axis "+zAxisIndex

			//build axis labels
			var axislabelhtml = "";
			var xcoords = toScreenXY(new THREE.Vector3(g_xMaximumValue, g_yMinimumValue, g_zMinimumValue),g_sceneCamera,$('#plot'));
			axislabelhtml += "<label id=\"pc1_label\" class=\"unselectable labels\" style=\"position:absolute; left:"+parseInt(xcoords['x'])+"px; top:"+parseInt(xcoords['y'])+"px;\">";
			axislabelhtml += g_pc1Label;
			axislabelhtml += "</label>";
			var ycoords = toScreenXY(new THREE.Vector3(g_xMinimumValue, g_yMaximumValue, g_zMinimumValue),g_sceneCamera,$('#plot'));
			axislabelhtml += "<label id=\"pc2_label\" class=\"unselectable labels\" style=\"position:absolute; left:"+parseInt(ycoords['x'])+"px; top:"+parseInt(ycoords['y'])+"px;\">";
			axislabelhtml += g_pc2Label;
			axislabelhtml += "</label>";
			var zcoords = toScreenXY(new THREE.Vector3(g_xMinimumValue, g_yMinimumValue, g_zMaximumValue),g_sceneCamera,$('#plot'));
			axislabelhtml += "<label id=\"pc3_label\" class=\"unselectable labels\" style=\"position:absolute; left:"+parseInt(zcoords['x'])+"px; top:"+parseInt(zcoords['y'])+"px;\">";
			axislabelhtml += g_pc3Label;
			axislabelhtml += "</label>";
			document.getElementById("axislabels").innerHTML = axislabelhtml;
		}

		/*This function finds the screen coordinates of any position in the current plot.

		  The main purpose of this function is to be used for calculating the placement
		  of the labels.
		*/
		function toScreenXY( position, camera, jqdiv ) {

			var screenPosition = position.clone();
			var screenProjectionMatrix = new THREE.Matrix4();

			// multiply the matrices and aply the vector to the projection matrix
			screenProjectionMatrix.multiplyMatrices( camera.projectionMatrix,
				camera.matrixWorldInverse );
			screenPosition.applyProjection(screenProjectionMatrix);
			return { x: (screenPosition.x + 1)*jqdiv.width()/2 + jqdiv.offset().left,
				y: (-screenPosition.y+1)*jqdiv.height()/2 + jqdiv.offset().top};
		}

		// Taken from http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
		function isNumeric(n) {
		  return !isNaN(parseFloat(n)) && isFinite(n);
		}

	  	function dedupe(list) {
	  	   var set = {};
	  	   for (var i = 0; i < list.length; i++)
	  	      set[list[i]] = true;
	  	   list = [];
	  	   for (var v in set)
	  	      list.push(v);
	  	   return list;
	  	}
	}
}
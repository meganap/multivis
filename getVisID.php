<?php
$visType = $_POST['visType'];
// $hasWebGL = $_POST['hasWebGl'];
// get the log file for the current visType
$file = 'log/' . $visType . '.txt';
$current = fopen($file, "r");

// if the user doesn't have webGL the 3d plot is not available to choose from
// if($hasWebGL)
	$availableIDArray = [[0,1,2], [0,1,2], [0,1,2,3]];
// else
	// $availableIDArray = [[0,1,2], [0,1,2], [0,1,2]];

// already got the visType from the javascript, choose the available IDs array that corresponds to that visType
$availableIDs = $availableIDArray[$visType];
// visCounts holds the current counts of visualizations that have been seen
$visCounts = [];

$data = file_get_contents($file);
$lines = preg_split('/[\n]/', $data);

// set all counts to 0
for($i = 0; $i < sizeof($availableIDs); $i++)
	$visCounts[$i] = 0;

// count the times each visID has been seen
for($i = 0; $i < sizeof($lines); $i++) {
	$visID = preg_split('/[\t]/', $lines[$i])[1];
	$visCounts[$visID]++;
}

/* $ratios holds the opposite proportion of counts of each visID, we need 400
to take each survey, but not see each visID, so each count is out of a total
400 */
$ratios = [];

for($i = 0; $i < sizeof($availableIDs); $i++)
	$ratios[$i] = 1 - $visCounts[$i]/400;

/* $probabilities holds the probability that each visID has of being chosen
this is determined by how many times the other visIDs have been seen, we want
approximately equal distribution*/
$probabilities = [];
$sum = array_sum($ratios);

for($i = 0; $i < sizeof($ratios); $i++)
	$probabilities[$i] = round(($ratios[$i]/$sum)*100);

/* weighted_random will choose a random value based on a supplied non normal
distribution */
echo weighted_random($availableIDs, $probabilities);

/* from http://stackoverflow.com/questions/10914678/get-result-based-on-probability-distribution */
function weighted_random($values, $weights){
    $count = count($values);
    $i = 0;
    $n = 0;
    $num = rand(0, array_sum($weights));
    while($i < $count){
        $n += $weights[$i];
        if($n >= $num){
            break;
        }
        $i++;
    }
    return $values[$i];
}
?>
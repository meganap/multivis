<?php
$visType = $_POST['visType'];
$file = 'log/' . $visType . '.txt';
$current = fopen($file, "r");

$availableIDArray = [[0,1,2], [0,1,2], [0,1,2,3]];
$availableIDs = $availableIDArray[$visType];
$visCounts = [];

$data = file_get_contents($file);
$lines = preg_split('/[\n]/', $data);

//set all counts to 0
for($i = 0; $i < sizeof($availableIDs); $i++)
	$visCounts[$i] = 0;

for($i = 0; $i < sizeof($lines); $i++) {
	$visID = preg_split('/[\t]/', $lines[$i])[1];
	$visCounts[$visID]++;
}

$ratios = [];

for($i = 0; $i < sizeof($availableIDs); $i++)
	$ratios[$i] = 1 - $visCounts[$i]/400;

$probabilities = [];
$sum = array_sum($ratios);

for($i = 0; $i < sizeof($ratios); $i++)
	$probabilities[$i] = round(($ratios[$i]/$sum)*100);

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
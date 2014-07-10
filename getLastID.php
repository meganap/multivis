<?php
$file = 'log/consent.txt';
$current = fopen($file, "r");

if(flock($current, LOCK_EX)) {
	$data = file_get_contents($file);
	$lines = preg_split('/[\n]/', $data);
	$lastLine = array_pop($lines);
	$lastID = intval(preg_split('/[\t]/', $lastLine)[0]);
	echo (int) $lastID;
	flock($current, LOCK_UN);
} else {
	echo 'can\'t lock';
}

fclose($current);
?>
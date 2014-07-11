<?php
$file = 'log/consent.txt';
$current = fopen($file, "r");
date_default_timezone_set('America/Denver');
$date = date('m/d/Y h:i:s a');

if(flock($current, LOCK_EX)) {
	$data = file_get_contents($file);
	$lines = preg_split('/[\n]/', $data);
	echo hash('adler32', sizeof($lines)+$_POST['url']+$date);
	flock($current, LOCK_UN);
} else {
	echo 'can\'t lock';
}

fclose($current);
?>
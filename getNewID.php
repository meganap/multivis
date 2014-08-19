<?php
// open consent log file
$file = 'log/consent.txt';
date_default_timezone_set('America/Denver');
$date = date('m/d/Y h:i:s a');

$current = fopen($file, "r");

// make sure it's not currently being used
if(! flock($current, LOCK_EX))
	sleep(2);

$data = file_get_contents($file);
$lines = preg_split('/[\n]/', $data);
// create a new ID which is a hash of some values so that IDs do not intersect
echo hash('adler32', sizeof($lines)+$_POST['url']+$date+rand(0, sizeof($lines)+50));
flock($current, LOCK_UN);
fclose($current);
?>
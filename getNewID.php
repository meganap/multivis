/*
 * __author__ = "Meg Pirrung"
 * __copyright__ = "Copyright 2014, multivis"
 * __credits__ = ["Meg Pirrung"]
 * __license__ = "MIT"
 */
<?php
$file = 'log/consent.txt';
date_default_timezone_set('America/Denver');
$date = date('m/d/Y h:i:s a');

$current = fopen($file, "r");

if(! flock($current, LOCK_EX))
	sleep(2);

$data = file_get_contents($file);
$lines = preg_split('/[\n]/', $data);
echo hash('adler32', sizeof($lines)+$_POST['url']+$date);
flock($current, LOCK_UN);
fclose($current);
?>
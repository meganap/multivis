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
echo v4();
flock($current, LOCK_UN);
fclose($current);

/* from http://stackoverflow.com/questions/12270604/creating-collision-free-random-string */
function v4()
{
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',

      // 32 bits for "time_low"
      mt_rand(0, 0xffff), mt_rand(0, 0xffff),

      // 16 bits for "time_mid"
      mt_rand(0, 0xffff),

      // 16 bits for "time_hi_and_version",
      // four most significant bits holds version number 4
      mt_rand(0, 0x0fff) | 0x4000,

      // 16 bits, 8 bits for "clk_seq_hi_res",
      // 8 bits for "clk_seq_low",
      // two most significant bits holds zero and one for variant DCE1.1
      mt_rand(0, 0x3fff) | 0x8000,

      // 48 bits for "node"
      mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
?>
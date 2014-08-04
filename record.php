<?php
$user_agent     =   $_SERVER['HTTP_USER_AGENT'];

/* from http://stackoverflow.com/questions/2142030/any-php-code-to-detect-the-browser-with-version-and-operating-system */
function browser() {
    $ua = strtolower($_SERVER['HTTP_USER_AGENT']);
    // you can add different browsers with the same way ..
    if(preg_match('/(chromium)[ \/]([\w.]+)/', $ua))
            $browser = 'chromium';
    elseif(preg_match('/(chrome)[ \/]([\w.]+)/', $ua))
            $browser = 'chrome';
    elseif(preg_match('/(safari)[ \/]([\w.]+)/', $ua))
            $browser = 'safari';
    elseif(preg_match('/(opera)[ \/]([\w.]+)/', $ua))
            $browser = 'opera';
    elseif(preg_match('/(msie)[ \/]([\w.]+)/', $ua))
            $browser = 'msie';
    elseif(preg_match('/(mozilla)[ \/]([\w.]+)/', $ua))
            $browser = 'mozilla';

    preg_match('/('.$browser.')[ \/]([\w]+)/', $ua, $version);

    return array($browser,$version[2], 'name'=>$browser,'version'=>$version[2]);
}

/* from http://stackoverflow.com/questions/18070154/get-operating-system-info-with-php */
function getOS() {
	global $user_agent;

    $os_platform    =   'Unknown OS Platform';

    $os_array       =   array(
                            '/windows nt 6.2/i'     =>  'Windows 8',
                            '/windows nt 6.1/i'     =>  'Windows 7',
                            '/windows nt 6.0/i'     =>  'Windows Vista',
                            '/windows nt 5.2/i'     =>  'Windows Server 2003/XP x64',
                            '/windows nt 5.1/i'     =>  'Windows XP',
                            '/windows xp/i'         =>  'Windows XP',
                            '/windows nt 5.0/i'     =>  'Windows 2000',
                            '/windows me/i'         =>  'Windows ME',
                            '/win98/i'              =>  'Windows 98',
                            '/win95/i'              =>  'Windows 95',
                            '/win16/i'              =>  'Windows 3.11',
                            '/macintosh|mac os x/i' =>  'Mac OS X',
                            '/mac_powerpc/i'        =>  'Mac OS 9',
                            '/linux/i'              =>  'Linux',
                            '/ubuntu/i'             =>  'Ubuntu',
                            '/iphone/i'             =>  'iPhone',
                            '/ipod/i'               =>  'iPod',
                            '/ipad/i'               =>  'iPad',
                            '/android/i'            =>  'Android',
                            '/blackberry/i'         =>  'BlackBerry',
                            '/webos/i'              =>  'Mobile'
                        );

    foreach ($os_array as $regex => $value) {

        if (preg_match($regex, $user_agent)) {
            $os_platform    =   $value;
        }

    }

    return $os_platform;

}

date_default_timezone_set('America/Denver');
$id = $_POST['id'];
$visID = $_POST['visID'];
$date = date('m/d/Y h:i:s a');
$b = browser();
$os = getOS();
$src = $_POST['src'];

// build log line with user ID, visualization ID, date, browser:browser version, operating system and source
$line = "\n" . $id . "\t" .  $visID . "\t" . $date . "\t" . $b[0] . ":" . $b[1] . "\t" . $os . "\t" . $src;

if($_POST['consent']) // consent given
	$file = 'log/consent.txt';
elseif($_POST['vis'])
	$file = 'log/' . $_POST['visType'] . '.txt';

file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
?>

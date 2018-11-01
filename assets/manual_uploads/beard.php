<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header('Content-type: image/jpeg');

// get a start date (or use my own as default)
if (isset($_GET['start'])) {
	if (preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/",$_GET['start'])) {
		$start_time = strtotime($_GET['start']);
	} else {
		$start_time = strtotime("2014-10-31");
	}
} else { $start_time = strtotime("2014-10-31"); }

$now = time(); // or your date as well
$your_date = $start_time;
$datediff = $now - $your_date;
$num_of_days = "Day ".floor($datediff/(60*60*24));
$num_of_weeks = "Week ".floor($datediff/(60*60*24*7));

// display weeks or days ? weeks by default
if(isset($_GET['display'])) {
	if ($_GET['display']=="days") {
		$display = $num_of_days;
	} else {
		$display = $num_of_weeks;
	}
} else { $display = $num_of_weeks; }

// display a username. Display terminaladdict be default
if(isset($_GET['name'])) {
	$name = htmlspecialchars($_GET['name']);
} else {
	$name = "TerminalAddict";
}

function imagettfstroketext(&$image, $size, $angle, $x, $y, &$textcolor, &$strokecolor, $fontfile, $text, $px) {
	for($c1 = ($x-abs($px)); $c1 <= ($x+abs($px)); $c1++)
		for($c2 = ($y-abs($px)); $c2 <= ($y+abs($px)); $c2++)
			$bg = imagettftext($image, $size, $angle, $c1, $c2, $strokecolor, $fontfile, $text);
	return imagettftext($image, $size, $angle, $x, $y, $textcolor, $fontfile, $text);
}

$rImg = ImageCreateFromJPEG( "beard_journey_blank.jpg" );
$white = imagecolorallocate($rImg, 245, 245, 221);
$orange = imagecolorallocate($rImg, 231, 70, 8);
$black = imagecolorallocate($rImg, 35, 31, 32);

$fontcorps= './Font_Corps.ttf';
$zerothree= './zerothree.ttf';
imagettftext($rImg, 16, 0, 185, 74, $white, $fontcorps, $display);
// imagettftext($rImg, 20, 4, 140, 110, $orange, $font, $name);
imagettfstroketext($rImg, 20, 4, 140, 40, $orange, $black, $zerothree, $name, 2);
imagejpeg($rImg,NULL,100);
imagedestroy($rImg);
?>

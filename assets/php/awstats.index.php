
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>
    <title>Awstats</title>
    <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'>
    <meta name='description' content='Awstats for websites hosted on Net Enterprises Ltd' />
</head>
<body>

<div class='container-fluid pt-5'>
    <div class='container'>
        <div class='row'>
            <div class='col-md-12'>
                <h3>Stuff found in this directory</h3>
                <ul class='list-unstyled'>
<?php
$dir = '.';
$files = scandir($dir);
$excludes = Array('.', '..', 'index.php');

foreach($files as $file) {
    if(!in_array($file, $excludes)) {
        echo '                  <li class=\'p-3\'><a data-toggle=\'tooltip\' data-original-title=\''.$file.'\' data-placement=\'bottom\' href=\''.$file.'\' class=\'btn btn-primary btn-lg\'>'.$file.'</a></li>' . PHP_EOL;
    }
}
?>
                </ul>
            </div>
        </div>
    </div>
</div>
<script src='https://code.jquery.com/jquery-3.5.1.slim.min.js'></script>
<script src='https://unpkg.com/@popperjs/core@2'></script>
<script src='https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'></script>
</body>
</html>


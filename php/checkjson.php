<?php
    header('Content-type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST');
    ini_set('display_errors',1);
    ini_set('display_startup_errors',1);
    error_reporting(1);
    $e = json_decode(file_get_contents("http://192.99.124.166:8080/"),1);
    echo json_encode($e,JSON_PRETTY_PRINT);
?>

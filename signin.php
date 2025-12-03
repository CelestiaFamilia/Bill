<?php 
session_start();
require_once 'config.php';

if(isset($_POST[''])){
    $email = $_POST[''];
    $passowrd = $_POST[''];
}
$hash_password = ('sha256'.$password);

$check_email = $conn->query("SELECT email FROM users WHERE email = '$email'");
if ($check_email->num_rows > 0){

 
}



?>
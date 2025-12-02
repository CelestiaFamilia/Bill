<?php
declare(strict_types=1);
session_start();

/* DATABASE CONFIG */
$host = "localhost";
$user = "root";
$pass = "";
$db   = "final_project";

/* CONNECT */
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    header("Location: index.html?error=server");
    exit();
}

/* INPUT CHECK */
if (!isset($_POST['email'], $_POST['password'])) {
    header("Location: index.html?error=missing");
    exit();
}

$email = trim($_POST['email']);
$pass  = trim($_POST['password']);

/* EMPTY CHECK */
if ($email === "" || $pass === "") {
    header("Location: index.html?error=empty");
    exit();
}

/* EMAIL FORMAT */
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header("Location: index.html?error=email");
    exit();
}

/* FETCH USER */
$stmt = $conn->prepare(
    "SELECT id, email, password_hash, salt
     FROM users
     WHERE email = ?
     LIMIT 1"
);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

/* VERIFY */
if ($row = $result->fetch_assoc()) {

    $hash = hash("sha256", $row['salt'] . $pass);

    if (hash_equals($row['password_hash'], $hash)) {

        session_regenerate_id(true);
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['email']   = $row['email'];
        $_SESSION['logged']  = true;

        header("Location: home.html");
        exit();

    } else {
        header("Location: index.html?error=wrongpassword");
        exit();
    }

} else {
    header("Location: index.html?error=notfound");
    exit();
}

/* CLOSE */
$stmt->close();
$conn->close();


?>
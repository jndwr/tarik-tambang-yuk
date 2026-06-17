<?php
/**
 * API papan skor "Tarik Tambang Yuk!"
 * - GET                     : kembalikan seluruh papan skor (JSON, urut terbaik)
 * - POST {name,stage,points,tier} : tambah skor, simpan ke leaderboard.json, kembalikan papan terbaru
 * - POST ?action=clear      : kosongkan papan skor
 *
 * Data disimpan di file leaderboard.json (folder yang sama).
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$file = __DIR__ . '/leaderboard.json';

function read_lb($file) {
    if (!file_exists($file)) return [];
    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

function sort_lb(&$lb) {
    usort($lb, function ($a, $b) {
        $ds = ($b['stage'] ?? 0) - ($a['stage'] ?? 0);
        if ($ds !== 0) return $ds;
        return ($b['points'] ?? 0) - ($a['points'] ?? 0);
    });
}

// Kosongkan papan
if (isset($_GET['action']) && $_GET['action'] === 'clear') {
    @file_put_contents($file, "[]");
    echo "[]";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $lb = read_lb($file);

    if (is_array($body) && isset($body['points'])) {
        $lb[] = [
            'name'   => mb_substr(trim((string)($body['name'] ?? 'Anak Hebat')), 0, 14),
            'stage'  => max(0, min(5, intval($body['stage'] ?? 0))),
            'points' => max(0, intval($body['points'] ?? 0)),
            'tier'   => preg_replace('/[^a-z]/', '', (string)($body['tier'] ?? 'normal')),
            'date'   => round(microtime(true) * 1000),
        ];
        sort_lb($lb);
        $lb = array_slice($lb, 0, 50);
        @file_put_contents($file, json_encode($lb, JSON_UNESCAPED_UNICODE));
    }
    echo json_encode($lb, JSON_UNESCAPED_UNICODE);
    exit;
}

// GET default
$lb = read_lb($file);
sort_lb($lb);
echo json_encode($lb, JSON_UNESCAPED_UNICODE);

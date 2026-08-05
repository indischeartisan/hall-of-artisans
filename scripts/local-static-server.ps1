$root = Join-Path $PSScriptRoot "..\dist"
$server = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 4173)
$server.Start()

while ($true) {
    $client = $server.AcceptTcpClient()
    try {
        $stream = $client.GetStream()
        $reader = [System.IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
        $requestLine = $reader.ReadLine()
        while (($line = $reader.ReadLine()) -ne '') {
            if ($null -eq $line) { break }
        }

        $target = ($requestLine -split ' ')[1]
        $relative = [Uri]::UnescapeDataString(($target -split '\?')[0]).TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
        $file = Join-Path $root $relative
        if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { $file = Join-Path $root 'index.html' }

        $bytes = [IO.File]::ReadAllBytes($file)
        $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
        $mime = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.js' { 'text/javascript' }
            '.css' { 'text/css' }
            '.svg' { 'image/svg+xml' }
            '.png' { 'image/png' }
            '.jpg' { 'image/jpeg' }
            '.woff2' { 'font/woff2' }
            default { 'application/octet-stream' }
        }
        $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
        $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($bytes, 0, $bytes.Length)
    }
    finally {
        $client.Close()
    }
}

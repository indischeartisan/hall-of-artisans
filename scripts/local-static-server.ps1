$source = @'
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

public static class LocalStaticServer
{
    private static readonly Dictionary<string, string> MimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { ".html", "text/html; charset=utf-8" },
        { ".js", "text/javascript; charset=utf-8" },
        { ".css", "text/css; charset=utf-8" },
        { ".json", "application/json; charset=utf-8" },
        { ".svg", "image/svg+xml" },
        { ".png", "image/png" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".webp", "image/webp" },
        { ".ico", "image/x-icon" },
        { ".woff", "font/woff" },
        { ".woff2", "font/woff2" }
    };

    public static void Run(string root, int port)
    {
        root = Path.GetFullPath(root);
        var listener = new TcpListener(IPAddress.Loopback, port);
        listener.Start();

        while (true)
        {
            var client = listener.AcceptTcpClient();
            Task.Run(() => HandleClient(client, root));
        }
    }

    private static void HandleClient(TcpClient client, string root)
    {
        using (client)
        {
            client.ReceiveTimeout = 3000;
            client.SendTimeout = 10000;

            try
            {
                using (var stream = client.GetStream())
                using (var reader = new StreamReader(stream, Encoding.ASCII, false, 1024, true))
                {
                    stream.ReadTimeout = 3000;
                    var requestLine = reader.ReadLine();
                    if (String.IsNullOrWhiteSpace(requestLine)) return;

                    string header;
                    do { header = reader.ReadLine(); } while (!String.IsNullOrEmpty(header));

                    var parts = requestLine.Split(' ');
                    if (parts.Length < 2) return;

                    var path = Uri.UnescapeDataString(parts[1].Split('?')[0]).TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                    if (String.IsNullOrWhiteSpace(path)) path = "index.html";

                    var file = Path.GetFullPath(Path.Combine(root, path));
                    if (!file.StartsWith(root, StringComparison.OrdinalIgnoreCase) || !File.Exists(file))
                        file = Path.Combine(root, "index.html");

                    var bytes = File.ReadAllBytes(file);
                    string mime;
                    if (!MimeTypes.TryGetValue(Path.GetExtension(file), out mime)) mime = "application/octet-stream";

                    var responseHeader = String.Format(
                        "HTTP/1.1 200 OK\r\nContent-Type: {0}\r\nContent-Length: {1}\r\nCache-Control: no-cache\r\nConnection: close\r\n\r\n",
                        mime, bytes.Length);
                    var headerBytes = Encoding.ASCII.GetBytes(responseHeader);
                    stream.Write(headerBytes, 0, headerBytes.Length);
                    stream.Write(bytes, 0, bytes.Length);
                }
            }
            catch (IOException) { }
            catch (SocketException) { }
        }
    }
}
'@

Add-Type -TypeDefinition $source -Language CSharp
$root = Join-Path $PSScriptRoot '..\dist'
[LocalStaticServer]::Run($root, 4173)

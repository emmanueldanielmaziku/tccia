import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Print Attachment</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; }
  iframe {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    border: none;
  }
</style>
</head>
<body>
<iframe id="doc-frame" src="${url.replace(/"/g, '&quot;')}"></iframe>
<script>
  const iframe = document.getElementById('doc-frame');
  iframe.onload = function() {
    setTimeout(function() {
      window.print();
      window.addEventListener('afterprint', function() {
        window.close();
      });
    }, 1500);
  };
  // Fallback: trigger print after timeout even if iframe load event doesn't fire
  setTimeout(function() {
    window.print();
    window.addEventListener('afterprint', function() {
      window.close();
    });
  }, 4000);
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}

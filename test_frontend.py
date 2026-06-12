import urllib.request
try:
    resp = urllib.request.urlopen('http://frontend:3000/', timeout=5)
    print(f"Status: {resp.status}")
    print(f"Headers: {dict(resp.headers)}")
    body = resp.read()
    print(f"Body length: {len(body)}")
    print(f"Body preview: {body[:500]}")
except Exception as e:
    print(f"Error: {e}")

import urllib.request, json

base = 'http://localhost:8000/api/v1'

print('=== 1. Forgot password ===')
data = json.dumps({'email': 'test3@test.com'}).encode()
req = urllib.request.Request(base + '/auth/forgot-password', data=data, headers={'Content-Type': 'application/json'})
r = urllib.request.urlopen(req)
print(f'Status: {r.status}')
print(f'Response: {json.loads(r.read())}')

print('\n=== 2. Forgot password avec email inexistant ===')
data = json.dumps({'email': 'inexistant@test.com'}).encode()
req = urllib.request.Request(base + '/auth/forgot-password', data=data, headers={'Content-Type': 'application/json'})
r = urllib.request.urlopen(req)
print(f'Status: {r.status}')
print(f'Response: {json.loads(r.read())}')

print('\n=== 3. Reset avec token invalide ===')
data = json.dumps({'token': 'faux-token-123', 'new_password': 'test123'}).encode()
try:
    r = urllib.request.urlopen(urllib.request.Request(base + '/auth/reset-password', data=data, headers={'Content-Type': 'application/json'}))
    print('ERREUR: aurait du retourner 400')
except urllib.error.HTTPError as e:
    print(f'Status: {e.code}')
    print(f'Response: {json.loads(e.read())}')

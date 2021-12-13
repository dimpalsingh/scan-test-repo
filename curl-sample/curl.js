const { execPath } = require("process");

var cmd = 'curl -H "Authorization: OAuth eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IldlbGNvbWVAMTIzIiwibmFtZSI6IkRpbXBhbCBTaW5naCIsImlhdCI6MTYzOTQwMTY4Mn0.heW-UDQBUS-pB04d18ty7x5-XUUC2RbXcvL5R1nf6CXF42xNsTXX8ROF4LyuJzB-wzvdxp_F0-R-3oaUA_O6YQ" http://www.example.com';
var scanResult = await execP(cmd, {maxBuffer: 1024 * 1024 * 200});

::@ECHO OFF

SET log_level=debug
bin\phantomjs.exe --ignore-ssl-errors=yes --ssl-protocol=any --remote-debugger-port=9999 references.js
SET log_level=
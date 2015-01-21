@ECHO OFF
DEL /F /Q img\*

SET errorlevel=
phantomjs --ignore-ssl-errors=yes --ssl-protocol=any references.js
echo "EXIT CODE: %errorlevel%"
set /p continue=Press Enter to continue: 
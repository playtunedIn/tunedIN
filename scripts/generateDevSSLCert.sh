#! /bin/bash

# If you're using Windows or Linux you must download openssl: https://www.openssl.org/.
# Mac should have opensssl preinstalled.

CWD=$(pwd)
LOCAL_CERT_PATH=$CWD/.cert

rm -rf $LOCAL_CERT_PATH
mkdir -p $LOCAL_CERT_PATH
cd $LOCAL_CERT_PATH

printf '📕 Creating Cert Config...'
cat > cert.cnf <<- EOM
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
[dn]
C = US
ST = CA
O = Test
CN = localhost
EOM
printf '✅\n'

printf '🔑 Creating Private Key...'
openssl genpkey -algorithm RSA -out private.key
printf '✅\n'

printf '📜 Creating Certificate...'
openssl req -new -key private.key -x509 -days 365 -out certificate.crt -config cert.cnf
printf '✅\n'

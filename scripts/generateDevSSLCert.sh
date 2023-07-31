#! /bin/bash

######################################################################
#
# Source: https://gist.github.com/ptvandi/5a33c28d74ccc5100d7fe2bf5de96deb
#
# This script generates an SSL certficate for local development. To
# execute the script, run `bash generateDevSSLCert.sh`. Sudo is
# needed to save the certificate to your Mac KeyChain. After the cert
# is generated, you can use `HTTPS=true yarn start` to run the web 
# server.
#
######################################################################

CWD=$(pwd)
LOCAL_CERT_PATH=$CWD/.cert

CERT_NAME='localhost (Dev SSL Cert)'
ORG_NAME='TunedIN Test'

DNS_1='playtunedin-test.com'
DNS_2='local.playtunedin-test.com'

# Ask user permission to run the script
CONTINUE="n/a"
printf "⚠️  This script will create/modify the folder $LOCAL_CERT_PATH\n"
printf "⚠️  This script will alert you when it must run in sudo mode\n"
printf ""
while [[ ! "$CONTINUE" =~ ^[yYnN]$ ]]
do read -ep '   Do you want to continue? [y/N] ' -n 1 -r CONTINUE
  if [[ "$CONTINUE" == "" ]]; then
    CONTINUE="N"
  fi
done

if [[ "$CONTINUE" =~ ^[nN]$ ]]; then
  printf 'Script aborted by used\n'
  exit 0
fi
printf '\n'

# -- ./.cert --

printf "⚙️  $LOCAL_CERT_PATH... "
mkdir -p $LOCAL_CERT_PATH
cd $LOCAL_CERT_PATH
printf '✅\n'

# -- rootCA.key --

printf '🔑 Generating rootCA.key... '
FILE=rootCA.key
if [[ -f "$FILE" ]]; then
  printf 'already exists ✅ \n'
else
  printf '🆕\n'
  openssl genrsa -des3 -out rootCA.key 2048
fi

# -- rootCA.pem --

printf '🔒 Generating rootCA.pem... '
FILE=rootCA.pem
if [[ -f "$FILE" ]]; then
  printf 'already exists ✅\n'
else
  printf '🆕\n'
  openssl req -x509 -new -nodes -key rootCA.key -subj "/C=US/ST=CA/O=$ORG_NAME/CN=$CERT_NAME" -sha256 -days 1024 -out rootCA.pem
fi

# -- Ask user permission to trust certificate --

printf '\n';
CONTINUE="n/a"
printf "⚠️  The following command requires sudo privileges\n"
while [[ ! "$CONTINUE" =~ ^[yYnN]$ ]]
do read -ep "   Trust and add $CERT_NAME rootCA.pem to Keychain Access? [y/N] " -n 1 -r CONTINUE
  if [[ "$CONTINUE" == "" ]]; then
    CONTINUE="N"
  fi
done

if [[ "$CONTINUE" =~ ^[yY]$ ]]; then
  sudo security -v add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain rootCA.pem
fi
printf '\n'

# -- server.csr.cnf --

printf '⚙️  Creating server.csr.cnf... '
cat > server.csr.cnf <<- EOM
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
[dn]
C=US
ST=CA
O=$ORG_NAME
CN=$CERT_NAME
EOM
printf '✅\n'

# -- v3.ext --

printf '⚙️  Creating v3.ext... '
cat > v3.ext <<- EOM
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = $DNS_1
DNS.3 = $DNS_2
EOM
printf '✅\n'

# -- server.csr & server.key --

printf '🔐 Generating server.csr and server.key... '
FILE1=server.csr
FILE2=server.key
if [[ -f "$FILE1" && -f "$FILE2" ]]; then
  printf 'already exist ✅\n'
else
  printf '🆕\n'
  openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )
fi

# -- server.crt & rootCA.srl --

printf '🔏 Generating server.crt and rootCA.srl... '
FILE1=server.crt
FILE2=rootCA.srl
if [[ -f "$FILE1" && -f "$FILE2" ]]; then
  printf 'already exist ✅\n'
else
  printf '🆕\n'
  openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
fi
printf '✅\n'
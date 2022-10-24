
# Booking-system
## Prerequisites
Clone down this repository. You will need `node` and `npm` installed globally on your machine.  

## HTTPS SSL certificate generation:
### Creating an SSL Certificate
To configure an SSL certificate, you can either use a public, trusted certificate or a self-signed certificate. 

If you’re running the application in a production environment, always be sure to acquire and install a trusted certificate, not a self-signed certificate!

### Creating self-signed certificate (for testing)
1. First, generate a key file used for self-signed certificate generation with the command below. The command will create a private key as a file called key.pem.
```
openssl genrsa -out key.pem
```

2. Next, generate a certificate service request (CSR) with the command below. You’ll need a CSR to provide all of the input necessary to create the actual certificate.
```
openssl req -new -key key.pem -out csr.pem
```

3. Finally, generate your certificate by providing the private key created to sign it with the public key created in step two with an expiry date of 9,999 days. This command below will create a certificate called cert.pem.
```
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
```

4. Visit [https://localhost:4000](https://localhost:4000) and make your web browser trust your self-signed certificate by clicking advanced and then clicking the link to continue to the website.

## Dependencies installation:
```
npm install
```

## Starting the back-end server
```
node ./index.js
```

## Running the app
To Visit App, just open the index.html in your app folder.

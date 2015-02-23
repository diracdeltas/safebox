var FileCollection = new Mongo.Collection('files');
var scrypt;

function processFile(data) {
  if (!scrypt) {
    return;
  }
  var plaintext = data;
  var salt = window.location.href;
  var passphrase = $('#passphrase')[0].value;

  // Compute a 16-byte scrypt key with L=2^20, r =8, p=1
  var key = scrypt.crypto_scrypt(scrypt.encode_utf8(passphrase),
      scrypt.encode_utf8(salt), 16384, 8, 1, 16);
  console.log(key);

  // Use NIST-recommended IV length of 96 bits
  var iv = window.crypto.getRandomValues(new Uint8Array(12));

  // TODO: Is it sufficient/necessary to store the IV as ADATA?
  var algorithm = {
    name: 'aes-gcm',
    iv: iv,
    additionalData: iv,
    tagLength: 128
  };

  var extractable = false;
  var usages = ['encrypt', 'decrypt'];

  // (1) Import the key
  return crypto.subtle.importKey(
      'raw', key, algorithm, extractable, usages).then(function(result) {
        // (2) Encrypt.
        return crypto.subtle.encrypt(algorithm, result, plaintext);
      }).then(function(result) {
        console.log('got encrypted result', result);
      });
}

if (Meteor.isClient) {
  scrypt = scrypt_module_factory();

  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.main.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.main.events({
    'click button': function () {
      var selectedFiles = $('#files')[0].files;
      var file;

      var passphrase1 = $('#passphrase')[0].value;
      var passphrase2 = $('#passphrase-confirm')[0].value;

      if (passphrase1 !== passphrase2) {
        window.alert("Passphrases do not match!");
        return;
      }

      for (var i = 0; i < selectedFiles.length; i++) {
        reader = new FileReader();
        reader.onload = function() {
          processFile(reader.result);
        };
        file = selectedFiles[i];
        reader.readAsArrayBuffer(file);
      }

    }
  });

  Template.body.helpers({
    fileViews: function() {
      return FileCollection.find({});
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

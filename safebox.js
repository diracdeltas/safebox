var FileCollection = new Mongo.Collection('files');
var scrypt;

/**
 * Derives a key using scrypt.
 * @param {string} passphrase
 * @param {Uint8Array} salt
 * @return {Uint8Array}
 */
function deriveKey(passphrase, salt) {
  if (!scrypt || !salt) {
    return null;
  }

  // Compute a 16-byte scrypt key with L=2^20, r =8, p=1
  return scrypt.crypto_scrypt(scrypt.encode_utf8(passphrase),
      salt, 16384, 8, 1, 16);
}

/**
 * Encrypts a file using the given key.
 * @param {!ArrayBuffer} plaintext The file contents.
 * @param {!Uint8Array} key The 128-bit encryption key
 * @param {!Uint8Array} iv The initialization vector
 * @return {Promise}
 */
function encryptFile(plaintext, key, iv) {
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
      });
}

/**
 * Decrypts some data returning the given key.
 * @param {!Uint8Array} plaintext The file contents.
 * @param {!Uint8Array} key The 128-bit encryption key
 * @param {!Uint8Array} iv The initialization vector
 * @return {Promise}
 */
function decryptFile(ciphertext, key, iv) {
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
        // (2) Decrypt.
        return crypto.subtle.decrypt(algorithm, result, ciphertext);
      });
}

/**
 * Reads and processes a file
 * @param {!File} file
 * @param {!Uint8Array} key
 * @param {!Uint8Array} salt
 */
function readAndProcessFile(file, key, salt) {
  var reader = new FileReader();
  reader.onload = function() {
    // Use NIST-recommended IV length of 96 bits
    var iv = window.crypto.getRandomValues(new Uint8Array(12));

    encryptFile(reader.result, key, iv).then(function(result) {
      // Note result is an arraybuffer
      FileCollection.insert({
        name: file.name,
        ciphertext: new Uint8Array(result),
        iv: iv,
        salt: salt,
        createdAt: new Date()
      });
    }).catch(function(reason) {
      showError('Could not encrypt file.');
    });
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Shows an error at the top of the page or clears existing errors.
 * @param {string=} opt_error the message to show.
 *  if undefined, clears the error div.
 */
function showError(opt_error) {
  error = opt_error ? opt_error : '';
  $('#error-div')[0].textContent = error;
}

if (Meteor.isClient) {
  scrypt = scrypt_module_factory();

  Template.body.events({
    'click button': function (event) {
      showError();
      var selectedFiles = $('#files')[0].files;

      if (selectedFiles.length === 0) {
        showError('Please select at least one file.');
        return;
      }

      var passphrase = window.prompt('Enter file passphrase:');
      if (passphrase === null) {
        return;
      }

      var salt = window.crypto.getRandomValues(new Uint8Array(10));
      var key = deriveKey(passphrase, salt);
      if (key === null) {
        return;
      }

      for (var i = 0; i < selectedFiles.length; i++) {
        readAndProcessFile(selectedFiles[i], key, salt);
      }
    },

    'click .file-link': function(event) {
      showError();

      var id = event.target.id;
      if (!id) {
        showError('Got invalid file link.');
        return;
      }
      var item = FileCollection.findOne(id);
      if (!item) {
        showError('No item matches the given ID');
        return;
      }

      var passphrase = window.prompt('Enter file passphrase:');
      if (passphrase === null) {
        // User clicked 'cancel'
        return;
      }
      var key = deriveKey(passphrase, item.salt);
      if (key === null) {
        showError('Error deriving encryption key!');
        return;
      }

      decryptFile(item.ciphertext, key, item.iv).then(function(result) {
        var blob = new Blob([result],
                            {type: 'application/octet-stream'});
        var url = URL.createObjectURL(blob);

        var downloadLink = $('ul.' + id);
        var linkElement = downloadLink.find('a');
        linkElement.attr('href', url);
        linkElement.attr('target', '_blank');

        downloadLink.show();
      }).catch(function(reason) {
        showError('Could not decrypt file.');
      });
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

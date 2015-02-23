# safebox

## Overview

A simple [Meteor](https://meteor.com) + [Sandstorm](https://sandstorm.io) app for sharing client-side encrypted files. Requires a browser with a working implementation of the AES-GCM webcrypto API. Stable releases of Chrome/Firefox should work, though note that Chrome restricts WebCrypto access to [secure origins](https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features).

### !! Warning !!

Do not use this for anything that requires better-than-plaintext securty, given that the code is pretty much untested and unreviewed.

### Demo

Here is a [demo instance](https://alpha.sandstorm.io/grain/hk4cb7b6TDo3st3RMroKAF). If you want a bunny, the password is `iloveoctocats`.

## Building

To run locally without Sandstorm:
    $ curl https://install.meteor.com/ | sh
    $ meteor run

To run with Sandstorm, follow the instructions at https://github.com/sandstorm-io/meteor-spk to download Sandstorm and meteor-spk. Run `meteor-spk build path/to/package.spk` to build the Sandstorm package. Then load the package into a Sandstorm instance after logging in - you can either [set up](https://github.com/sandstorm-io/sandstorm#installing-the-easy-way) a local instance or just use https://alpha.sandstorm.io.

Caveat: Local instances that are running without HTTPS will not work in Chrome since WebCrypto access is considered a sensitive feature.


## License

License: GPLv3 &copy; 2015, Yan Zhu. All rights reserved.

This project uses [js-scrypt](https://github.com/tonyg/js-scrypt) for key derivation, written by Tony Garnock-Jones and licensed under the 2-clause BSD license:

> Copyright &copy; 2013, Tony Garnock-Jones
> All rights reserved.
>
> Redistribution and use in source and binary forms, with or without
> modification, are permitted provided that the following conditions
> are met:
>
> 1. Redistributions of source code must retain the above copyright
>    notice, this list of conditions and the following disclaimer.
>
> 2. Redistributions in binary form must reproduce the above copyright
>    notice, this list of conditions and the following disclaimer in
>    the documentation and/or other materials provided with the
>    distribution.
>
> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
> "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
> LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
> FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
> COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
> INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
> BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
> LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
> CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
> LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
> ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
> POSSIBILITY OF SUCH DAMAGE.

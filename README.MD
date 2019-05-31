# Unofficial Dauntless Client for Node.js
[![npm version](https://img.shields.io/npm/v/epicgames-dauntless-client.svg)](https://npmjs.com/package/epicgames-dauntless-client)
[![npm downloads](https://img.shields.io/npm/dm/epicgames-dauntless-client.svg)](https://npmjs.com/package/epicgames-dauntless-client)
[![license](https://img.shields.io/npm/l/epicgames-dauntless-client.svg)](https://github.com/SzymonLisowiec/node-epicgames-dauntless-client/blob/master/LICENSE.MD)
[![paypal](https://img.shields.io/badge/paypal-donate-orange.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=FDN57KFYRP4CQ&source=url)

__This library supports only Dauntless client. If you need launcher, check [`node-epicgames-client`](https://github.com/SzymonLisowiec/node-epicgames-client)__

# Installation
```
npm i epicgames-dauntless-client --save
```

# Example
```javascript
const { Launcher } = require('epicgames-client');
const Dauntless = require('epicgames-dauntless-client');

const launcher = new Launcher({
  email: 'EMAIL',
  password: 'PASSWORD',
});

(async () => {

  if(!await launcher.init() || !await launcher.login()) {
    throw new Error('Error while initialize or login process.');
  }

  const dauntless = await launcher.runGame(Dauntless);
  
  console.log(`Your account id: ${dauntless.account.id}`);
  if (dauntless.account.character) {
    console.log(`Your character id: ${dauntless.account.character.id}`);
  } else {
    console.log('You don\'t have characters.');
  }

  const webstore = await dauntless.getProductsForTag('webstore');

})();
```

# License
MIT License

Copyright (c) 2019 Kysune

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

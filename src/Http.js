const Request = require('request');

class Http {

  constructor(options) {

    this.jar = Request.jar();

    this.options = {

      jar: this.jar,
      timeout: 30000,
      headers: {},

      ...options,

    };

    this.request = Request.defaults(this.options);

  }

  getUserAgent() {
    return 'Archon/++dauntless+rel-0.8.0-CL-131970 Windows/10.0.17134.1.768.64bit';
  }

  setHeader(name, value) {
    this.options.headers[name] = value;
  }

  removeHeader(name) {
    delete this.options.headers[name];
  }

  send(method, url, auth, data, isJsonResponse, headers, contentType) {

    if (typeof isJsonResponse !== 'boolean') isJsonResponse = true;

    return new Promise((resolve, reject) => {
            
      const options = {
        ...this.options,
        url,
      };
            
      options.method = method;
            
      if (auth) options.headers.Authorization = auth;
      if (data) {
        if (contentType === 'application/x-www-form-urlencoded') options.form = data;
        else options.body = data;
      }
      if (isJsonResponse) options.json = isJsonResponse;
      if (typeof headers === 'object') options.headers = { ...options.headers, ...headers };
      
      this.request(options, (err, response, body) => {
        
        if (err) {

          reject(err);
          return;

        }

        if (typeof body === 'object' && typeof body.errorCode !== 'undefined') {
          
          switch (body.errorCode) {

            default:
              reject(new Error(body.errorCode));
              break;

          }
          
        }

        resolve({
          response,
          data: body,
        });

      });

    }).catch((err) => {

      throw err;

    });

  }

  sendGet(url, auth, data, isJsonResponse, headers, contentType) {
    return this.send('GET', url, auth, data, isJsonResponse, headers, contentType);
  }

  sendPost(url, auth, data, isJsonResponse, headers, contentType) {
    return this.send('POST', url, auth, data, isJsonResponse, headers, contentType);
  }

}

module.exports = Http;

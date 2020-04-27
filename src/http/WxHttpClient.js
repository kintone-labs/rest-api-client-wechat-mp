import qs from 'qs';

const THRESHOLD_AVOID_REQUEST_URL_TOO_LARGE = 4096;

export class WxHttpClient {
  constructor({baseUrl, headers, params, errorResponseHandler}) {
    this.baseUrl = baseUrl;
    this.headers = headers;
    this.params = params;
    this.errorResponseHandler = errorResponseHandler;
  }

  async get(path, params) {
    const requestConfig = this.buildRequestConfig('get', path, params);
    return this.sendRequest(requestConfig);
  }

  async post(path, params) {
    const requestConfig = this.buildRequestConfig('post', path, params);
    return this.sendRequest(requestConfig);
  }

  async put(path, params) {
    const requestConfig = this.buildRequestConfig('put', path, params);
    return this.sendRequest(requestConfig);
  }

  async delete(path, params) {
    const requestConfig = this.buildRequestConfig('delete', path, params);
    return this.sendRequest(requestConfig);
  }

  async downloadFile(path, params) {
    const requestConfig = this.buildRequestConfig('get', path, params, {fileMethod: 'download'});
    return this.sendRequest(requestConfig);
  }

  async uploadFile(path, filePath) {
    const requestConfig = this.buildRequestConfig('post', path, {}, {
      filePath: filePath,
      name: 'file',
      fileMethod: 'upload',
    });
    return this.sendRequest(requestConfig);
  }

  async sendRequest(requestConfig) {
    let response;
    try {
      response = await this.wxSendRequest(requestConfig);
    } catch (error) {
      this.errorResponseHandler(error);
    }
    return response;
  }

  wxSendRequest(requestConfig) {
    // Execute request
    return new Promise((resolve, reject) => {
      requestConfig.fail = err => {
        reject(err);
      };

      switch (requestConfig.fileMethod) {
        case 'download': {
          requestConfig.success = res => {
            if (res.statusCode === 200) {
              resolve({tempFilePath: res.tempFilePath});
            } else {
              reject(res);
            }
          };
          wx.downloadFile(requestConfig);
          break;
        }
        case 'upload': {
          requestConfig.success = res => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(res.data));
            } else {
              reject(res);
            }
          };
          wx.uploadFile(requestConfig);
          break;
        }
        default: {
          requestConfig.success = res => {
            if (res.statusCode === 200) {
              resolve(res.data);
            } else {
              reject(res);
            }
          };
          wx.request(requestConfig);
        }
      }
    });
  }

  buildRequestConfig(method, path, params, options) {
    const requestConfig = {
      method,
      header: this.headers,
      url: `${this.baseUrl}${path}`,
      ...(options ? options : {})
    };

    switch (method) {
      case 'get': {
        const requestUrl = this.buildRequestUrl(path, params);
        if (requestUrl.length > THRESHOLD_AVOID_REQUEST_URL_TOO_LARGE) {
          return {
            ...requestConfig,
            method: 'post',
            header: {...this.headers, 'X-HTTP-Method-Override': 'GET'},
            data: {...this.params, ...params}
          };
        }
        return {
          ...requestConfig,
          header: {...this.headers, 'content-type': 'application/html'},
          url: requestUrl
        };
      }
      case 'post':
      case 'put':
      case 'delete': {
        return {
          ...requestConfig,
          data: {...this.params, ...params}
        };
      }
      default: {
        throw new Error(`${method} method is not supported`);
      }
    }
  }

  buildRequestUrl(path, params) {
    return `${this.baseUrl}${path}?${qs.stringify(params)}`;
  }
}

import {WxHttpClient} from './WxHttpClient';

export class MockWxHttpClient extends WxHttpClient {
  constructor({baseUrl, headers, params, errorResponseHandler}) {
    super({baseUrl, headers, params, errorResponseHandler});

    this.type = 'fail';
    this.responses = {};
    this.logs = [];
    this.wx = {};
    this.wx.downloadFile = this.wx.uploadFile = this.wx.request = (requestConfig) => {
      if (typeof requestConfig.success === 'function' && this.type === 'success') {
        requestConfig.success(this.responses);
      } else if (typeof requestConfig.fail === 'function' && this.type === 'fail') {
        requestConfig.fail(this.responses);
      }
    };
  }

  setCallbackType(t) {
    this.type = t === 'success' ? 'success' : 'fail';
  }

  mockResponse(mock) {
    this.responses = mock;
  }

  getLogs() {
    return this.logs;
  }

  async get(path, params) {
    this.logs.push({method: 'get', path, params});
    return super.get(path, params);
  }

  async post(path, params) {
    this.logs.push({method: 'post', path, params});
    return super.post(path, params);
  }

  async put(path, params) {
    this.logs.push({method: 'get', path, params});
    return super.put(path, params);
  }

  async delete(path, params) {
    this.logs.push({method: 'delete', path, params});
    return super.delete(path, params);
  }

  async downloadFile(path, params) {
    this.logs.push({method: 'get', path, params});
    return super.downloadFile(path, params);
  }

  async uploadFile(path, params) {
    this.logs.push({method: 'post', path, params});
    return super.uploadFile(path, params);
  }

  callWxAPI(requestConfig) {
    switch (requestConfig.fileMethod) {
      case 'download': {
        return this.wx.downloadFile(requestConfig);
      }
      case 'upload': {
        return this.wx.uploadFile(requestConfig);
      }
      case 'read':
        return JSON.stringify({});
      default: {
        return this.wx.request(requestConfig);
      }
    }
  }
}
import {BulkRequestClient} from '@kintone/rest-api-client/esm/client/BulkRequestClient';
import {RecordClient} from '@kintone/rest-api-client/esm/client/RecordClient';
import {AppClient} from '@kintone/rest-api-client/esm/client/AppClient';
import {FileClient} from './client/FileClient';
import {Base64} from 'js-base64';
import {WxHttpClient} from './http/WxHttpClient';
import {KintoneRestAPIError} from '@kintone/rest-api-client/esm/KintoneRestAPIError';

export class KintoneRestApiClient {
  constructor({baseUrl, auth, guestSpaceId, basicAuth}) {
    const newAuth = this.buildAuth(auth);
    this.headers = this.buildHeaders(newAuth, basicAuth);

    this.baseUrl = baseUrl;
    if (typeof this.baseUrl === 'undefined') {
      throw new Error('in WeChat environment, baseUrl is required');
    }

    const errorResponseHandler = (errorResponse) => {
      throw new KintoneRestAPIError(errorResponse);
    };

    const httpClient = new WxHttpClient({
      baseUrl: this.baseUrl,
      headers: this.headers,
      params: {},
      errorResponseHandler
    });

    this.bulkRequest_ = new BulkRequestClient(httpClient, guestSpaceId);
    this.record = new RecordClient(httpClient, this.bulkRequest_, guestSpaceId);
    this.app = new AppClient(httpClient, guestSpaceId);
    this.file = new FileClient(httpClient, guestSpaceId);
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  getHeaders() {
    return this.headers;
  }

  buildAuth(auth) {
    if ('username' in auth) {
      return {type: 'password', ...auth};
    }
    if ('apiToken' in auth) {
      return {type: 'apiToken', ...auth};
    }
    throw new Error('in WeChat environment, auth is required');
  }

  buildHeaders(auth, basicAuth) {
    const headers = basicAuth ? {'Authorization': `Basic ${Base64.encode(`${basicAuth.username}:${basicAuth.password}`)}`} : {};

    switch (auth.type) {
      case 'password': {
        return {...headers, 'X-Cybozu-Authorization': Base64.encode(`${auth.username}:${auth.password}`)};
      }
      case 'apiToken': {
        if (Array.isArray(auth.apiToken)) {
          return {...headers, 'X-Cybozu-API-Token': auth.apiToken.join(',')};
        }
        return {...headers, 'X-Cybozu-API-Token': auth.apiToken};
      }
      default: {
        return {...headers};
      }
    }
  }

  bulkRequest(params) {
    return this.bulkRequest_.send(params);
  }
}

import {MockWxHttpClient} from '../MockWxHttpClient';
import {errorResponseHandler} from '../../KintoneRestAPIClientWeChatMP';
import {KintoneRestAPIError} from '@kintone/rest-api-client/esm/KintoneRestAPIError';

describe('WxHttpClient', () => {
  let mockClient;
  const baseUrl = 'https://example.com';
  const headers = {'X-Cybozu-API-Token': 'API_TOKEN'};
  beforeEach(() => {
    mockClient = new MockWxHttpClient({baseUrl, headers, params: {}, errorResponseHandler});
  });

  describe('get', () => {
    it('should raise a KintoneRestAPIError if statusCode is not 200', () => {
      mockClient.setCallbackType('success');
      mockClient.mockResponse({statusCode: 520, data: {}, header: {}});
      expect(mockClient.get('api path', {})).rejects.toThrow(KintoneRestAPIError);
    });
    it('should raise an Error if some WeChat Miniprogram error occurs', () => {
      mockClient.setCallbackType('fail');
      mockClient.mockResponse({errMsg: 'some errors'});
      expect(mockClient.get('api path', {})).rejects.toThrow('some errors');
    });
    it('should return the data if do get successfully', () => {
      const data = {
        'record': {
          '单行文本框': {
            'type': 'SINGLE_LINE_TEXT',
            'value': '测试'
          },
        }
      };
      mockClient.setCallbackType('success');
      mockClient.mockResponse({statusCode: 200, data, header: {}});
      expect(mockClient.get('api path', {})).resolves.toEqual(data);
    });
  });

  describe('post', () => {
    it('should raise a KintoneRestAPIError if statusCode is not 200', () => {
      mockClient.setCallbackType('success');
      mockClient.mockResponse({statusCode: 520, data: {}, header: {}});
      expect(mockClient.post('api path', {})).rejects.toThrow(KintoneRestAPIError);
    });
    it('should raise an Error if some WeChat Miniprogram error occurs', () => {
      mockClient.setCallbackType('fail');
      mockClient.mockResponse({errMsg: 'some errors'});
      expect(mockClient.post('api path', {})).rejects.toThrow('some errors');
    });
    it('should return the data if do post successfully', () => {
      const data = {
        'id': '100',
        'revision': '1'
      };
      mockClient.setCallbackType('success');
      mockClient.mockResponse({statusCode: 200, data, header: {}});
      expect(mockClient.post('api path', {})).resolves.toEqual(data);
    });
  });

  describe('put', () => {
    it('should raise a KintoneRestAPIError if statusCode is not 200', () => {
      mockClient.setCallbackType('success');
      mockClient.mockResponse({statusCode: 520, data: {}, header: {}});
      expect(mockClient.put('api path', {})).rejects.toThrow(KintoneRestAPIError);
    });
    it('should raise an Error if some WeChat Miniprogram error occurs', () => {
      mockClient.setCallbackType('fail');
      mockClient.mockResponse({errMsg: 'some errors'});
      expect(mockClient.put('api path', {})).rejects.toThrow('some errors');
    });
    it('should return the data if do put successfully', () => {
      const data = {
        'revision': '5'
      };
      mockClient.setCallbackType('success');
      mockClient.mockResponse({statusCode: 200, data, header: {}});
      expect(mockClient.put('api path', {})).resolves.toEqual(data);
    });
  });

  describe('delete', () => {
    it('should raise a KintoneRestAPIError if statusCode is not 200', () => {
      mockClient.setCallbackType('success');
      mockClient.mockResponse({statusCode: 520, data: {}, header: {}});
      expect(mockClient.delete('api path', {})).rejects.toThrow(KintoneRestAPIError);
    });
    it('should raise an Error if some WeChat Miniprogram error occurs', () => {
      mockClient.setCallbackType('fail');
      mockClient.mockResponse({errMsg: 'some errors'});
      expect(mockClient.delete('api path', {})).rejects.toThrow('some errors');
    });
    it('should return an empty JSON if do delete successfully', () => {
      mockClient.setCallbackType('success');
      mockClient.mockResponse({
        statusCode: 200,
        data: {},
        header: {},
      });
      expect(mockClient.delete('api path', {})).resolves.toEqual({});
    });
  });

  describe('Build Request Config', () => {
    it('should build get method requestConfig', () => {
      const requestConfig = mockClient.buildRequestConfig(
        'get',
        '/k/v1/record.json',
        {key: 'value'}
      );
      expect(requestConfig).toEqual({
        method: 'get',
        header: {...headers, 'content-type': 'application/html'},
        url: `${baseUrl}/k/v1/record.json?key=value`,
      });
    });
    it('should build post method requestConfig if the request URL is over the threshold', () => {
      const value = 'a'.repeat(4096);
      const requestConfig = mockClient.buildRequestConfig(
        'get',
        '/k/v1/record.json',
        {key: value}
      );
      expect(requestConfig).toEqual({
        method: 'post',
        url: `${baseUrl}/k/v1/record.json`,
        header: {...headers, 'X-HTTP-Method-Override': 'GET'},
        data: {key: value},
      });
    });
    it('should build get method requestConfig for download file', () => {
      const requestConfig = mockClient.buildRequestConfig(
        'get',
        '/k/v1/file.json',
        {key: 'value'},
        {fileMethod: 'download'}
      );
      expect(requestConfig).toEqual({
        method: 'get',
        url: `${baseUrl}/k/v1/file.json?key=value`,
        header: {...headers, 'content-type': 'application/html'},
        fileMethod: 'download',
      });
    });
    it('should build post method requestConfig', () => {
      const requestConfig = mockClient.buildRequestConfig(
        'post',
        '/k/v1/record.json',
        {key: 'value'}
      );
      expect(requestConfig).toEqual({
        method: 'post',
        url: `${baseUrl}/k/v1/record.json`,
        data: {key: 'value'},
        header: headers,
      });
    });
    it('should build post method requestConfig for upload file', () => {
      const requestConfig = mockClient.buildRequestConfig(
        'post',
        '/k/v1/file.json',
        {},
        {
          filePath: 'file_path',
          name: 'file',
          fileMethod: 'upload',
        }
      );
      expect(requestConfig).toEqual({
        method: 'post',
        url: `${baseUrl}/k/v1/file.json`,
        header: headers,
        data: {},
        filePath: 'file_path',
        name: 'file',
        fileMethod: 'upload',
      });
    });
    it('should build put method requestConfig', () => {
      const requestConfig = mockClient.buildRequestConfig(
        'put',
        '/k/v1/record.json',
        {key: 'value'}
      );
      expect(requestConfig).toEqual({
        method: 'put',
        url: `${baseUrl}/k/v1/record.json`,
        data: {key: 'value'},
        header: headers,
      });
    });
    it('should build delete method requestConfig', () => {
      const requestConfig = mockClient.buildRequestConfig(
        'delete',
        '/k/v1/record.json',
        {key: 'value'}
      );
      expect(requestConfig).toEqual({
        method: 'delete',
        url: `${baseUrl}/k/v1/record.json`,
        data: {key: 'value'},
        header: headers,
      });
    });

    it('should raise an Error if the method is not supported', () => {
      const method = 'xxx';
      expect(() => {
        mockClient.buildRequestConfig(method, 'api path', {});
      }).toThrow(`${method} method is not supported`);
    });
  });
});
import {MockWxHttpClient} from '../../http/MockWxHttpClient';
import {FileClient} from '../FileClient';
import {errorResponseHandler} from '../../KintoneRestAPIClientWeChatMP';
import {KintoneRestAPIError} from '@kintone/rest-api-client/esm/KintoneRestAPIError';

describe('FileClient', () => {
  let mockClient;
  let fileClient;
  beforeEach(() => {
    mockClient = new MockWxHttpClient({baseUrl: 'https://example.com', headers: {}, params: {}, errorResponseHandler});
    fileClient = new FileClient(mockClient);
  });
  describe('uploadFile', () => {
    describe('check path, method and params', () => {
      const params = {filePath: 'foo/bar/baz.txt'};
      beforeEach(() => {
        fileClient.uploadFile(params).then().catch(() => {});
      });
      it('should pass the path to the http client', () => {
        expect(mockClient.getLogs()[0].path).toBe('/k/v1/file.json');
      });
      it('should send a post request', () => {
        expect(mockClient.getLogs()[0].method).toBe('post');
      });
      it('should pass filePath as a param to the http client', () => {
        expect(mockClient.getLogs()[0].params).toEqual(params);
      });
      it('should raise an error if filePath is not specified', () => {
        expect(fileClient.uploadFile()).rejects.toThrow('in WeChat environment, filePath is required');
        expect(fileClient.uploadFile([])).rejects.toThrow('in WeChat environment, filePath is required');
        expect(fileClient.uploadFile({})).rejects.toThrow('in WeChat environment, filePath is required');
      });
    });

    describe('check response', () => {
      const params = {filePath: 'foo/bar/baz.txt'};
      it('should return fileKey if upload file successfully', () => {
        mockClient.setCallbackType('success');
        const fileKey = 'c15b3870-7505-4ab6-9d8d-b9bdbc74f5d6';
        mockClient.mockResponse({
          statusCode: 200,
          data: JSON.stringify({fileKey})
        });
        expect(fileClient.uploadFile(params)).resolves.toEqual({fileKey});
      });
      it('should raise a KintoneRestAPIError if statusCode is not 200', () => {
        mockClient.setCallbackType('success');
        mockClient.mockResponse({
          statusCode: 520,
          data: JSON.stringify({}),
          header: {},
        });
        expect(fileClient.uploadFile(params)).rejects.toThrow(KintoneRestAPIError);
      });
      it('should raise an Error if some WeChat Miniprogram error occurs', () => {
        mockClient.setCallbackType('fail');
        mockClient.mockResponse({errMsg: 'some errors'});
        expect(fileClient.uploadFile(params)).rejects.toThrow('some errors');
      });
    });
  });

  describe('downloadFile', () => {
    describe('check path, method and params', () => {
      const params = {fileKey: 'some_file_key'};
      beforeEach(() => {
        fileClient.downloadFile(params).then().catch(() => {});
      });
      it('should pass the path to the http client', () => {
        expect(mockClient.getLogs()[0].path).toBe('/k/v1/file.json');
      });
      it('should send a get request', () => {
        expect(mockClient.getLogs()[0].method).toBe('get');
      });
      it('should pass fileKey as a param to the http client', () => {
        expect(mockClient.getLogs()[0].params).toEqual(params);
      });
    });

    describe('check response', () => {
      const params = {fileKey: 'some_file_key'};
      it('should return tempFilePath if download file successfully', () => {
        const tempFilePath = 'http://tmp/wx1483e9abcaa92667.o6zAJs7n47Laj58XfeIFJViRSQYw.Zphouabjw8mde4d7f1b4ed2e42d15898f4b27b019da4.txt';
        mockClient.setCallbackType('success');
        mockClient.mockResponse({
          statusCode: 200,
          tempFilePath,
          header: {},
        });
        expect(fileClient.downloadFile(params)).resolves.toEqual({tempFilePath});
      });
      it('should raise a KintoneRestAPIError if statusCode is not 200', () => {
        mockClient.setCallbackType('success');
        mockClient.mockResponse({
          statusCode: 404,
          tempFilePath: 'http://tmp/wx1483e9abcaa92667.o6zAJs7n47Laj58XfeIFJViRSQYw.oSwMtgfeEzn6188e6292f804ff4e513836406bea05f1.json',
          header: {},
        });
        expect(fileClient.downloadFile(params)).rejects.toThrow(KintoneRestAPIError);
      });
    });
  });
});

describe('FileClient with guestSpaceId', () => {
  const GUEST_SPACE_ID = 1;
  const params = {filePath: 'foo/bar/baz.txt'};
  const mockClient = new MockWxHttpClient({baseUrl: 'https://example.com', headers: {}, params: {}, errorResponseHandler});
  const fileClient = new FileClient(mockClient, GUEST_SPACE_ID);
  fileClient.uploadFile(params).then().catch(() => {});
  it('should pass the path to the http client', () => {
    expect(mockClient.getLogs()[0].path).toBe(
      `/k/guest/${GUEST_SPACE_ID}/v1/file.json`
    );
  });
});
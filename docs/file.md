# File

- [uploadFile](#uploadFile)
- [downloadFile](#downloadFile)

## Overview

```js
const client = new KintoneRestAPIClientWeChatMP({
  baseUrl: "https://example.cybozu.com",
  auth: {
    username: process.env.KINTONE_USERNAME,
    password: process.env.KINTONE_PASSWORD,
  }
});

(async () => {
  const APP_ID = "1";
  const ATTACHMENT_FIELD_CODE = "Attachment";

  const FILE = {
    name: "Hello.txt",
    data: "Hello World!"
  };

  const filePath = `${wx.env.USER_DATA_PATH}/${FILE.name}`;
  const fs = wx.getFileSystemManager();
  fs.writeFileSync(filePath, FILE.data, 'utf8');

  // Upload a file and attach it to a record
  const { fileKey } = await client.file.uploadFile({ filePath });
  const { id } = await client.record.addRecord({
    app: APP_ID,
    record: {
      [ATTACHMENT_FIELD_CODE]: {
        value: [{ fileKey }]
      }
    }
  });

  // Download the attached file
  const { record } = await client.record.getRecord({
    app: APP_ID,
    id,
  });
  const {tempFilePath} = await client.file.downloadFile({
    fileKey: record[ATTACHMENT_FIELD_CODE].value[0].fileKey
  });
  const data = fs.readFileSync(tempFilePath, 'utf8');
  console.log(data); // Hello World!
})();
```

- All methods are defined on the `file` property.

## Methods

### uploadFile

Uploads a file to Kintone.

`uploadFile` returns a file key for the uploaded file.
You can use the file key at the following place.

- Attachment field in an app
- JavaScript and CSS customization settings of an app

#### Parameters

| Name      |  Type  | Required | Description           |
| --------- | :----: | :------: | ----------------------|
| filePath  | String |    Yes   | The path to the file. |

#### Returns

`uploadFile` returns a Promise object that is resolved with an object having following properties.

| Name    |  Type  | Description                        |
| ------- | :----: | ---------------------------------- |
| fileKey | String | The file key of the uploaded file. |

#### Reference

- https://developers.weixin.qq.com/miniprogram/dev/api/network/upload/wx.uploadFile.html
- https://kintone.dev/en/docs/kintone/rest-api/files/upload-file/

### downloadFile

Downloads files using a file key from kintone.

This is **NOT** the file key `uploadFile` returns.
You can get the file key from the following place.

- Attachment field in an app
- JavaScript and CSS customization settings of an app

#### Parameters

| Name       |  Type  | Required | Description                          |
| ---------- | :----: | :------: | ------------------------------------ |
| fileKey    | String |   Yes    | The file key of the downloaded file. |

#### Returns

`downloadFile` returns a Promise object that is resolved with the following value.

| Name         |  Type  | Description                                                                                                                                                                 |
| ------------ | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tempFilePath | String | Temporary file path. <br /> Ref. https://developers.weixin.qq.com/miniprogram/dev/framework/ability/file-system.html#%E6%9C%AC%E5%9C%B0%E4%B8%B4%E6%97%B6%E6%96%87%E4%BB%B6 |

#### Reference

- https://developers.weixin.qq.com/miniprogram/dev/api/network/download/wx.downloadFile.html
- https://kintone.dev/en/docs/kintone/rest-api/files/download-file/

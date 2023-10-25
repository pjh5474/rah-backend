import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: 'ap-northeast-2',
    });
    try {
      const objectName = `${Date.now() + file.originalname}`;
      const { Location: fileUrl } = await new AWS.S3()
        .upload({
          Body: file.buffer,
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      return { url: fileUrl };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Body() body) {
    // check if file is image
    const targetFolder = body.targetFolder;
    const isImage = file.mimetype.includes('image');
    if (!isImage) {
      return { ok: false, error: 'Please upload only images' };
    }

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
          Bucket: `${process.env.AWS_BUCKET_NAME}/${targetFolder}`,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      return { url: fileUrl };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Cant upload file to s3' };
    }
  }

  @Post('postImages')
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadImages(@UploadedFiles() images, @Body() body) {
    if (images && images.length === 0) {
      return;
    }

    const targetFolder = body.targetFolder;

    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: 'ap-northeast-2',
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: `commissionPhoto/${targetFolder}/`,
    };

    const s3 = new AWS.S3();

    try {
      const objects = await s3.listObjectsV2(params).promise();
      if (!objects.Contents.length) {
        await s3
          .putObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `commissionPhoto/${targetFolder}/`,
          })
          .promise();
      }
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Cant upload file to s3' };
    }

    try {
      const fileUrls = [];
      for (const image of images) {
        const objectName = `${Date.now() + image.originalname}`;
        const { Location: fileUrl } = await s3
          .upload({
            Body: image.buffer,
            Bucket: `${process.env.AWS_BUCKET_NAME}/commissionPhoto/${targetFolder}`,
            Key: objectName,
            ACL: 'public-read',
          })
          .promise();
        fileUrls.push(fileUrl);
      }
      return { urls: fileUrls };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Cant upload file to s3' };
    }
  }

  @Post('delPostImages')
  @UseInterceptors(FileInterceptor('file'))
  async deleteFile(@Body() body) {
    const targetFolder = body.targetFolder;

    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: 'ap-northeast-2',
    });

    if (!targetFolder) {
      return { ok: false, error: 'No target folder' };
    }

    try {
      const s3 = new AWS.S3();
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: `commissionPhoto/${targetFolder}/`,
      };
      const objects = await s3.listObjectsV2(params).promise();
      if (!objects.Contents.length) {
        return { ok: false, error: 'No files' };
      }

      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Delete: { Objects: [] },
      };

      objects.Contents.forEach((content) => {
        deleteParams.Delete.Objects.push({ Key: content.Key });
      });

      await s3.deleteObjects(deleteParams).promise();

      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Cant delete files from s3' };
    }
  }
}

import { program } from 'commander';
import path from 'path';
import * as process from 'node:process';
import { glob } from 'glob';
import * as fs from 'node:fs';
import archiver from 'archiver';
import axios from 'axios';
import FormData from 'form-data';

// 命令配置
program
  .version(require('../package').version)
  .option('-d, --dir <string>', '指定.map文件所在文件夹')
  .option('-u, --url <string>', '上传url')
  .on('--help', function () {
    console.log();
    console.log('Examples:');
    console.log(
      '   $ front-monitor-cli -d build -u http://127.0.0.1/upload      default init to current dir'
    );
    console.log();
  })
  .parse(process.argv);

const { dir = 'build', url } = program.opts();

const sourceMapDir = path.resolve(process.cwd(), dir);

(async () => {
  const mapFiles = await glob('**/*.map', {
    cwd: sourceMapDir,
    absolute: true,
  });

  if (!mapFiles?.length) {
    console.error('未发现.map文件！', sourceMapDir);
    return;
  }
  await uploadZip(url, mapFiles);
})();

async function uploadZip(url: string, files: string[]) {
  const outputPath = path.join(__dirname + '/temp.zip');
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', async function () {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(outputPath));

    try {
      const response: any = await axios.post(url, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      if (response?.data?.code === 0) {
        console.log('sourceMap文件上传成功！');
      } else {
        console.error('sourceMap文件上传失败:', response);
      }
    } catch (error) {
      console.error('sourceMap文件上传失败:', error);
    } finally {
      fs.unlinkSync(outputPath);
    }
  });

  archive.pipe(output);
  files.forEach((fullPath: string, index) => {
    const name = path.relative(sourceMapDir, fullPath);
    archive.file(fullPath, { name });
    console.log(index + 1, fullPath);
  });
  await archive.finalize();
}

/* eslint-disable no-undef */
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { uglify } from 'rollup-plugin-uglify';
import dts from 'rollup-plugin-dts';
import fs from 'fs';
import path from 'path';

const packagesDir = path.resolve(__dirname, 'packages');
// 命令行工具，打包方式与其他不同
const cliFiles = ['cli'];

const packageFiles = fs.readdirSync(packagesDir).filter(file => !cliFiles.includes(file));

function cliOutput(path) {
  return {
    input: [`./packages/${path}/src/index.ts`],
    output: {
      file: `./packages/${path}/dist/index.js`,
      format: 'cjs', // CommonJS，适合 Node.js 环境
      banner: '#!/usr/bin/env node', // 添加这行使得输出文件在 Unix-like 系统上可执行
    },
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
          },
        },
        useTsconfigDeclarationDir: true,
      }),
      resolve(),
      commonjs(),
      json(),
    ],
  };
}

function packageOutput(path) {
  return [
    {
      input: [`./packages/${path}/src/index.ts`],
      output: [
        {
          file: `./packages/${path}/dist/index.cjs.js`,
          format: 'cjs',
          sourcemap: true,
          exports: 'auto',
        },
        {
          file: `./packages/${path}/dist/index.esm.js`,
          format: 'esm',
          sourcemap: true,
          exports: 'auto',
        },
        {
          file: `./packages/${path}/dist/index.js`,
          format: 'umd',
          name: 'front-monitor',
          sourcemap: true,
          exports: 'auto',
        },
        {
          file: `./packages/${path}/dist/index.min.js`,
          format: 'umd',
          name: 'front-monitor',
          sourcemap: true,
          exports: 'auto',
          plugins: [uglify()],
        },
      ],
      plugins: [
        typescript({
          tsconfigOverride: {
            compilerOptions: {
              module: 'ESNext',
            },
          },
          useTsconfigDeclarationDir: true,
        }),
        resolve(),
        commonjs(),
        json(),
      ],
    },
    {
      input: `./packages/${path}/src/index.ts`,
      output: [
        { file: `./packages/${path}/dist/index.cjs.d.ts`, format: 'cjs' },
        { file: `./packages/${path}/dist/index.esm.d.ts`, format: 'esm' },
        { file: `./packages/${path}/dist/index.d.ts`, format: 'umd' },
        { file: `./packages/${path}/dist/index.min.d.ts`, format: 'umd' },
      ],
      plugins: [dts()],
    },
  ];
}

export default [
  ...packageFiles.map(path => packageOutput(path)).flat(),
  ...cliFiles.map(path => cliOutput(path)),
];

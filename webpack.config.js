import { CleanWebpackPlugin } from "clean-webpack-plugin";
import  CopyWebpackPlugin  from 'copy-webpack-plugin';

import path from "path";

const __dirname = path.resolve()

export default function(env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    devtool: production ? 'source-map' : 'inline-source-map',
    entry: {
      app: ['./src/main.ts']
    },
    output: {
        filename: 'bundle.js'
    },
    resolve: {
      extensions: ['.ts', '.js', '.html'],
      modules: ['src', 'node_modules']
    },
    devServer: {
      host: '0.0.0.0',
      port: 9000,
      historyApiFallback: true,
      open: !process.env.CI,
      devMiddleware: {
        writeToDisk: true,
      },
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: "./assets", to: "assets" }
        ],
      })
    ],
    module: {
      rules: [
        {
          test: /\.ts$/i,
          use: [
            {
              loader: 'ts-loader'
            }
          ],
          exclude: /node_modules/
        },
        {
            test: /\.html$/i,
            loader: "html-loader",
        },
        {
          test: /\.svg$/,
          loader: 'raw-loader' 
        },
        {
          test: /\.css$/,
          loader: 'css-loader' 
        }
      ]
    }
  }
}
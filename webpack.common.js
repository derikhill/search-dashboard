const path = require('path');
const walkSync = require('walk-sync');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const {CleanWebpackPlugin} = require('clean-webpack-plugin');

let pages = [];
try {
  walkSync('./src/components/print/').forEach(file => {
    if (file.endsWith('.html')) {
      let page = new HtmlWebpackPlugin({
        filename: `${file.replace('src/components/print/', '')}`,
        template: `src/components/print/${file.replace('src/components/print/', '')}`,
        // inject  : 'head',
        chunks: ['print']
      });
      pages.push(page);
    }
  });
} catch (error) {
  throw error;
}
module.exports = {
  entry: {
    app: './src/js/index.js',
    print: './src/js/print.js'
  },
  externals: {
    jquery: 'jQuery',
    foundation: 'Foundation'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    },
    {
      test: /\.(sa|sc|c)ss$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader
        },
        {
          loader: 'css-loader'
        },
        {
          loader: 'sass-loader',
          options: {
            implementation: require('sass')
          }
        }
      ]
    },
    {
      test: /\.(png|jpe?g|gif|svg)$/,
      use: {
        loader: 'file-loader',
        options: {
          outputPath: 'images'
        }
      }
    },
    {
      test: require.resolve('jquery'),
      use: [{
        loader: 'expose-loader',
        options: 'jQuery'
      },
      {
        loader: 'expose-loader',
        options: '$'
      }]
    },
    {
      test: /\.html$/i,
      loader: "html-loader"
    }
  ]},
  plugins: [
    new MiniCssExtractPlugin({
      chunkFilename: '[name].css'
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/images', 
        to: 'images'
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: 'api', 
        to: 'api'
      }
    ]),
    // new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['app']
    }),
    ...pages
  ]
};

const { cloneDeep, isArray, mergeWith } = require('lodash');
const { VueLoaderPlugin } = require('vue-loader');

const baseConfig = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          optimizeSSR: false,
        },
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[local]_[hash:base64:5]'
                }
              },
            ]
          }, {
            use: ['vue-style-loader', 'css-loader']
          }
        ],
      },
      {
        test: /\.scss$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[local]_[hash:base64:5]'
                }
              },
              'sass-loader',
            ]
          }, {
            use: ['vue-style-loader', 'css-loader', 'sass-loader']
          }
        ],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader?limit=100000'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  externals: {
    // Unused drivers for knex.
    'sqlite3': 'sqlite3',
    'mariasql': 'mariasql',
    'mssql': 'mssql',
    'mysql': 'mysql',
    'oracle': 'oracle',
    'strong-oracle': 'strong-oracle',
    'oracledb': 'oracledb'
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  performance: {
    hints: false
  },
};

function concatArray(objValue, srcValue) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
  // Indicates to use default merge strategy.
  return undefined;
}

function extendBaseConfig(config) {
  return mergeWith(cloneDeep(baseConfig), config, concatArray);
}

module.exports = { baseConfig, extendBaseConfig };

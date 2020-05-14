const glob =  require("glob");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require("autoprefixer");

const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// ------------------------------------------------------------------

const ENV = 'development';
const userSourceMap = (ENV === 'development');

console.log("---- webpack ----");

/*
* エイリアス
*  書式：
*  {
*    '@〇〇〇〇':'[パス]',
*    '@〇〇〇〇':'[パス]',
*    ・・・・・
*    '@〇〇〇〇':'[パス]'
*  }
*/
const alias = {
  '@root':`${__dirname}/src`
};

// ソースディレクトリ
const src_dir = `${__dirname}/src`;

// 出力ディレクトリ
const dist_dir = `${__dirname}/dist`;

// ---------------------------------------------------
// ファイルを読み込んでエントリーを作成する
const createEntory = (target, ignore) => {
  console.log('createEntory() ----');
  let _entry = {};
  let _list = glob.sync(target, { ignore: ignore});
  for(let i = 0; i<_list.length; i++){
    console.log('-----------------------');
    let _path = _list[i];
    console.log(_path);
    let _name = _path.replace(/\\/g, '/').replace(src_dir.replace(/\\/g, '/'), '').split('.').shift();
    console.log(_name);
    _entry[_name] = _path;
  }
  return _entry;
}

// ---------------------------------------------------



// jsエントリーファイル
let jsEntrys = createEntory(`${src_dir}/**/*.js`, `${src_dir}/**/_*.js`);
console.log("jsEntrys:");
console.log(jsEntrys);

// sassエントリーファイル
let sassEntrys = createEntory(`${src_dir}/**/*.scss`, `${src_dir}/**/_*.scss`);
console.log('sassEntrys:')
console.log(sassEntrys);

module.exports = [
  // ES next のコンパイル ------
  {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    // mode: "development",
  
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: jsEntrys,
    output: {
        // 出力ファイルのディレクトリ名
        path: dist_dir,
        // 出力ファイル名
        filename: "[name].js"
    },
    resolve: {
        alias: alias
    },
    module: {
      rules: [
        {
          // 拡張子 .js の場合
          test: /\.js$/,
          use: [
            {
              // Babel を利用する
              loader: "babel-loader",
              // Babel のオプションを指定する
              options: {
                presets: [
                  // プリセットを指定することで、ES2019 を ES5 に変換
                  "@babel/preset-env"
                ]
              }
            }
          ]
        },
        {
          test: /\.hbs$/,
          use:{
            loader: "handlebars-loader"
          }
        }
      ]
    },
    plugins: [
      // ファイルのコピー
      new CopyWebpackPlugin(
        [
          {
            test: /\.(html|jpe?g|png|gif|svg)/,
            from: '**/*',
            to: dist_dir,
            ignore: [
              '*.scss','*.js'
            ]
          },
        ],
        { context: src_dir }
      ),
      new WriteFilePlugin(),
    ]
  },
  // SASSのコンパイル ------
  {
    // mode: "development",
    entry: sassEntrys,
    output: {
      path: dist_dir,
      filename: '[name].css'
    },

    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: 
                  ExtractTextPlugin.extract(
                    {
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                  url: false,
                                  sourceMap: true,
                                }
                            },
                            
                            //"postcss-loader"
                            {
                              loader: "postcss-loader",
                              options: {
                                // PostCSS側でもソースマップを有効にする
                                sourceMap: true,
                                plugins: [
                                  // Autoprefixerを有効化
                                  // ベンダープレフィックスを自動付与する
                                  require("autoprefixer")({
                                    grid: true
                                  })
                                ]
                              }
                            },

                            {
                              loader: 'sass-loader?outputStyle=expanded',
                              options: {
                                  sourceMap: true
                              }
                            }

                        ]
                    }
                  )
            }
        ]
    },
    // --------------------------------------
    
    plugins: [
      new ExtractTextPlugin({filename:'[name].css'})
    ],
    
  }
  
];
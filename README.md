title: webpack-best-practice-最佳实践-部署生产
date: 2015-12-02 10:56:39
tags:
- webpack
- FE
- 前端
- 构建工具
categories: [webpack,FE,前端,构建工具]
---
# 前言
最近一段时间在项目中使用了webpack和React来开发，总之来说也是遇到了许多坑，webpack毕竟还是比较新的技术，而且也很难有一个很好的构建案例来适应所有的项目，总之，在看了许多项目demo和官方文档以及官方推荐的tutorials之后，也算是自己总结出的一套最佳实践吧。
## 代码
代码可以在我的[Github](https://github.com/TongchengQiu/webpack-best-practice)上。
[可以戳这里～～](https://github.com/TongchengQiu/webpack-best-practice)。
# package.json 命令配置
既然是需要用到的是实际项目的构建，那么必然就要考虑开发环境和生产环境下的配置项了：
```
// package.json
{
  // ...
  "scripts": {
    "build": "webpack --progress --colors --watch",
    "watch": "webpack-dev-server --hot --progress --colors",
    "dist": "NODE_ENV=production webpack --progress --colors"
  },
  // ...
}
```

可以在目录下执行 `npm run build` , `npm run watch` , `npm run dist`
解释一下:
+ build 是在我们开发环境下执行的构建命令;
+ watch 也是在开发环境下执行，但是加了webpack最强大的功能－－搭建静态服务器和热插拔功能（这个在后面介绍;
+ dist 是项目在要部署到生产环境时打包发布。

dist 里面的``NODE_ENV=production``是声明了当前执行的环境是production－生产环境
<br/>
后面跟着几个命令：
+ --colors 输出的结果带彩色
+ --progress 输出进度显示
+ --watch 动态实时监测依赖文件变化并且更新
+ --hot 是热插拔
+ --display-error-details 错误的时候显示更多详细错误信息
+ --display-modules 默认情况下 node_modules 下的模块会被隐藏，加上这个参数可以显示这些被隐藏的模块
+ -w 动态实时监测依赖文件变化并且更新
+ -d 提供sorcemap
+ -p 对打包文件进行压缩

# 目录结构
现在前端模块化的趋势导致目录结构也发生了很大的改变和争议，这只是我自己用到的一种形式，可以参考。
```
.
├── app                 #开发目录
|   ├──assets           #存放静态资源
|   |   ├──datas        #存放数据 json 文件
|   |   ├──images       #存放图片资源文件
|   |   └──styles       #存放全局sass变量文件和reset文件
|   ├──lib
|   |   ├──components   #存放数据 模块组件 文件
|   |   |   └──Header
|   |   |       ├──Header.jsx
|   |   |       └──Header.scss
|   |   |       
|   |   └──utils        #存放utils工具函数文件
|   |
|   └──views
|       ├──Index        #入口文件
|       |   ├──Index.html #html文件
|       |   ├──Index.jsx
|       |   └──Index.scss
|       └──Index2
├── dist                #发布目录
├── node_modules        #包文件夹
├── .gitignore     
├── .jshintrc      
├── webpack.config.js   #webpack配置文件
└── package.json
```
具体可以到Github上看demo。
# webpack.config.js
## 引入包
```
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
```
这个毋庸置疑吧。
## 判断是否是在当前生产环境
定义函数判断是否是在当前生产环境，这个很重要，一位开发环境和生产环境配置上有一些区别
```
var isProduction = function () {
  return process.env.NODE_ENV === 'production';
};
```
## 声明文件夹
```
// 定义输出文件夹
var outputDir = './dist';
// 定义开发文件夹
var entryPath = './app/views';
```
## 定义插件
```
var plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'commons',
    filename: 'js/commons.js',
  }),
  new webpack.ProvidePlugin({
    React: 'react',
    ReactDOM: 'react-dom',
    reqwest: 'reqwest',
  }),
];
if( isProduction() ) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      test: /(\.jsx|\.js)$/,
      compress: {
        warnings: false
      },
    })
  );
}
```
1. CommonsChunkPlugin 插件可以打包所有文件的共用部分生产一个commons.js文件。
2. ProvidePlugin 插件可以定义一个共用的入口，比如 下面加的 React ,他会在每个文件自动require了react，所以你在文件中不需要 require('react')，也可以使用 React。
3. 如果是在生产环境下，则加入插件 UglifyJsPlugin ，执行代码压缩，并且去除 warnings。

## 自动遍历多文件入口
```
var entris = fs.readdirSync(entryPath).reduce(function (o, filename) {
    !/\./.test(filename) &&
    (o[filename] = './' + path.join(entryPath, filename, filename + '.jsx'));
    return o;
  }, {}
);
```
函数会自动遍历开发的入口文件夹下面的文件，然后一一生产入口并且返回一个对象－－入口。
## 如果在这一步不需要多页面多入口
那么可以使用[html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)插件，它可以自动为入口生成一个html文件，配置如下：
```
var HtmlWebpackPlugin = require('html-webpack-plugin');
plugins.push(new HtmlWebpackPlugin({
  title: 'index',
  filename: outputDir+'/index.html',  #生成html的位置
  inject: 'body',                     #插入script在body标签里
}));
```
entry 就可以自定义一个入口就够了
## config的具体配置
```
var config = {
  target: 'web',
  cache: true,
  entry: entris,
  output: {
    path: outputDir,
    filename: 'js/[name].bundle.js',
    publicPath: isProduction()? 'http://******' : 'http://localhost:3000',
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loaders: ['babel?presets[]=es2015&presets[]=react'],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css?root='+__dirname, 'resolve-url', 'sass']
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'url?limit=1024&name=img/[name].[ext]'
      },
      {
        test: /\.(woff2?|otf|eot|svg|ttf)$/i,
        loader: 'url?name=fonts/[name].[ext]'
      },
      {
        test: /\.html$/,
        loader: 'file?name=views/[name].[ext]'
      },
    ]
  },
  plugins: plugins,
  resolve: {
    extensions: ['', '.js', 'jsx'],
  },
  devtool: isProduction()?null:'source-map',
};
```
这里来一一说明：
### 对于output
path和filename都不用多说了，path是生成文件的存放目录，filename是文件名，当然可以在前面加上目录位置。
这里提醒一下，filename 的相对路径就是 path了，并且下面 静态文件生成的filename也是相对于这里的path的，比如 image 和 html。
publicPath 的话是打包的时候生成的文件链接，比如 图片 资源，
如果是在生产环境当然是用服务器地址，如果是开发环境就是用本地静态服务器的地址。
### module loaders 打包加载的处理器
可以不用夹 loader了 比如 原来 url-loader  现在 url
#### js/jsx
```
{
  test: /(\.jsx|\.js)$/,
  loaders: ['babel?presets[]=es2015&presets[]=react'],
  exclude: /node_modules/
},
```
对于js文件和jsx文件用了babel来处理，这里注意一下，最新版本的babel吧es2015和react的处理分开了，所有要这么写。
### 处理scss文件
```
{
  test: /\.scss$/,
  loaders: ['style', 'css?root='+__dirname, 'resolve-url', 'sass']
},
```
这里用了sass、css、style的loader这不用多说了。
那么root和resolve-url是怎么回事呢，root是定义了scss文件里面声明的url地址是相对于根目录的，然后resolve-url回去相对解析这个路径，而不用require去获取，比如
```
background: url('./assets/images/webpack.png');
```
这样就可以加载到``./assets/images/webpack.png``这个文件，而不用使用相对路径和require
### 处理json文件
```
{
  test: /\.json$/,
  loader: 'json',
},
```
对于json文件，可以自动请求该模块并且打包。
### 处理 图片 字体 资源文件
```
{
  test: /\.(jpe?g|png|gif|svg)$/,
  loader: 'url?limit=1024&name=img/[name].[ext]'
},
{
  test: /\.(woff2?|otf|eot|svg|ttf)$/i,
  loader: 'url?name=fonts/[name].[ext]'
},
```
这里使用了 url 这个loader，但是url依赖 file-loader，它是对file-loader的二次封装。
在请求图片的时候如果文件大小小于 1024k ，使用内联 base64 URLs，否则会自动导入到name所声明的目录，这里是相对之前声明的 outputDir 路径。
字体资源也是一样。
### 处理html文件
```
{
  test: /\.html$/,
  loader: 'file?name=views/[name].[ext]'
},
```
在多页面的项目中需要，可以自动吧html文件导入到指定的生产文件夹下。
## resolve
```
resolve: {
  extensions: ['', '.js', 'jsx'],
},
```
是可以忽略的文件后缀名，比如可以直接``require('Header');``而不用加.jsx。
## devtool
```
devtool: isProduction()?null:'source-map',
```
规定了在开发环境下才使用 source-map。

# 疑问
目前为止，对于多页面项目还是没有找到一个很好的方案去构建自动化。

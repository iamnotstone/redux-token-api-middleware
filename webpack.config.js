var path=require("path");
var webpack = require("webpack");
module.exports = {
  entry:{
    index:path.resolve(__dirname, "./src/index.js"),
  },
  output:{
    path:path.resolve(__dirname, "./dist/"),
	  filename:"index.js",
		library: 'ReduxTokenApiMiddleware',
		libraryTarget: 'umd',
  },
  module : {
    rules: [
      { 
        test   : /\.js$|.jsx$/,
          //include: [path.resolve(__dirname, './client/src')],
        use: {
          loader : 'babel-loader',
          options: {
          	presets: ['env', 'react', 'stage-2'],
          }
        }
		  },
	  ]
  },
  watch : false,
	externals:{
    redux:{
      root: 'Redux',
      commonjs2: 'redux',
      commonjs: 'redux',
      amd: 'redux',
      umd: 'redux'
    },
    moment: {
      root: 'Moment',
      commonjs2: 'moment',
      commonjs: 'moment',
      amd: 'moment',
      umd: 'moment'
    }

	},
/*  plugins:[
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin()
  ]*/
};

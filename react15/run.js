const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const { execSync, exec} = require('child_process');
const waitOn = require('wait-on');
const chalk = require('chalk');
const killPort = require('kill-port');
const ora = require("ora");

(()=>{
    console.log(`----process.argv=${process.argv}`);
    const cmdStr = process.argv.pop();
    let fnMap = {
        'start':runDev,
        'dev':runDev,
        'build':runRelease,
        'release':runRelease
    };
   
    if(typeof fnMap[cmdStr] === 'function'){
        fnMap[cmdStr](); 
    }
    
})();

class Spinner {
    constructor(text) {
      this.ora = null;
      this.ora = ora({
        text,
        prefixText: chalk.gray("[my-react-fiber]")
      });
    }
}

const spinner = new Spinner().ora;


function runDev(){
    process.env.NODE_ENV = 'development';
    const devWebpackConfig = require('./webpack.config.js');
    const port = devWebpackConfig.devServer.port;

    console.log(`process.env.NODE_ENV=${process.env.NODE_ENV}`);
    
    killPort(port).then(res=>{
        //执行webpack-dev-server监听
        const compiler = webpack(devWebpackConfig); //创建renderer编译器实例
        const devServer = new WebpackDevServer(compiler, devWebpackConfig.devServer);
        devServer.listen(port, err => {
            if (err) return spinner.fail(`编译 renderer 代码失败, error: ${err}`);
        });
        //等待开发代码编译成功
        waitOn({
            resources: [`http://localhost:${port}`],
            timeout: '300000', //等待超时时间
        })
            .then(() => {
                spinner.succeed('本地开发服务启动成功:' + chalk.underline.blueBright(`http://localhost:${port}`));
            })
            .catch(err => {
                spinner.fail(`本地开发服务启动失败, error: ${err}`);
            });
    });
}

function runRelease(){
    /*
    process.env.NODE_ENV = 'production';
    const webpackConfig = require('./webpack.config.js');
    webpack(webpackConfig, function(err, stats) {
        console.log(`stats = ${stats}`);
        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }));
    });
    */
    process.env.NODE_ENV = 'production';
    execSync('webpack --mode production',{stdio: 'inherit'});
}


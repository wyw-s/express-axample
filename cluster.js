const cluster = require('cluster');
const os = require('os');

// 获取CPU 的数量
const numCPUs = os.cpus().length;
const workers = {};

if (cluster.isMaster) {
    // 主进程分支
    cluster.on('death', function (worker) {
        // 当一个工作进程结束时，重启工作进程
        delete workers[worker.pid];
        worker = cluster.fork();
        workers[worker.pid] = worker;
    });
    // 初始开启与CPU 数量相同的工作进程
    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork();
        workers[worker.pid] = worker;
    }
} else {
    // 工作进程分支，启动服务器
    const { server, port } = require('./bin/www');
    server.listen(port);
}
// 当主进程被终止时，关闭所有工作进程
process.on('SIGTERM', function () {
    for (var pid in workers) {
        process.kill(pid);
    }
    process.exit(0);
});
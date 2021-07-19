const MongoClient = require("mongodb").MongoClient;
const config = require('../config');
const url = `mongodb://localhost:27017`;

module.exports = {
    db: null,
    open() {
        if (this.db) {
            return Promise.resolve(this.db);
        }
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, (err, client) => {
                if (err) {
                    return reject(new Error(err));
                }
                this.db = client.db(config.db);
                console.log('连接数据库 microblog 成功')
                resolve(this.db);
            })
        })
    },
    close() {
        if (this.db) {
            this.db.close();
        }
    }
}
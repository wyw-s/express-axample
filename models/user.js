const crypto = require('crypto');
const mongodb = require('./db');

class User {
    constructor(user) {
        let pw = crypto.createHash("md5").update(user.password).digest('hex');
        this.name = user.name;
        this.password = pw;
    }

    // 注册用户
    save() {
        return new Promise((resolve) => {
            const _user = {
                name: this.name,
                password: this.password
            };
            mongodb.open().then(db => {
                const userCollection = db.collection('users');
                userCollection.insertOne(_user, (err, result) => {
                    if (err) throw new Error(err);
                    console.log('保存用户成功：' + JSON.stringify(_user));
                    mongodb.close();
                    resolve(result)
                })
            })
        })
    }

    // 查找用户
    static find(name) {
        return new Promise((resolve) => {
            mongodb.open().then(db => {
                const userCollection = db.collection('users');
                userCollection.findOne(name,(err, result) => {
                    if (err) throw new Error(err);
                    console.log('找到用户：' + JSON.stringify(result));
                    mongodb.close();
                    resolve(result);
                })
            })
        })
    }

    // 查找全部用户
    static findAll() {
        return new Promise((resolve, reject) => {
            mongodb.open().then(db => {
                let userCollection = db.collection('users');
                userCollection.find({}).toArray((err, result) => {
                    if (err) throw new Error(err);
                    console.log(`查询用户列表成功：` + JSON.stringify(result));
                    mongodb.close();
                    resolve(result);
                })
            })
        })
    }

    // 更新用户
    static update(id, user) {
        mongodb.open().then(db => {
            let userCollection = db.collection('users');
            userCollection.updateOne({ '_id': ObjectId(id) }, { $set: user }, (err, result) => {
                if (err) throw new Error(err);
                mongodb.close();
                console.log(`更新用户成功：` + user);
            })
        })
    }

    // 删除用户
    static remove(id) {
        mongodb.open().then(db => {
            let userCollection = db.collection('users');
            userCollection.deleteOne({ '_id': ObjectId(id) }, (err, result) => {
                if (err) throw new Error(err);
                mongodb.close();
                console.log(`删除用户成功：` + user);
            })
        })
    }
}

module.exports = User;
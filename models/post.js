
const mongodb = require('./db');

class Post {
    constructor(username, post, time) {
        this.user = username;
        this.post = post;
        if (time) {
            this.time = time;
        } else {
            this.time = new Date();
        }
    }

    save() {
        return new Promise((resolve, reject) => {
            // 存入 Mongodb 的文档
            const post = {
                user: this.user,
                post: this.post,
                time: this.time,
            };
            mongodb.open().then((db) => {
                // 读取 posts 集合
                const postsCollection = db.collection('posts');
                console.log(post);
                postsCollection.insertOne(post, (err, posts) => {
                    if (err) throw new Error(err);
                    console.log('保存成功：' + JSON.stringify(post));
                    mongodb.close();
                    resolve(posts)
                });
            });
        })
    }

    static find(name) {
        return new Promise((resolve, reject) => {
            mongodb.open().then(function (db) {
                // 读取 posts 集合
                const query = {};
                if (name) {
                    query.user = name
                }
                const postsCollection = db.collection('posts');
                postsCollection.find(query, { sort: { _id: -1 } }).toArray(function (err, docs) {
                    if (err) {
                        mongodb.close();
                        return reject(err)
                    }
                    // 封装 posts 为 Post 对象
                    const posts = [];
                    docs.forEach(function (doc, index) {
                        posts.push(new Post(doc.user, doc.post, doc.time));
                    });
                    mongodb.close();
                    resolve(posts)
                });
            });
        })
    }
}

module.exports = Post;
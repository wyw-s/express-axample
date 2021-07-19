const express = require('express');
const crypto = require('crypto');
const User = require('../models/user');
const Post = require('../models/post');
const router = express.Router();

// 首页
router.get('/', (req, res) => {
  Post.find(null).then((posts) => {
    res.render('index', {
      title: '首页',
      posts,
    });
  })
});

// 注册
router.get('/reg', (req, res) => {
  res.render('reg', {
    title: '用户注册'
  });
});
router.post('/reg', (req, res) => {
  const { passwordRepeat, password, username } = req.body;
  if (!username.trim()) {
    req.flash('error', '请输入用户名');
    return res.redirect('/reg');
  }
  //检验用户两次输入的密码是否一致
  if (passwordRepeat !== password) {
    req.flash('error', '两次输入的密码不一致');
    return res.redirect('/reg');
  }
  const newUser = new User({
    name: username,
    password,
  });

  //检查用户名是否已经存在
  User.find({ name: newUser.name }).then(result => {
    // 用户不存在则注册
    if (!result) {
      newUser.save().then(() => {
        req.session.user = newUser;
        req.flash('success', '注册成功');
        res.redirect('/');
      });
    } else {
      req.flash('error', 'Username already exists.');
      res.redirect('/reg');
    }
  }).catch((err) => {
    req.flash('error', err);
    res.redirect('/reg');
  });
});

// 登录
router.get('/login', (req, res) => {
  res.render('login', {
    title: '用户登入',
  });
});
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username.trim()) {
    req.session.user = null;
    req.flash('error', '请输入用户名');
    return res.redirect('/login');
  }
  //生成口令的散列值
  const md5 = crypto.createHash('md5');
  const passwordMd5 = md5.update(password).digest('hex');
  User.find({ name: username }).then((result) => {
    if (!result) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    } else {
      if (result.password !== passwordMd5) {
        req.flash('error', '密码错误，请重新输入');
        return res.redirect('/login');
      }
      req.session.user = result;
      req.flash('success', '登入成功');
      res.redirect('/');
    }
  });
});

// 发言
router.post('/post', (req, res) => {
  const { name } = req.session.user;
  const post = new Post(name, req.body.post);
  post.save().then(() => {
    req.flash('success', '发表成功');
    res.redirect(`/u/${name}`);
  }).catch((err) => {
    req.flash('error', err);
    return res.redirect('/');
  });
});

// 获取登录用户的所有发言数据
router.get('/u/:user', (req, res) => {
  const { user } = req.params;
  User.find({ name: user }).then((result) => {
    if (result) {
      Post.find(result.name).then((posts) => {
        res.render('user', {
          title: result.name,
          posts: posts,
        });
      }).catch(err => {
        req.flash('error', err);
        return res.redirect('/');
      });
    } else {
      req.flash('error', '用户不存在');
      return res.redirect('/');
    }
  }).catch(() => {
    req.flash('error', '用户不存在');
    return res.redirect('/');
  });
});

// 退出
router.get('/logout', (req, res) => {
  req.session.user = null;
  req.flash('success', '退出成功');
  res.redirect('/');
});

module.exports = router;

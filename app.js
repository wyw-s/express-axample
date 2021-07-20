const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');
const fs = require('fs');
const config = require('./config');
const router = require('./routes/index');
const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const errorLogfile = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(logger((tokens, req, res) => {
  return [
    `[${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}]`,
    tokens['remote-addr'](req),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}, { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: config.cookieSecret,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017',
    dbName: config.db
  })
}))
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if (!req.session.user && (req.url !== '/login' && req.url !== '/reg' && req.url !== '/')) {
    req.flash('error', '未登入');
    return res.redirect('/login');
  }
  if ((req.url === '/login' || req.url === '/reg') && req.session.user) {
    req.flash('error', '已登入');
    return res.redirect('/');
  }
  next();
})

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  let err = req.flash('error');
  let succ = req.flash('success');
  !err.length && (err = null)
  !succ.length && (succ = null)
  res.locals.error = err;
  res.locals.success = succ;
  next();
})

app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 将错误写入文件
  const meta = `[${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}] ${req.url}\n${err.stack}\n`
  errorLogfile.write(meta);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

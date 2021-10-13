const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session);

const options = {
  host: '39.123.4.73',
  port: '3306',
  user: 'abc',
  password: '123456789a',
  database: 'scdt',
};

const sessionStore = new MysqlStore(options);

require('dotenv').config({ path: __dirname + '/.env' });

const port = process.env.DB_PORT || 5000;

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect();

const upload = multer({
  storage: multer.diskStorage({
    destination: __dirname + '/uploads',
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + '-' + file.originalname);
    },
  }),
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'Secret key',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  }),
);

app.use('/image', express.static(__dirname + '/uploads'));

app.post('/thumbnail', upload.single('image'), (req, res) => {
  const image = `/image/${req.file.filename}`;
  res.send(image);
});

app.post('/uploadform', (req, res) => {
  const { id, title, category, brackets, value, hashTag } = req.body;
  const params = [id, title, value, hashTag, category, brackets];
  connection.query('INSERT INTO post VALUES (null,?,?,?,?,NOW(),NOW(),?,?,0,0,0)', params, (err, row) => {
    if (err) {
      console.log(err);
    }
    res.send(row);
  });
});

app.post('/detailpage', (req, res) => {
  const { postId } = req.body;
  connection.query(
    'SELECT category,bracket,title,post.createdAt,img,nickname,views,heart,hashTag,content FROM post LEFT JOIN testauth_id ON post.auth_id = testauth_id.auth_id where post_id = ?',
    [postId],
    (err, row) => {
      if (err) {
        console.log('나는 디테일 에러', err);
      }
      res.send(row);
    },
  );
});

app.post('/detailpage/views', (req, res) => {
  const { postId } = req.body;
  connection.query('UPDATE post SET views = views + 1 WHERE post_id = ?;', [Number(postId)], (err, row) => {
    if (err) {
      console.log('조회수부분 에러', err);
    }
    res.send(row);
  });
});

app.post('/detailpage/comment/count', (req, res) => {
  const { postId, count } = req.body;
  connection.query('UPDATE post SET count = ? WHERE post_id = ?', [Number(count), Number(postId)], (err, row) => {
    if (err) {
      console.log('코멘트갯수 에러', err);
    }
    res.send(row);
  });
});

app.post('/detailpage/comment', (req, res) => {
  const { comment, postId } = req.body;

  connection.query(
    'INSERT INTO post_comment VALUES (null,?,NOW(),?,2,NOW())',
    [Number(postId), comment],
    (err, row) => {
      if (err) {
        console.log('디테일페이지 에러입입니다.', err);
      }
      res.send(row);
    },
  );
});

app.post('/detailpage/comment/list', (req, res) => {
  const { postId } = req.body;

  connection.query(
    'SELECT comment_id,post_comment.post_id,content,post_comment.createdAt,img,nickname FROM post_comment INNER JOIN testauth_id ON post_comment.auth_id = testauth_id.auth_id WHERE post_id = ?',
    [Number(postId)],
    (err, row) => {
      if (err) {
        console.log('코멘트리스트 불러올 때 에러입니다.', err);
      }
      res.send(row);
    },
  );
});

app.post('/detailpage/recomment', (req, res) => {
  const { reComment, commentId } = req.body;

  connection.query('INSERT INTO post_recomment VALUES(null,?,2,?,NOW(),NOW())', [commentId, reComment], (err, row) => {
    if (err) {
      console.log('대댓글 에러에요', err);
    }
    res.send(row);
  });
});

app.post('/detailpage/recomment/list', (req, res) => {
  const { postId } = req.body;

  connection.query(
    'SELECT post_recomment.comment_id,post_recomment.auth_id,recomment,post_recomment.createdAt,nickname,img FROM post_recomment LEFT JOIN post_comment ON post_recomment.comment_id = post_comment.comment_id LEFT JOIN testauth_id ON post_recomment.auth_id = testauth_id.auth_id WHERE post_id = ?',
    [Number(postId)],
    (err, row) => {
      if (err) {
        console.log('대댓글 에러', err);
      }

      res.send(row);
    },
  );
});

app.post('/detailpage/heart', (req, res) => {
  const { postId } = req.body;

  connection.query('SELECT * FROM post_heartbox WHERE post_id = ?', [postId], (err, row) => {
    if (err) {
      console.log(err);
    }
    res.json({ count: row.length });
  });
});

app.post('/detailpage/hearted', (req, res) => {
  const { postId, auth } = req.body;

  connection.query('SELECT * FROM post_heartbox WHERE post_id = ? AND auth_id = ?', [postId, auth], (err, row) => {
    if (err) {
      console.log(err);
    }

    let result = false;
    if (row.length !== 0) {
      result = true;
    }
    res.json({ result, info: row });
  });
});

app.post('/detailpage/heart/add', (req, res) => {
  const { postId, auth } = req.body;

  connection.query('INSERT INTO post_heartbox VALUES (null,?,?,NOW(),NOW())', [auth, postId], (err, row) => {
    if (err) {
      console.log(err);
    }
    res.send(true);
  });
});

app.post('/detailpage/heart/addCount', (req, res) => {
  const { postId } = req.body;

  connection.query('UPDATE post SET heart=heart+1 WHERE post_id=?;', [postId], (err, row) => {
    if (err) {
      console.log(err);
    }
    res.send(true);
  });
});

app.post('/detailpage/heart/remove', (req, res) => {
  const { postId, auth, heartId } = req.body;

  connection.query(
    'DELETE FROM post_heartbox WHERE auth_id = ? AND post_id = ? AND heart_id = ?;',
    [auth, postId, heartId],
    (err, row) => {
      if (err) {
        console.log(err);
      }
      res.send(false);
    },
  );
});

app.post('/detailpage/heart/removeCount', (req, res) => {
  const { postId } = req.body;

  connection.query('UPDATE post SET heart=heart-1 WHERE post_id=?;', [postId], (err, row) => {
    if (err) {
      console.log(err);
    }
    res.send(false);
  });
});

app.post('/notice/list', (req, res) => {
  const { board } = req.body;

  let category;
  if (board === 'board' || board === '주요소식') {
    category = '주요소식';
  } else if (board === 'free' || board === '자유게시판') {
    category = '자유게시판';
  } else if (board === 'video' || board === '비디오') {
    category = '비디오';
  }

  connection.query(
    'SELECT post_id,count,heart,nickname,title,content,post.createdAt,category,bracket,views FROM post INNER JOIN testauth_id ON post.auth_id = testauth_id.auth_id WHERE category = ?',
    [category],
    (err, row) => {
      if (err) {
        console.log('게시판리스트 에러입니다.', err);
      }
      res.send(row);
    },
  );
});

// 유저 로직

app.get('/loginCheck', (req, res) => {
  if (req.session.isLogin) {
    res.send({ checkLogin: true, username: req.session.user_id });
  } else {
    res.send({ checkLogin: false });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.post('/user/login', (req, res) => {
  /*
  const loginUsername = auth
    .map((user) => {
      return user.username;
    })
    .filter((username) => {
      return req.body.user_name === username;
    })[0];

  const loginUserPwd = auth
    .map((user) => {
      return user.pwd;
    })
    .filter((pwd) => {
      return req.body.user_pwd === pwd;
    })[0];

  if (auth.length !== 0 && loginUsername && loginUserPwd) {
    req.session.isLogin = true;
    req.session.user_id = req.body.user_name;
    res.send({ checkLogin: true, nickname: req.body.user_name, reLogin: false });
  } else {
    res.send({ checkLogin: false, reLogin: true });
  }
  */
  connection.query('select username, password from auth', (err, rows) => {
    if (err) {
      throw err;
    } else {
      const authUsername = rows.filter((user) => {
        return req.body.user_name === user.username;
      })[0];
      const authPwd = rows.filter((user) => {
        return req.body.user_pwd === user.password;
      })[0];

      console.log(authUsername);
      console.log(authPwd);
      if (authUsername && authPwd) {
        req.session.isLogin = true;
        req.session.user_id = req.body.user_name;
        res.send({ checkLogin: true, nickname: req.body.user_name, reLogin: false });
      } else {
        res.send({ checkLogin: false, reLogin: true });
      }
    }
  });
});

app.post('/auth/join', (req, res) => {
  connection.query(
    'INSERT INTO auth(username, password, name, gender, bYear, bMonth, bDay, phoneNumber) Values(?, ?, ?, ?, ?, ?, ?, ?)',
    [
      req.body.username,
      req.body.pwd,
      req.body.name,
      req.body.gender,
      req.body.birthdayYear,
      req.body.birthdayMonth,
      req.body.birthdayDay,
      req.body.phoneNumber,
    ],
    (err) => {
      if (err) {
        console.log('err');
      } else {
        console.log('성공');
      }
    },
  );
  res.send('회원가입 성공');
});

app.post('/auth/username', (req, res) => {
  /*
  const authUsername = auth.map((user) => {
    return user.username;
  });
  res.send(authUsername);
  */
  connection.query('select username from auth', (err, rows, fields) => {
    if (err) {
      throw err;
    } else {
      const authUsername = rows.filter((user) => {
        return user.username === req.body.username;
      })[0];

      if (authUsername) {
        res.send({ repeat: true });
      } else {
        res.send({ repeat: false });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`서버 ${port}가 열렸습니다.`);
});

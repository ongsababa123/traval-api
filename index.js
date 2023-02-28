var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const mysql = require("mysql");
var jwt = require("jsonwebtoken");
const secret = "Fullstack-login";
require('dotenv').config()
app.use(cors());
// const db = mysql.createConnection({
//   user: "root",
//   host: "localhost",
//   password: "",
//   database: "datahotel",
//   port: 3306,
// });

const db = mysql.createConnection(process.env.DATABASE_URL)

app.post("/register", jsonParser, function (req, res, next) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    db.query(
      "INSERT INTO users (idcard, name, lastname, email, tel, password) VALUES (?, ?, ?, ?, ?, ?)",
      [
        req.body.id,
        req.body.name,
        req.body.lastname,
        req.body.email,
        req.body.tel,
        hash,
      ],
      function (err, result, fields) {
        let data = {
          status: true,
          meg: "register successfully",
        };
        !err ? res.json(data) : res.json({ status: false, meg: err });
      }
    );
    // console.log(err);
  });
});

app.post("/user", jsonParser, function (req, res, next) {
  db.query(
    `SELECT * FROM users WHERE email= '${req.body.email}'`,
    (err, result, fields) => {
      var user = result[0];
      // if (err) {
      //   res.json({ status: "error", message: err });
      //   return;
      // }
      // else {
      //   res.json({user , status: "ok"});
      //   // console.log(result);
      //   return;
      // }

      try {
        res.json({ user, status: "ok" });
      } catch (error) {
        res.json({ status: "error", message: err });
      }
    }
  );
});

app.get("/userdata", (req, res, next) => {
  db.query(`SELECT * FROM users `, (err, result) => {
   if (err) {
    console.log(err);
   }else {
    res.send(result);
   }
  });
});

app.post("/login", jsonParser, function (req, res, next) {
  db.query(
    `SELECT * FROM users WHERE email= '${req.body.email}'`,
    (err, result, fields) => {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      if (result.length === 0) {
        res.json({ status: "error", message: "no users found" });
        return;
      }
      // console.log(result[0].password);
      // console.log(req.body.password);
      console.log(result);
      bcrypt.compare(
        req.body.password,
        result[0].password,
        function (err, isLogin) {
          // console.log(isLogin);
          if (isLogin === true) {
            var token = jwt.sign({ email: result[0].email }, secret, {
              expiresIn: "1h",
            });
            res.json({ status: "ok", message: "login success", token });
          } else if (isLogin === false) {
            res.json({ status: "error", message: "login failed" });
          }
        }
      );
    }
  );
});

app.post("/authen", jsonParser, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, secret);
    res.json({ status: "ok", decoded });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.put("/update", jsonParser, function (req, res, next) {
  console.log(req.body);
  const id = req.body.id;
  const idcard = req.body.idcard;
  const name = req.body.name;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const tel = req.body.tel;
  db.query(
    "UPDATE users SET idcard = ?, name = ?, lastname = ?, email = ?, tel = ?  WHERE id = ?",
    [idcard, name, lastname, email, tel, id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json({ status: "ok", result });
      }
    }
  );
});

app.get("/roomdata", jsonParser,function (req, res, next) {
  db.query(`SELECT * FROM room`, (err, result) => {
    if (err) {
     console.log(err);
    }else {
      // console.log(result);
     res.send(result);
    }
   });
})

app.get("/superiordata", jsonParser,function (req, res, next) {
  db.query(`SELECT * FROM superior`, (err, result) => {
    if (err) {
     console.log(err);
    }else {
      // console.log(result);
     res.send(result);
    }
   });
})

app.post("/payroom", jsonParser,function (req, res, next) {
  // console.log(req.body);
  var name = req.body.nameroom;
  var key = req.body.roomkey;

  db.query(`SELECT * FROM ${name} WHERE id_room = '${key}'`, (err, result) => {
    if (err) {
     console.log(err);
    }else {
      // console.log(result);
     res.send(result);
    }
   });
})


// app.delete("/delete/:id", (req, res) => {
//   const id = req.params.id;
//   db.query("DELETE FROM user WHERE id = ?", id, (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(result);
//     }
//   });
// });
app.listen(process.env.PORT || 300)
db.end();

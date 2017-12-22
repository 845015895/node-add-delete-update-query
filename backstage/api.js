let urlLib = require('url');
let mysql = require('mysql');
let async = require('async');
let express = require('express');
let bodyParser = require('body-parser');

let app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//设置跨距
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, POST, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});


let connection = mysql.createConnection({
    host: 'yizicheng.cn',
    user: 'root',
    password: '123456',
    database: 'yzc'
});


connection.connect();


//注册接口
app.post('/user/reg', function (req, res) {
    //查询用户是否存在
    let querySql = "select * from user where userName = ?";
    let queryParams = "";
    let userCount = 1;
    //添加用户
    let addSql = "insert into user values(?,?,?)";
    let addParams = "";

    let reg_err1 = {"ok": false, "msg": "此用户已存在"};
    let reg_finish = {"ok": true, "msg": "注册成功"};
    let obj = urlLib.parse(req.url, true);
    // const url = obj.pathname;
    // const POST = obj.query;

    const POST = req.body;
    async.waterfall([//处理数据库异步回掉
        function selectUser(cb) {
            queryParams = POST.user;
            connection.query(querySql, queryParams, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                userCount = result.length;
                cb(null, userCount);
            });
        },
        function addUser(userCount, cb) {
            if (userCount) {
                res.json(reg_err1);
            } else {
                addParams = [null,POST.user, POST.pass];
                connection.query(addSql, addParams, function (err, result) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        return;
                    }
                    cb(null, result);
                    res.json(reg_finish);
                });
            }

        }]
    );
});


//登录接口
app.post('/user/log', function (req, res) {
    // 输出 JSON 格式
    //  response.end(JSON.stringify(data));
    // let obj = urlLib.parse(req.url, true);
    // const POST = obj.query;
    let querySqlLog = "select password from user where userName = ?";
    let log_err = {"ok": false, "msg": "账号或密码错误"};
    let log_finish = {"ok": true, "msg": "登录成功"};
    const POST = req.body;
    queryParams = POST.user;
    connection.query(querySqlLog, queryParams, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if (result.length) {
            if (result[0].password === POST.pass) {
                res.json(log_finish);
            } else {
                res.json(log_err);
            }

        } else {
            res.json(log_err);
        }
    });
});


//查询用户列表
app.get('/user/list',function (req, res) {
    let obj = urlLib.parse(req.url, true);
    let queryAllSql = "select * from user";
    const GET = obj.query;

    if(GET.act === "getUserList"){
        connection.query(queryAllSql,function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                return;
            }
            res.json(result);
        })
    }
});
//删除用户
app.delete('/user/delete',function (req, res) {
    let obj = urlLib.parse(req.url, true);
    let deleteSql = "delete from user where id = ?";
    let deleteMsg = {
      ok: true,
      msg: "删除成功"
    };
    const DELETE = obj.query;
    let deleteId = DELETE.id;

    connection.query(deleteSql,deleteId,function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if(result.affectedRows){
            res.json(deleteMsg);
        }

    })
});

//增加用户
app.post("/user/add", function (req, res) {
    //查询用户是否存在
    let querySql = "select * from user where userName = ?";
    let queryParams = "";
    let userCount = 1;
    //添加用户
    let addSql = "insert into user values(?,?,?)";
    let addParams = "";

    let add_err = {"ok": false, "msg": "此用户已存在"};
    let add_finish = {"ok": true, "msg": "添加成功"};

    // const url = obj.pathname;
    // const POST = obj.query;

    const POST = req.body;
    let addUserName = POST.newUser;
    let addPwd = POST.newPwd;
    async.waterfall([//处理数据库异步回掉
        function selectUser(cb) {
            queryParams = addUserName;
            connection.query(querySql, queryParams, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR1] - ', err.message);
                    return;
                }
                userCount = result.length;
                cb(null, userCount);
            });
        },
        function addUser(userCount, cb) {
            if (userCount) {
                res.json(add_err);
            } else {
                addParams = [null,addUserName, addPwd];
                connection.query(addSql, addParams, function (err, result) {
                    if (err) {
                        console.log('[SELECT ERROR2] - ', err.message);
                        return;
                    }
                    cb(null, result);

                    let addQuerySql = "select id from user where userName = ?";
                    connection.query(addQuerySql,addUserName,function (err, result) {
                        if (err) {
                            console.log('[SELECT ERROR3] - ', err.message);
                            return;
                        }
                        add_finish.id = result[0].id;
                        res.json(add_finish);
                    })

                });

            }

        }]
    );
});

app.post("/user/update", function (req,res) {
    const POST = req.body;
    let id = POST.id;
    let update = POST.update;

    let updateSql = "update user set password = ? where id = ?";
    let updateParams = [update,id];

    connection.query(updateSql,updateParams, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR2] - ', err.message);
            res.json({"ok":false});
            return;
        }

        if(result.changedRows){
            res.json({"ok":true});
        }



    });
});


//配置服务端口
let server = app.listen(30000, function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log('listening at http://%s:%s', host, port);
});





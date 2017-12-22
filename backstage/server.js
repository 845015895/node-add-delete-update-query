let http = require('http');
let fs = require('fs');
let queryString = require('querystring');
let urlLib = require('url');
let mysql = require('mysql');
let async = require('async');
let express = require('express');

let app = express();
//设置跨距
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});


let server = http.createServer(function (req, res) {
    req.setEncoding('utf8');
    let str = "";
    req.on('data', function () {
        str += data;
    });
    req.on('end', function () {


        let obj = urlLib.parse(req.url, true);
        const url = obj.pathname;
        const GET = obj.query;
        const POST = queryString.parse(str);


        let connection = mysql.createConnection({
            host: 'yizicheng.cn',
            user: 'root',
            password: '123456',
            database: 'yzc'
        });


        //查询用户是否存在
        let querySql = "select * from user where userName = ?";
        let queryParams = "";
        let userCount = 1;

        //添加用户
        let addSql = "insert into user values(?,?)";
        let addParams = "";


        // /user?act=reg&user=yzc&pass=123456;
        if (url === '/user') {

            connection.connect();
            switch (GET.act) {
                case 'reg':
                    async.waterfall([//处理数据库异步回掉
                            function selectUser(cb) {
                                queryParams = GET.user;
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
                                    res.write('{"ok":false,"msg":"此用户已存在"}');
                                    res.end();
                                } else {
                                    addParams = [GET.user, GET.pass];
                                    connection.query(addSql, addParams, function (err, result) {
                                        if (err) {
                                            console.log('[SELECT ERROR] - ', err.message);
                                            return;
                                        }
                                        cb(null, result);

                                        res.write('{"ok":true,"msg":"注册成功"}','utf-8');
                                        res.end();
                                    });
                                }

                            }], function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('c:' + result)
                            }
                        }
                    );
                    break;
                case 'login':
                    res.write('{"ok":true,"msg":"注册成功"}','utf-8');
                    break;
                default:
                    res.write('{"ok":false,"msg":"请求失败"}','utf-8');
                    break;
            }


        }
    });

});

server.listen(30000);


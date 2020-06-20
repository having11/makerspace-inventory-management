const config = require("./config.js");
const mysql = require("mysql");

var pool = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

var DB = (() => {
    function _query(query, callback) {
        pool.getConnection((err, connection) => {
            if(err) {
                callback(null, err);
                throw err;
            }
            connection.query(query, (err, rows) => {
                connection.release();
                if(err) callback(null, err);
                else callback(rows);
            });
            connection.on('error', (err) => {
                connection.release();
                callback(null, err);
                throw err;
            });
        });
    };
    return {
        query: _query
    }
})();

var DB_params = (() => {
    function _query(query, params, callback) {
        pool.getConnection((err, connection) => {
            if(err) {
                callback(null, err);
                throw err;
            }
            connection.query(query, params, (err, rows) => {
                connection.release();
                if(err) callback(null, err);
                else callback(rows);
            });
            connection.on('error', (err) => {
                connection.release();
                callback(null, err);
                throw err;
            });
        });
    };
    return {
        query: _query
    }
})();

module.exports = {DB: DB, DB_params: DB_params};
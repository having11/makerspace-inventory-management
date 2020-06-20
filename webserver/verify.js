var mysql = require('./mysql.js');

var verify_user = (() => {
    function _verify_user(username, token, callback) {
        mysql.DB_params.query(`SELECT EXISTS(SELECT 1 FROM User WHERE username = ?) AS mycheck`, [
            username], (data, error) => {
            if(!data) callback({valid: 0, message: "user does not exist"});
            if(data[0].mycheck === 0) {
                callback({valid: 0, message: "user does not exist"});
            } else {
                mysql.DB_params.query("SELECT * FROM UserAccessTokens WHERE username = ? AND\
                     token = ? AND is_valid = 1 LIMIT 1",
                [username, token], (data, err) => {
                    if(data.length === 0) {
                        callback({valid: 0, message: "invalid token"});
                    } else {
                        callback({valid: 1, message: "user authenticated"});
                    }
                });
            }
        });
    };
    return {
        verify_user: _verify_user
    }
})();

var verify_admin = (() => {
    function _verify_admin(username, token, callback) {
        verify_user.verify_user(username, token, (response) => {
            if(response.valid === 0) callback(response);
            else {
                mysql.DB_params.query("SELECT EXISTS(SELECT 1 FROM UserAdmin WHERE username = ?) AS mycheck",
                [username], (data, err) => {
                    if(data[0].mycheck) callback({admin_valid: 1, message: "verified as admin"});
                    else callback({admin_valid: 0, message: "user not admin"});
                });
            }
        });
    };
    return {
        verify_admin: _verify_admin
    }
})();

module.exports = {verify: {verify_user: verify_user, verify_admin: verify_admin}};
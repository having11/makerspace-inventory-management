var mysql = require('./mysql.js');

var add_admin = (() => {
    function _add_admin(username, callback) {
        if(username == false) {
            callback("'username' cannot be blank");
        }
        mysql.DB_params.query(`SELECT EXISTS(SELECT 1 FROM User WHERE username = ?) AS mycheck`, [
            username], (data, error) => {
                if(data[0].mycheck === 0){
                    callback("User does not exist");
                }
                mysql.DB_params.query(`SELECT EXISTS(SELECT 1 FROM UserAdmin WHERE username = ?) AS mycheck`, [
                    username], (data, error) => {
                        if(data[0].mycheck === 1){
                            callback("User already is an admin");
                        }
                        mysql.DB_params.query(`INSERT INTO UserAdmin (username) values (?)`, [
                            username], (data, error) => {
                                callback(`Added user ${username} as admin`);
                            });
                    });
            });
    };
    return {
        add_admin: _add_admin
    };
})();

var remove_admin = (() => {
    function _remove_admin(username, callback) {
        if(username == false) {
            callback("'username' cannot be blank");
            return;
        }
        mysql.DB_params.query('DELETE FROM UserAdmin WHERE username = ?', [
            username], (data, error) => {
                callback((data.affectedRows !== 0) ? `Removed ${username} from admins` : `User is already not an admin`);
        });
    };
    return {
        remove_admin: _remove_admin
    };
})();

var list_admins = (function () {
    function _list_admins(callback) {
        mysql.DB.query('SELECT * FROM UserAdmin', (data, error) => {
            if(data.length === 0) {
                callback("No admins found");
                return;
            }
            let response_str = 'Username   |   Added at';
            data.forEach(user => {
                var d = new Date(user.added_at);
                response_str += `\n${user.username}  |  ${d.toLocaleString()}`;
            });
            callback(response_str);
        });
    };
    return {
        list_admins: _list_admins
    };
})();

module.exports = {add_admin: add_admin, remove_admin: remove_admin, list_admins: list_admins};
var router = require('express').Router(),
    mysql = require('./mysql.js'),
    formidable = require('formidable'),
    config = require('./config.js'),
    image_up = require('./images.js'),
    crypto = require('crypto'),
    hat = require('hat'),
    verify = require('./verify.js'),
    rack = hat.rack(bits=128, base=16);

router.post(config.paths.api_root + "user/create", (req, res) => {
    form = new formidable({uploadDir: config.paths.images.internal.tmp, keepExtensions: true});
    form.parse(req, (err, fields, files) => {
        console.log(fields, files);
        mysql.DB_params.query("SELECT EXISTS(SELECT 1 FROM User WHERE username = ?) as mycheck",
        [fields.username], (data, error) => {
            if(data[0].mycheck === 1) {
                //console.log("User already exists");
                res.status(403).send("ERROR: User already exists");
            }
            else {
                let pword_hash = crypto.createHash('sha256').update(fields.password)
                    .digest('hex');
                mysql.DB_params.query("INSERT INTO User (username, pword_hash, first_name, last_name,\
                    email_address) values (?, ?, ?, ?, ?)", 
                    [fields.username, pword_hash, fields.f_name, fields.l_name,
                    fields.email_addr], (data2, error) => {
                        //console.log(data2, error);
                        var file = files.image;
                        console.log(file);
                        //console.log("found file");
                        image_up.upload_photo(config.paths.images.internal.profile,
                            config.paths.images.external.profile, config.images.profile_imgs.width, 
                            config.images.profile_imgs.height, file, (img_data) => {
                            console.log(`ID is: ${img_data.id} and path is: ${img_data.path}`);
                            link_image(fields.username, img_data.id);
                        });
                        res.status(200).send("User created.");
                    });
            }
        });
        
    });
});

router.post(config.paths.api_root + "user/login", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var pword_hash = crypto.createHash('sha256').update(password).digest('hex');
    mysql.DB_params.query("SELECT username, pword_hash FROM User WHERE username = ?", 
    [username], (data, err) => {
        //console.log(data);
        let response_data = {};
        if(data === null) {
            response_data.code = 403;
            response_data.message = "ERROR: User does not exist";
            response_data.valid = 0;
            res.status(response_data.code).send(JSON.stringify(response_data));
        } else {
            if(data[0].pword_hash === pword_hash) {
                //console.log("matches");
                let access_token = rack();
                //console.log(access_token);
                logout_user(username, (result) => {
                    mysql.DB_params.query("INSERT INTO UserAccessTokens (username, token, is_valid)\
                    values (?, ?, ?)", [data[0].username, access_token, 1], (data, err) => {
                        //console.log(data);
                        response_data.code = 201;
                        response_data.message = "Successfully logged in";
                        response_data.valid = 1;
                        response_data.token = access_token;
                        res.status(response_data.code).send(JSON.stringify(response_data));
                    });
                });
            } else {
                //console.log("invalid");
                response_data.code = 200;
                response_data.message = "ERROR: Invalid username/password";
                response_data.valid = 0;
                res.status(response_data.code).send(JSON.stringify(response_data));
            }
        }
    });
});

router.post(config.paths.api_root + "user/logout", (req, res) => {
    var username = req.body.username;
    var token = req.body.token;
    verify.verify.verify_user(username, token, (response) => {
        res_data = {};
        if(response.valid)
        {
            logout_user(username, (result) => {
                if(result)
                {
                    res_data.code = 201;
                    res_data.message = "Successfully logged out";
                }
            });
            
        } else {
            res_data.code = 401;
            res_data.message = "User not authorized";
        }
        res.status(res_data.code).send(res_data.message);
    });
});

router.post(config.paths.api_root + "user/get_data/all", (req, res) => {
    var username = req.body.username;
    var token = req.body.token;
    verify.verify.verify_user.verify_user(username, token, (response) => {
        //console.log(response);
        if(response.valid) {
            verify.verify.verify_admin.verify_admin(username, token, (admin_data) => {
                //console.log(admin_data);
                if(admin_data.admin_valid)
                {
                    get_user_data_all((data) => {
                        res.status(201).send(JSON.stringify(data));
                    });
                } else {
                    get_user_data(username, (data) => {
                        res.status(201).send(data);
                    });
                }
            });
        } else {
            res.status(403).send(response);
        }
    });
});

router.post(config.paths.api_root + "user/verifyAdmin", (req, res) => {
    var username = req.body.username,
        token = req.body.token;
    verify.verify.verify_admin.verify_admin(username, token, (admin_data) => {
        if(admin_data.admin_valid) {
            //console.log("valid user");
            res.status(201).send(JSON.stringify({valid: true}));
        }
        else
            res.status(403).send(JSON.stringify({valid: false}));
    });
});

router.post(config.paths.api_root + "user/get_data", (req, res) => {
    var username = req.body.username;
    var token = req.body.token;
    verify.verify.verify_user.verify_user(username, token, (response) => {
        //console.log(response);
        if(response.valid) {
            get_user_data(username, (data) => {
                res.status(201).send(data);
            });
        } else {
            res.status(403).send(response);
        }
    });
});



function get_user_data(username, callback)
{
    mysql.DB_params.query("SELECT User.*, Image.*\
    FROM User\
    INNER JOIN Image\
        ON Image.id = User.profile_image_id\
    WHERE User.username = ?", [username], (data, err) => {
            callback({
                username: username,
                name: data[0].full_name,
                email_addr: data[0].email_address,
                date_created: data[0].created_at,
                nfc_string: data[0].nfc_string,
                prof_pic_path: data[0].img_path
            });
    });
}

function get_user_data_all(callback)
{
    mysql.DB.query("SELECT User.*, Image.*\
    FROM User\
    INNER JOIN Image\
        ON Image.id = User.profile_image_id", (data, err) => {
        callback(data);
    });
}

function logout_user(username, callback) {
    mysql.DB_params.query("UPDATE UserAccessTokens SET is_valid = 0 WHERE username = ? AND is_valid = 1", 
    [username], (data, error) => {
        callback((error) ? 1 : 0);
    });
}

function link_image(username, img_id) {
    mysql.DB_params.query("UPDATE User SET profile_image_id = ? WHERE username = ?",
    [img_id, username], (data, error) => {
        //console.log(data, error);
    });
}

module.exports = router;
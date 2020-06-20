var router = require('express').Router(),
    mysql = require('./mysql'),
    config = require('./config'),
    verify = require('./verify').verify;

router.post(config.paths.api_root + "checkout/checkout", (req, res) => {
    verify.verify_user.verify_user(req.body.username, req.body.token, (response) => {
        if(response.valid) {
            if(req.body.quantity === 0) res.status(403).send("Amount can't be 0");
            else {
                currentItemQuantity(req.body.id, req.body.category, (quantity) => {
                    //console.log(quantity - req.body.quantity);
                    if(quantity - req.body.quantity >= 0) {
                    mysql.DB_params.query("UPDATE Part SET quantity = quantity - ? WHERE id = ? AND category = ?",
                    [req.body.quantity, req.body.id, req.body.category], (data, err) => {
                        //console.log(data, err);
                    });
                    mysql.DB_params.query("INSERT INTO CheckOut (username, part_id, part_category, quantity, due_optional) \
                    VALUES (?, ?, ?, ?, ?)",
                    [req.body.username, req.body.id, req.body.category, req.body.quantity, true], (data, err) => {
                        res.status(201).send("Successfully checked out item");
                    });
                    mysql.DB_params.query("UPDATE ShoppingCart SET user_quantity = user_quantity - ? WHERE \
                    username = ? AND part_id = ? AND part_category = ?", [req.body.quantity, req.body.username, 
                    req.body.id, req.body.category], (data, err) => {
                        //console.log(data, err);
                        mysql.DB_params.query("DELETE FROM ShoppingCart WHERE username = ? AND user_quantity <= 0 LIMIT 1", 
                        [req.body.username], (data, err) => {
                            //console.log(data, err);
                        });
                    });
                } else {
                    res.status(403).send("Requested quantity exceeds current items in stock");
                }
                });
                
            
        }} else {
            res.status(403).send(response.message);
        }
    });
});

router.post(config.paths.api_root + "checkout/checkin", (req, res) => {
    verify.verify_user.verify_user(req.body.username, req.body.token, (response) => {
        if(response.valid) {
            let newStamp = new Date(req.body.time);
            newStamp = Number(newStamp.getTime()) / 1000;
            console.log(newStamp);
            if(req.body.quantity <= 0) res.status(403).send("Need at least 1 item to check in");
            else {
                mysql.DB_params.query("DELETE FROM CheckOut WHERE username = ? AND part_id = ? AND \
                part_category = ? AND checkout_time = TIMESTAMP(FROM_UNIXTIME(?))", [req.body.username, req.body.id, 
                        req.body.category, newStamp], (data, err) => {
                    console.log(data, err);
                    if(data.affectedRows > 0) {
                        mysql.DB_params.query("UPDATE Part SET quantity = quantity + ? \
                            WHERE id = ? AND CATEGORY = ?", [req.body.quantity, req.body.id, 
                                req.body.category], (data, err) => {
                            console.log(data, err);
                        });
                        res.status(201).send("Successfully checked in item(s)");
                    }
                });
                
            }
        } else {
            res.status(403).send(response.message);
        }
    });
});

router.post(config.paths.api_root + "checkout/list", (req, res) => {
    verify.verify_user.verify_user(req.body.username, req.body.token, (response) => {
        if(response.valid) {
            mysql.DB_params.query("SELECT CheckOut.checkout_time, CheckOut.quantity as amount_out, Part.*, \
            Image.img_path, DiscretePart.* FROM CheckOut INNER JOIN Part ON CheckOut.part_id = \
            Part.id AND CheckOut.part_category = Part.category INNER JOIN Image ON Part.thumbnail = \
            Image.id LEFT OUTER JOIN DiscretePart ON Part.id = DiscretePart.part_id AND Part.category = \
            DiscretePart.part_category WHERE CheckOut.username = ? ORDER BY CheckOut.checkout_time ASC",
            [req.body.username], (data, err) => {
                res.status(201).send(data);
            });
        } else {
            res.status(403).send(response.message);
        }
    });
});

function currentItemQuantity(item_id, item_category, callback) {
    mysql.DB_params.query("SELECT quantity FROM Part WHERE id = ? AND category = ? LIMIT 1", [item_id, item_category], 
    (data, err) => {
        //console.log(data, err, data[0].quantity);
        callback(data[0].quantity);
    });
}

function itemQuantityOut(item_id, item_category, username, amount, callback) {
    mysql.DB_params.query("SELECT quantity FROM CheckOut WHERE part_id = ? AND part_category = ? AND username = ?",
    [item_id, item_category, username], (data, err) => {
        //console.log(data, err);
        let new_amount = amount;
        if(amount >= data[0].quantity) new_amount = data[0].quantity;
        callback([data[0].quantity, new_amount]);
    });
}

module.exports = router;

var router = require('express').Router(),
    mysql = require('./mysql.js'),
    config = require('./config'),
    verify = require('./verify').verify;

router.post(config.paths.api_root + "cart/items/list", (req, res) => {
    //console.log(req.body);
    verify.verify_user.verify_user(req.body.username, req.body.token, (response) => {
        if(response.valid) {
            mysql.DB_params.query("SELECT ShoppingCart.user_quantity, ShoppingCart.updated_at, Part.*, \
            Image.img_path, DiscretePart.* FROM ShoppingCart INNER JOIN Part ON ShoppingCart.part_id = \
            Part.id AND ShoppingCart.part_category = Part.category INNER JOIN Image ON Part.thumbnail = \
            Image.id LEFT OUTER JOIN DiscretePart ON Part.id = DiscretePart.part_id AND Part.category = \
            DiscretePart.part_category WHERE ShoppingCart.username = ? \
            ORDER BY DATE(ShoppingCart.updated_at) DESC, ShoppingCart.updated_at ASC",
            [req.body.username], (data, err) => {
                //console.log(data, err);
                res.status(201).send(data);
            });
        } else {
            res.status(403).send(response.message);
        }
    });
});

router.post(config.paths.api_root + "cart/items/add", (req, res) => {
    verify.verify_user.verify_user(req.body.username, req.body.token, (response) => {
        if(response.valid) {
            //console.log(req.body);
            mysql.DB_params.query("INSERT INTO ShoppingCart (username, part_id, part_category, user_quantity) VALUES \
            (?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_quantity = user_quantity + ?", [req.body.username, req.body.id, req.body.category,
            req.body.quantity, req.body.quantity], (data, err) => {
                res.status(201).send("added item to cart");
            });
        } else {
            res.status(403).send(response.message);
        }
    });
});

router.post(config.paths.api_root + "cart/items/remove", (req, res) => {
    verify.verify_user.verify_user(req.body.username, req.body.token, (response) => {
        if(response.valid) {
            mysql.DB_params.query("DELETE FROM ShoppingCart WHERE username = ? AND part_id = ? AND part_category = ? LIMIT 1",
            [req.body.username, req.body.id, req.body.category], (data, err) => {
                res.status(201).send("Removed part from cart");
            });
        } else {
            res.status(403).send(response.message);
        }
    });
});

router.post(config.paths.api_root + "cart/empty", (req, res) => {
    verify.verify_user.verify_user(req.body.username, req.body.token, (response) => {
        if(response.valid) {
            mysql.DB_params.query("DELETE FROM ShoppingCart WHERE username = ?", [req.body.username], (data, err) => {
                res.status(201).send("emptied cart");
            });
        } else {
            res.status(403).send(response.message);
        }
    });
});

router.post(config.paths.api_root + "cart/items/modifyQuantity", (req, res) => {
    verify.verify_user.verify_user(req.body.username, req.body.token, (response) => {
        if(response.valid) {
            mysql.DB_params.query("UPDATE ShoppingCart SET user_quantity = ?, updated_at = NOW() WHERE \
            username = ? AND part_id = ? AND part_category = ?", 
            [req.body.quantity, req.body.username, req.body.id, req.body.category], (data, err) => {
                res.status(201).send("updated cart item");
            })
        } else {
            res.status(403).send(response.message);
        }
    });
});

// number of items, etc.
router.post(config.paths.api_root + "cart/info", (req, res) => {
    verify.verify_user.verify_user(req.body.username, req.body.token, (response) => {
        if(response.valid) {
            mysql.DB_params.query("SELECT COUNT(*) as item_count FROM ShoppingCart WHERE username = ?", 
            [req.body.username], (data, err) => {
                res.status(201).send(JSON.stringify(data[0]));
            });
        } else {
            res.status(403).send("Not logged in");
        }
    });
});

module.exports = router;
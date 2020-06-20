var router = require('express').Router(),
    mysql = require('./mysql'),
    formidable = require('formidable'),
    config = require('./config'),
    verify = require('./verify').verify,
    fs = require('fs'),
    image_up = require('./images');

router.post(config.paths.api_root + "category/create", (req, res) => {
    //console.log(req);
    let form = new formidable({uploadDir: config.paths.images.internal.tmp,
        keepExtensions: true, multiples: false});
    form.parse(req, (err, fields, files) => {
        let username = fields.username,
            token = fields.token;
        verify.verify_admin.verify_admin(username, token, (response) => {
            if(response.admin_valid) {
                //console.log(files, fields);
                mysql.DB_params.query("SELECT EXISTS(SELECT 1 FROM Category WHERE id = ? OR name = ?)\
                    as mycheck", [fields.id, fields.name], (data, error) => {
                        if(data[0].mycheck === 1) {
                            let photo = files["thumb"];
                            //console.log(photo.path);
                            fs.unlinkSync(photo.path);
                            res.status(401).send("ERROR: Category name or id already exists");
                        }
                        else {
                            let photo = files["thumb"];
                            let tag_data = JSON.stringify(JSON.parse(fields.tags));
                            //console.log(tag_data);
                            image_up.upload_photo(config.paths.images.internal.category, 
                                config.paths.images.external.category, config.images.category_imgs.width,
                                config.images.category_imgs.height, photo, (img_data) => {
                                mysql.DB_params.query("INSERT INTO Category (id, name, description, tags, image_id) \
                                VALUES (?, ?, ?, ?, ?)", [fields.id.toUpperCase(), fields.name, fields.description,
                                    tag_data, img_data.id],
                                (data, err) => {
                                    //console.log(data, err);
                                    res.status(201).send("Created category");
                                });
                            });
                        }
                    });
                
            } else {
                let photo = files["thumb"];
                //console.log(photo.path);
                fs.unlinkSync(photo.path);
                res.status(403).send("Unauthorized user");
            }
        });
    });
});

router.post(config.paths.api_root + "category/modify", (req, res) => {
    form = new formidable({uploadDir: config.paths.images.internal.tmp,
        keepExtensions: true, multiples: false});
    form.parse(req, (err, fields, files) => {
        let username = fields.username,
            token = fields.token;
        verify.verify_admin.verify_admin(username, token, (response) => {
            if(response.admin_valid) {
                //console.log(files, fields);
                mysql.DB_params.query("SELECT EXISTS(SELECT 1 FROM Category WHERE id = ? OR name = ?)\
                    as mycheck", [fields.id, fields.name], (data, error) => {
                        if(data[0].mycheck === 1) {
                            if(files[""]) {
                                let photo = files[""];
                                //console.log(photo.path);
                                fs.unlinkSync(photo.path);
                            }
                            res.status(401).send("ERROR: Category name or id already exists");
                        }
                        else {
                            let tag_data = JSON.stringify(JSON.parse(fields.tags));
                            if(files[""]) {
                                let photo = files[""];
                                image_up.upload_photo(config.paths.images.internal.category, 
                                config.paths.images.external.category, photo, (img_data) => {
                                mysql.DB_params.query("UPDATE Category SET (description, tags, image_id, updated_at) \
                                = (?, ?, ?, NOW()) WHERE id = ?", [fields.description, tag_data, img_data.id, fields.id],
                                (data, err) => {
                                    //console.log(data, err);
                                    res.status(201).send("Updated category with new image");
                                });
                            });
                            }
                            else {
                                mysql.DB_params.query("UPDATE Category SET (description, tags, updated_at)\
                                 = (?, ?, NOW()) WHERE id = ?", [fields.description, tag_data, fields.id],
                                (data, err) => {
                                    //console.log(data, err);
                                    res.status(201).send("Updated category");
                                });
                            }
                        }
                    });
            } else {
                if(files[""]) {
                    let photo = files[""];
                    //console.log(photo.path);
                    fs.unlinkSync(photo.path);
                }
                res.status(403).send("Unauthorized user");
            }
        });
    });
});

router.get(config.paths.api_root + "category/info", (req, res) => {
    mysql.DB_params.query("SELECT Category.*, Image.* FROM Category INNER JOIN Image\
    ON Category.image_id = Image.id WHERE Category.id = ?", [req.query.id], (data, err) => {
        //console.log(data);
        if(data[0])
        res.status(201).send({
            id: req.query.category_id,
            name: data[0].name,
            description: data[0].description,
            tags: data[0].tags,
            date_created: data[0].date_created,
            last_updated: data[0].updated_at,
            img_path: data[0].img_path
        });
        else res.status(404).send("Category not found");
    });
});

router.get(config.paths.api_root + "category/parts", (req, res) => {
    mysql.DB_params.query("SELECT * FROM Part WHERE category = ?", [req.query.id], (data, err) => {
        if(data[0]) res.status(201).send(data);
        else res.status(404).send("Invalid category");
    });
});

router.get(config.paths.api_root + "category/all", (req, res) => {
    mysql.DB.query("SELECT Category.*, Image.img_path FROM Category INNER JOIN Image ON Category.image_id \
    = Image.id ORDER BY Category.id ASC", (data, err) => {
        if(data) res.status(201).send(data);
        else res.status(500).send("Couldn't get categories");
    });
});

/*router.post(config.paths.api_root + "category/delete", (req, res) => {
    let username = req.body.username,
        token = req.body.token;
    verify.verify_admin.verify_admin(username, token, (response) => {
        if(response.admin_valid) {
            mysql.DB_params.query("DELETE FROM Category, Image, Part USING Category, Image, Part WHERE \
            Category.id = ? AND Category.image_id = Image.id AND Part.category = Category.id",
            [req.body.category_id], (data, err) => {
                console.log(data, err);
                res.status(201).send("Deleted category and associated parts");
            });
        } else {
            res.status(403).send("Unauthorized user");
        }
    });
});*/

module.exports = router;
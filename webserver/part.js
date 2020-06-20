var router = require('express').Router(),
    mysql = require('./mysql'),
    qr = require('./qr_code'),
    verify = require('./verify').verify,
    config = require('./config'),
    formidable = require('formidable'),
    fs = require('fs'),
    image_up = require('./images');

router.post(config.paths.api_root + "part/create", (req, res) => {
    let form = new formidable({uploadDir: config.paths.images.internal.tmp,
    keepExtensions: true, multiples: false});
    form.parse(req, (err, fields, files) => {
        let username = fields.username,
            token = fields.token;
        //console.log(fields);
        verify.verify_admin.verify_admin(username, token, (response) => {
            if(response.admin_valid) {
                let photo = files.thumb;
                //console.log(photo);
                let tag_data = JSON.stringify(JSON.parse(fields.tags));
                image_up.upload_photo(config.paths.images.internal.part, config.paths.images.external.part,
                    config.images.part_imgs.width, config.images.part_imgs.height, photo, (img_data) => {
                        mysql.DB_params.query("INSERT INTO Part (category, \`name\`, tags, price, description, datasheet_url, \
                            is_discrete, quantity, thumbnail, bin_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                            [fields.category, fields.name, tag_data, fields.price, fields.description, fields.datasheet, 
                            fields.is_discrete, fields.quantity, img_data.id, fields.bin_id], (data, err) => {
                                //console.log(data, err);
                                var partId = data.insertId;
                                mysql.DB_params.query("INSERT INTO PartImage (part_id, part_category, image_id, place)\
                                values (?, ?, ?, ?)", [data.insertId, fields.category, img_data.id, 0], (data, err) => {
                                    //console.log(data, err);
                                    res.status(201).send({id: partId});
                                });
                                if(fields.is_discrete === "1")
                                {
                                    //console.log(data, err);
                                    //console.log("part is discrete");
                                    mysql.DB_params.query("INSERT INTO DiscretePart (part_id, part_category, is_smd, package,\
                                    value, power_rating) VALUES (?, ?, ?, ?, ?, ?)", [data.insertId, fields.category,
                                    fields.is_smd, fields.package, fields.value, fields.power_rating], (data, err) => {
                                        //console.log(data, err);
                                    });
                                }
                                
                                qr.generate({type: qr.types.part, id: data.insertId, category: fields.category, 
                                    externalPath: config.paths.images.external.qr_code.part,
                                    internalPath: config.paths.images.internal.qr_code.part}, (path) => {
                                        mysql.DB_params.query("UPDATE Part SET qr_path = ? WHERE id = ? AND category = ?",
                                        [path, data.insertId, fields.category], (data, err) => {

                                        });
                                        
                                    });
                            });
                    });
            } else {
                let photo = files.thumb;
                fs.unlinkSync(photo.path);
                res.status(403).send("unauthorized user");
            }
        });
    });
});

router.post(config.paths.api_root + "part/add_image", (req, res) => {
    let form = new formidable({uploadDir: config.paths.images.internal.tmp,
    keepExtensions: true, multiples: true});
    form.parse(req, (err, fields, files) => {
        //console.log(fields);
        let username = fields.username,
            token = fields.token;
        verify.verify_admin.verify_admin(username, token, (response) => {
            if(response.admin_valid) {
                //console.log(files);
                for(var key in files) {
                    const photo = files[key];
                    image_up.upload_photo(config.paths.images.internal.part, config.paths.images.external.part,
                    config.images.part_imgs.width, config.images.part_imgs.height, photo, (img_data) => {
                        mysql.DB_params.query("INSERT INTO PartImage (part_id, part_category, image_id, place) values (?, ?, ?, \
                                        (SELECT MAX(place) + 1 FROM PartImage prtimg))", [fields.id, fields.category,
                                        img_data.id], (data, err) => {
                                            //console.log(data, err);
                                            try {
                                                res.status(201).send("done");
                                            } catch (err) {
                                                
                                            }
                                            
                                        });
                    });
                }
                
            } else {
                res.status(403).send("unauthorized user");
            }

        });
    });
    
});

router.post(config.paths.api_root + "part/reorder_images", (req, res) => {
    verify.verify_admin.verify_admin(req.body.username, req.body.token, (response) => {
        if(response.admin_valid) {
            req.body.images.forEach((photo, index) => {
                //console.log(index+1);
                mysql.DB_params.query("UPDATE PartImage SET place = ? WHERE image_id = ?", [index+1, photo.id], (data, err) => {

                });
            });
            res.status(201).send("Reordered images");
        } else {
            res.status(403).send("unauthorized user");
        }
    });
});

router.post(config.paths.api_root + "part/delete_image", (req, res) => {
    verify.verify_admin.verify_admin(req.body.username, req.body.token, (response) => {
        if(response.admin_valid) {
            mysql.DB_params.query("DELETE FROM PartImage WHERE image_id = ? LIMIT 1", [req.body.id], (data, err) => {
                res.status(201).send("Deleted image");
            });
        } else {
            res.status(403).send("unauthorized user");
        }
    });
});

router.get(config.paths.api_root + "part/images", (req, res) => {
    mysql.DB_params.query("SELECT PartImage.*, Image.img_path FROM PartImage INNER JOIN \
    Image ON PartImage.image_id = Image.id WHERE PartImage.part_id = ? AND PartImage.part_category = ? \
    ORDER BY PartImage.place", [req.query.id, req.query.category], (data, err) => {
        //console.log(data, err);
        res.status(201).send(data);
    });
});

router.get(config.paths.api_root + "part/info", (req, res) => {
    mysql.DB_params.query("SELECT Part.*, Part.qr_path as part_qr, Part.name as part_name, Bin.name as bin_name, \
    Image.img_path, DiscretePart.*, Bin.*, StorageContainer.id as storage_id, \
    StorageContainer.* FROM Part INNER JOIN \
    Image ON Part.thumbnail = Image.id LEFT OUTER JOIN DiscretePart ON Part.id = DiscretePart.part_id AND \
    Part.category = DiscretePart.part_category LEFT OUTER JOIN Bin ON Part.bin_id = Bin.id LEFT OUTER JOIN StorageContainer ON \
    Bin.parent_container = StorageContainer.id \
    WHERE Part.id = ? AND Part.category = ?", [req.query.id, req.query.category],
    (data, err) => {
        if(data) {
        let response = data[0];
        response.id = req.query.id;
        res.status(201).send(response);
        } else res.status(404).send("part not found");
    });
});

router.get(config.paths.api_root + "part/featured", (req, res) => {
    mysql.DB_params.query("SELECT * FROM Part WHERE featured = true", [], 
    (data, err) => {
        res.status(201).send(data);
    });
});

router.get(config.paths.api_root + "part/all", (req, res) => {
    mysql.DB.query("SELECT Part.*, Image.img_path FROM Part INNER JOIN Image ON Part.thumbnail = Image.id ORDER BY category, \`name\`", (data, err) => {
        res.status(201).send(data);
    });
});

router.get(config.paths.api_root + "part/infoExtended", (req, res) => {
    mysql.DB_params.query("SELECT Part.*, Image.img_path, DiscretePart.*, Bin.* FROM Part INNER JOIN \
    Image ON Part.thumbnail = Image.id LEFT OUTER JOIN DiscretePart ON Part.id = DiscretePart.part_id AND \
    Part.category = DiscretePart.part_category INNER JOIN Bin ON Part.bin_id = Bin.id\
    WHERE Part.id = ? AND Part.category = ?", [req.query.id, req.query.category],
    (data, err) => {
        res.status(201).send(data[0]);
    });
});

//TODO: router.post(config.paths.api_root + "part/modify")

router.post(config.paths.api_root + "part/changeQuantity", (req, res) => {
    verify.verify_admin.verify_admin(req.body.username, req.body.token, (response) => {
        if(response.admin_valid) {
            mysql.DB_params.query("UPDATE Part SET quantity = quantity + ? WHERE id = ? AND category = ?", 
            [req.body.amount, req.body.id, req.body.category], (data, err) => {
                if(error) res.status(404).send("Couldn't set quantity");
                else res.status(201).send("Updated quantity");
            });
        } else res.status(403).send("unauthorized");
    });
});

router.post(config.paths.api_root + "part/delete", (req, res) => {
    verify.verify_admin.verify_admin(req.body.username, req.body.token, (response) => {
        if(response.admin_valid) {
            mysql.DB_params.query("DELETE FROM Part WHERE id = ? AND category = ? LIMIT 1", [req.body.id, req.body.category], (data, err) => {

            });
            mysql.DB_params.query("DELETE FROM DiscretePart WHERE part_id = ? AND part_category = ? LIMIT 1", 
            [req.body.id, req.body.category], (data, err) => {

            });
            res.status(201).send("Deleted part");
        } else {
            res.status(403).send("unauthorized user");
        }
    });
});

module.exports = router;
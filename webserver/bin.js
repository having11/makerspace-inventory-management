var router = require('express').Router(),
    mysql = require('./mysql'),
    qr = require('./qr_code'),
    verify = require('./verify').verify,
    config = require('./config');

router.post(config.paths.api_root + "bin/create", (req, res) => {
    verify.verify_admin.verify_admin(req.body.username, req.body.token, (response) => {
        if(response.admin_valid) {
            let vals = req.body;
            mysql.DB_params.query("INSERT INTO Bin (parent_container, \`row\`, \`column\`, width, \`name\`, \
                rfid_tag_string, height) values (?, ?, ?, ?, ?, ?, ?)",
                [vals.container_id, vals.row, vals.col, vals.width, vals.name, vals.rfid_string, vals.height],
                (data, err) => {
                    //console.log(data, err);
                    qr.generate({type: qr.types.bin, id: data.insertId, 
                        externalPath: config.paths.images.external.qr_code.bin,
                        internalPath: config.paths.images.internal.qr_code.bin}, (path) => {
                            mysql.DB_params.query("UPDATE Bin SET qr_path = ? WHERE id = ?",
                            [path, data.insertId], (data, err) => {
                                //res.status(201).send("Added new container");
                                res.status(201).send("Added bin to storage container");
                            });
                        });
                });
        } else res.status(403).send("Unauthorized user");
    });
});

router.post(config.paths.api_root + "bin/delete", (req, res) => {
    verify.verify_admin.verify_admin(req.body.username, req.body.token, (response) => {
        if(response.admin_valid) {
            mysql.DB_params.query("UPDATE Part SET bin_id = null WHERE bin_id = ?",
            [req.body.id], (data, err) => {
            });
            mysql.DB_params.query("DELETE FROM Bin WHERE id = ?", [req.body.id],
                (data, err) => {
                //console.log(data, err);
                if(err) res.status(401).send(JSON.stringify(err));
                else res.status(201).send("Deleted bin");
            });
        } else res.status(403).send("Unauthorized user");
    });
});

router.post(config.paths.api_root + "bin/modify", (req, res) => {
    verify.verify_admin.verify_admin(req.body.username, req.body.token, (response) => {
        if(response.admin_valid) {
            let vals = req.body;
            mysql.DB_params.query("UPDATE Bin SET (parent_container, \`row\`, \`column\`, \`name\`, rfid_tag_string)\
            = (?, ?, ?, ?, ?) WHERE id = ?", [vals.container_id, vals.row, vals.col, vals.name, 
                vals.rfid_string, vals.id], (data, err) => {
                    res.status(201).send("updated bin");
            });
        } else res.status(403).send("Unauthorized user");
    });
});

router.get(config.paths.api_root + "bin/info", (req, res) => {
    mysql.DB_params.query("SELECT Bin.*, Bin.qr_path as bin_qr, Bin.id as bin_id, Bin.name as bin_name, StorageContainer.* FROM Bin \
    INNER JOIN StorageContainer ON Bin.parent_container = StorageContainer.id \
    WHERE Bin.id = ?", [req.query.id], (data, err) => {
        if(data[0])
            res.status(201).send(data[0]);
        else res.status(404).send("bin not found");
    });
});

router.get(config.paths.api_root + "bin/all", (req, res) => {
    mysql.DB.query("SELECT * FROM Bin", (data, err) => {
        res.status(201).send(data);
    });
});

router.get(config.paths.api_root + "bin/parts", (req, res) => {
    mysql.DB_params.query("SELECT Part.*, Image.img_path, DiscretePart.* FROM Part INNER JOIN \
    Image ON Part.thumbnail = Image.id LEFT OUTER JOIN DiscretePart ON Part.id = DiscretePart.part_id AND \
    Part.category = DiscretePart.part_category WHERE Part.bin_id = ?", [req.query.id], 
    (data, err) => {
        res.status(201).send(data);
    });
});

module.exports = router;
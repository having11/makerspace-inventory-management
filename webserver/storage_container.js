var router = require('express').Router(),
    mysql = require('./mysql'),
    verify = require('./verify').verify,
    qr = require('./qr_code'),
    config = require('./config');

router.post(config.paths.api_root + "storage_container/create", (req, res) => {
    console.log(req.body);
    verify.verify_admin.verify_admin(req.body.username, req.body.token, (response) => {
        if(response.admin_valid)
        mysql.DB_params.query("INSERT INTO StorageContainer (\`name\`, location, \`rows\`, cols, number_of_bins) \
            values (?, ?, ?, ?, ?)", [req.body.name, req.body.location, req.body.rows, req.body.cols, 
            req.body.number_of_bins], (data, err) => {
                //console.log(data, err);
                if(err) res.status(401).send(JSON.stringify(err));
                qr.generate({type: qr.types.storage, id: data.insertId, 
                    externalPath: config.paths.images.external.qr_code.storage,
                    internalPath: config.paths.images.internal.qr_code.storage}, (path) => {
                        mysql.DB_params.query("UPDATE StorageContainer SET qr_path = ? WHERE id = ?",
                        [path, data.insertId], (data, err) => {
                            res.status(201).send("Added new container");
                        });
                    });
            });
        else res.status(403).send("Unauthorized user");
    });
});

router.post(config.paths.api_root + "storage_container/delete", (req, res) => {
    verify.verify_admin.verify_admin(req.body.username, req.body.token, (response) => {
        if(response.admin_valid)
        mysql.DB_params.query("DELETE FROM StorageContainer WHERE id = ?", 
        [req.body.id], (data, err) => {
            if(err) res.status(401).send(JSON.stringify(err));
            mysql.DB_params.query("SELECT id FROM Bin WHERE parent_container = ?", [req.body.id], 
                (data, err) => {
                    var bin_data = data;
                    for(bin in bin_data)
                    mysql.DB_params.query("UPDATE Part SET bin_id = null WHERE bin_id = ?",
                    [bin.id], (data, err) => {
                    });
                    mysql.DB_params.query("DELETE FROM Bin WHERE parent_container = ?", [req.body.id],
                        (data, err) => {
                    //console.log(data, err);
                    //mysql.DB_params.query("UPDATE Part SET bin_storage_id = ?")
                    if(err) res.status(401).send(JSON.stringify(err));
                    else res.status(201).send("Deleted container");
                    });
                });
            });
        else res.status(403).send("Unauthorized user");
    });
});

router.get(config.paths.api_root + "storage_container/get/bin", (req, res) => {
    mysql.DB_params.query("SELECT * FROM Bin WHERE parent_container = ?", [req.query.id], 
    (data, err) => {
        res.status(201).send(data);
    });
});

router.get(config.paths.api_root + "storage_container/info", (req, res) => {
    mysql.DB_params.query("SELECT * FROM StorageContainer WHERE id = ?", [req.query.id], 
    (data, err) => {
        res.status(201).send(data[0]);
    });
});

router.get(config.paths.api_root + "storage_container/get/all", (req, res) => {
    mysql.DB.query("SELECT * FROM StorageContainer", (data, err) => {
        res.status(201).send(data);
    });
});

module.exports = router;
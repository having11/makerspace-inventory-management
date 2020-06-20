var mysql = require('./mysql.js'),
    path = require('path'),
    fs = require('fs'),
    sharp = require('sharp');
    config = require('./config.js');

var upload_photo = (() => {
    /* 
     * @param {img_dir_path} img_dir_path is the combination of the image root + the path, such as profile_imgs
     */
    function _upload_photo(img_dir_path_internal, img_dir_path_external, width, height, file, callback) {
        var type = null,
            filename = '';
        type = path.extname(file.path).toLowerCase();
        if(type !== null && (type === '.png' || type === '.jpg' ||
            type === '.jpeg' || type === '.gif')) {
            filename = Date.now() + '-' + file.name;
            let new_path = path.join(img_dir_path_internal, filename);
            sharp(file.path)
                .resize(width, height)
                .toFile(new_path, (err, info) => {
                    fs.unlinkSync(file.path);
                    mysql.DB_params.query("INSERT INTO Image (source, size, img_path) values (?, ?, ?)", 
                    [new_path, fs.statSync(new_path).size / 1000.0, 
                        img_dir_path_external+filename], (data, error) => {
                        callback({id: data.insertId, path: img_dir_path_external+filename});
                    });
                });
        }
    };
    return {
        upload_photo: _upload_photo
    }
})();

module.exports = upload_photo;

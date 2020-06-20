var qrcode = require('qrcode'),
    config = require('./config');

var qr_types = {
    bin: "bin",
    storage: "storage",
    part: "part"
};

var generate_qr = function(qr_obj, callback) {
    let qr_url = `http://${config.server.ip}:${config.server.port}/qr?type=${qr_obj.type}&id=${qr_obj.id}`;
    if(qr_obj.type === qr_types.part) qr_url += `&category=${qr_obj.category}`;
    let filename = `/QR-${qr_obj.type}-${qr_obj.id}`;
    if(qr_obj.type === qr_types.part) filename += `-${qr_obj.category}.png`;
    else filename += '.png';
    //console.log(qr_url, filename);
    qrcode.toFile(qr_obj.internalPath+filename, qr_url, (err) => {
        if(err) throw err;
        callback(qr_obj.externalPath + filename);
    });
};

module.exports = {types: qr_types, generate: generate_qr};
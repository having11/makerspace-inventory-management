var router = require('express').Router(),
    url = require('url'),
    config = require('./config');

router.get("/qr", (req, res) => {
    if(req.query.type === "part") {
        res.redirect(url.format({
            pathname: `http://${config.frontend.ip}:${config.frontend.port}/explore/part/${req.query.category}/${req.query.id}`
        }));
    } else {
        res.redirect(url.format({
            pathname: `http://${config.frontend.ip}:${config.frontend.port}/explore/${req.query.type}/${req.query.id}`
        }));
    }
    
});

module.exports = router;
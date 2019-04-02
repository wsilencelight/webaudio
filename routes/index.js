var express = require('express');
var router = express.Router();
var path = require('path')
const fs = require('fs')
const media = path.join(__dirname,'../public/media')
/* GET home page. */
router.get('/', function(req, res, next) {
  fs.readdir(media, (err, files) => {
    if(err) {
      console.log('readmedia wrong!!')
    }else {
      res.render('index', { title : 'Wsilencelight Music',music: files})
    }

  })
});

module.exports = router;

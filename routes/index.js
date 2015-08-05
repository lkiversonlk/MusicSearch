var express = require('express');
var router = express.Router();
var request = require("request");
var async = require("async");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/search", function(req, res, next){
    var music = req.query['music'];
    if(!music || music.trim().length == 0){
        res.render("result", {
            error : "请输入音乐名称"
        })
    }else{
        request(encodeURI("http://boss.foobar.site/kugou/search/" + music) , function(error, response, body){
            if(error){
                res.render("result", {
                    error : "后台出错"
                });
            }else{
                result = JSON.parse(body);
                if(result.error){

                }else{
                    var found = result._items.slice(0, 4);
                    async.map(
                        found,
                        function(item, callback){
                            request(encodeURI("http://boss.foobar.site/kugou/resolve/" + item.hash), function(error, response, body){
                                if(error){
                                    callback(null, {
                                        singer : item.singername,
                                        file : item.filename
                                    });
                                }else{
                                    ret = JSON.parse(body);
                                    callback(null, {
                                        singer : item.singername,
                                        file : item.filename,
                                        download : ret.url,
                                        format : ret.extName,
                                        name : item.songname
                                    });
                                }
                            });
                        },
                        function(e, result){
                            res.render(
                                "result",
                                {
                                    found : result
                                }
                            );
                        }
                    );
                }
            }
        });

    }

});
module.exports = router;

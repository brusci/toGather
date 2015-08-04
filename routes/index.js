var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comments.js');
var gapi = require('../models/gapi.js');

var qt   = require('quickthumb');


//var express = require('express');
//var router = express.Router();

/* GET home page. */
module.exports = function(app){
	app.get('/', function(req, res){
        //find its page
        var page = req.query.p ? parseInt(req.query.p) : 1;

  console.log(req.session.user);

        Post.getTen(null, page, function(err, posts, total){
            if(err)  posts = [];
            res.render('index', {
                title: 'home page',
                 url: gapi.url,
                user:  req.session.user,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1)*10 + posts.length) == total,
                posts: posts,
                success:  req.flash('success').toString(),
                error:  req.flash('error').toString()
            });  
        });
	});



/*   ---------- search from here  -------------
    app.post('/', function(req, res){
 
       // console.log(req.body.keyword);
       // console.log(req.body.searchlatlng);
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Post.search(req.body.keyword, page, req.body.startDate, req.body.endDate, function(err, posts, total){
            if(err){
                req.flash('error', err);
                return  res.redirect('/');
            }
            console.log(posts);
            console.log("~~~~~~~~~~~~~");
            res.render('search', {
                title: JSON.stringify("SEARCH: " + req.query.keyword),
                user: req.session.user,
                searchlatlng: JSON.stringify(req.body.searchlatlng),
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page-1)*10 + posts.length) == total,
                posts: JSON.stringify(posts),
                lists: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });

    });

*/





    app.post('/', checkNotLogin);
    app.post('/', function(req, res){
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //check whether username existed
        User.get(req.body.name, function(err,user){
            if(!user){
                req.flash('error', 'user not exist!');
                return res.redirect('/login');
            }
            //check password
            if(user.password != password){
                req.flash('error', 'password error!');
              //  return res.redirect('/login');
                return res.redirect('back');
            }
            //check ok, store in session
            req.session.user = user;
            req.flash('success', 'Login successfully!');
            res.redirect('/');
        });
    });



    app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res){

      //  console.log(gapi.url);

		res.render('reg', {
			title: 'register',
			user:  req.session.user,
			success:  req.flash('success').toString(),
			error:  req.flash('error').toString()
		});
	});

    app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res){
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        if(password_re != password){
        	req.flash('error', 'not same password');
        	return res.redirect('/reg');
        }
        //create md5 of password
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
        	name: name,
        	password: password,
        	email: req.body.email
        });

        //check user whether existed
        User.get(newUser.name, function(err, user){
        	if(err){
        		req.flash('error', err);
        		return res.redirect('/');
        	}
        	if(user){
        		req.flash('error', 'user existed!');
        		return res.redirect('/reg');
        	}
        	//not existed, add it
        	newUser.save(function(err, user){
        		if(err){
        			req.flash('error', err);
        			return res.redirect('/reg');
        		}
        		req.session.user = user;
        		req.flash('success', 'register successfully!');
        		res.redirect('/');
        	});
        });   
	});

/*
var getData = function(){
    gapi.oauth.userinfo.get().withAuthClient(gapi.client).execute(function(err, results){
        console.log(results);
    });
    gapi.cal.calendarList.list().withAuthClient(gapi.client).execute(function(err, results){
        console.log(results);
    });
};
*/

    var getProfile = function(){
        gapi.plus.people.get({userId: 'me', auth: gapi.client}, function(err, profile){
            if(err){
                console.log("profile error!");
                return;
            }
            //console.log(profile.displayName, ':', profile.tagline);
            
            return  profile.id;
            //return  profile.displayName;
        });
    };

    app.get('/oauth2callback', function(req, res){
        var code = req.query.code;
        console.log(code);
        console.log("now tokens");

        gapi.client.getToken(code, function(err, tokens){
            //console.log(tokens);
            gapi.client.setCredentials(tokens);
            //var googleid = getProfile();

            gapi.plus.people.get({userId: 'me', auth: gapi.client}, function(err, profile){
                if(err){
                    req.flash('error', 'Login failure');
                    return res.redirect('/login');
                }
                //console.log(profile.displayName, ':', profile.tagline);
                //var googleid = profile.id;
                //req.session.googleid = googleid;                //store googleid in session!
                var name = profile.displayName;
             /*   var email = profile.emails;
                console.log("name: "+name);
                console.log("email: "+email); */
                //console.log(req.session.googleid);

                User.get(name, function(err, user){
                    if(err){
                        req.flash('error', err);
                        return res.redirect('/login');
                    }
                 /*   if(user){   
                        console.log('has this user!!');                 //if find same name already, should register
                        req.flash('error', 'user existed! Please Register!!');
                        return res.redirect('/reg');
                    } */
                    else{
                        User.getAll(function(err, users){
                            if(err){
                                req.flash('error', err);
                                return res.redirect('/login');
                            }
                            else{
                                for(i in users){
                                    //console.log(users[i]);
                                    if(users[i].name === name){        //has this one
                                        req.session.user = users[i];
                                        req.flash('success', 'register successfully!');
                                        res.redirect('/');
                                    }
                                }



                                var newUser = new User({
                                        name: name,
                                        password: null,
                                        email: null
                                    });
                                    newUser.save(function(err, user){
                                        if(err){
                                            req.flash('error', err);
                                            return res.redirect('/reg');
                                        }
                                        req.session.user = newUser;
                                        console.log("session user: "+req.session.user.name);
                                        req.flash('success', 'register successfully!');
                                        res.redirect('/');
                                    });




                            } 
                        })
                    }
                  /*  else{
                        var newUser = new User({
                            name: name,
                            password: null,
                            email: null
                        });
                        newUser.save(function(err, user){
                            if(err){
                                req.flash('error', err);
                                return res.redirect('/reg');
                            }
                            req.session.user = newUser;
                            console.log("session user: "+req.session.user.name);
                            req.flash('success', 'register successfully!');
                            res.redirect('/');
                        });
                    }  */
                });  
            });



            //console.log('id: '+ googleid);
            
            
        });

    })


    app.get('/login', checkNotLogin);
	app.get('/login', function(req,res){

console.log("log in now!!");

        res.render('login', {
        	title: 'Login',
        	user:  req.session.user,
            url: gapi.url,
        	success:  req.flash('success').toString(),
        	error:  req.flash('error').toString()
        });
	});


   


    app.post('/login', checkNotLogin);
	app.post('/login', function(req, res){
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //check whether username existed
        User.get(req.body.name, function(err,user){
        	if(!user){
        		req.flash('error', 'user not exist!');
        		return res.redirect('/login');
        	}
        	//check password
        	if(user.password != password){
        		req.flash('error', 'password error!');
        		return res.redirect('/login');
        	}
        	//check ok, store in session
        	req.session.user = user;
        	req.flash('success', 'Login successfully!');
        	res.redirect('/');
        });
	});

    app.get('post', checkLogin);
	app.get('/post', function(req, res){
		res.render('post', {
            title: 'Post',
            user:  req.session.user,
            success:  req.flash('success').toString(),
            error:  req.flash('error').toString()
        });
	});

    app.post('/post', checkLogin);
	app.post('/post', function(req, res){
        var currentUser = req.session.user;
        console.log("pic: "+req.files.pic);
        console.log("title: "+req.body.title);
        var post = new Post(currentUser.name, req.body.title, req.body.loc, req.body.latlng, req.body.partyDate, req.files.pic, req.body.post);
        post.save(function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', 'Post successfully');
            res.redirect('/');
        });
	});

    app.get('/logout', checkLogin);
	app.get('/logout', function(req, res){
        req.session.user = null;
        req.flash('success', 'Logout successfully!');
        res.redirect('/');
	});



    app.get('/about', function(req, res){
        res.render('about', {
            title: 'About',
            user:  req.session.user,
            url: gapi.url,
            success:  req.flash('success').toString(),
            error:  req.flash('error').toString()
        });
    });


    app.post('/about', function(req, res){           //login from about
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //check whether username existed
        User.get(req.body.name, function(err,user){
            if(!user){
                req.flash('error', 'user not exist!');
                return res.redirect('/login');
            }
            //check password
            if(user.password != password){
                req.flash('error', 'password error!');
                return res.redirect('/login');
            }
            //check ok, store in session
            req.session.user = user;
            req.flash('success', 'Login successfully!');
            res.redirect('/');
        });
    })




    app.get('/search', function(req, res){
 
       // console.log(req.body.keyword);
       // console.log(req.body.searchlatlng);
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Post.search(req.query.keyword, page, req.query.startDate, req.query.endDate, function(err, posts, total){
            if(err){
                req.flash('error', err);
                return  res.redirect('/');
            }

console.log(req.query.keyword);
console.log(req.query.searchlatlng);
console.log("~~~~~~~~~~~~~~~~~~~~~");

            res.render('search', {
                title: JSON.stringify("SEARCH: " + req.query.keyword),
                user: req.session.user,
                searchlatlng: JSON.stringify(req.query.searchlatlng),
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page-1)*10 + posts.length) == total,
                posts: JSON.stringify(posts),
                lists: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });

    });




/*
    app.get('/upload', checkLogin);
    app.get('/upload', function(req, res){
        res.render('upload', {
            title: 'File Upload',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/upload', checkLogin);
    app.post('/upload', function(req, res){
        req.flash('success', 'File upload success!');
        res.redirect('/upload');
    });

*/





    



/*

var page = req.query.p ? parseInt(req.query.p) : 1;
        Post.getTen(null, page, function(err, posts, total){
            if(err)  posts = [];
            res.render('index', {
                title: 'home page',
                user:  req.session.user,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1)*10 + posts.length) == total,
                posts: posts,
                success:  req.flash('success').toString(),
                error:  req.flash('error').toString()
            });  
        });



*/

 //   app.get('/u/:name', checkLogin);
    app.get('/u/:name', function(req, res){
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var name = req.params.name;

        User.getFriend(name, function(err, friends){
            if(err){
                req.flash('error', err);
                return  res.redirect('back');
            }
            else{
                Post.getAll(name, function(err, posts, total){
                    if(err){
                        req.flash('error', err);
                        return  res.redirect('back');
                     }
                    res.render('personalPage', {
                        user: req.session.user,
                        currentUser: req.session.user.name,
                        pageUser: req.params.name,
                        posts: posts,
                        friends: friends,
                        page: page,
                        isFirstPage: (page - 1) == 0,
                        isLastPage: ((page-1)*10 + posts.length) == total,
                        success:  req.flash('success').toString(),
                        error:  req.flash('error').toString()
                    });
                });
            }
        })

        
    });


    
    app.get('/addFriend/:currentUser/:pageUser', function(req, res){
        var currentUser = req.params.currentUser;
        var pageUser = req.params.pageUser;
        var existed = false;
        User.getFriend(currentUser, function(err, friends){
            for(i in friends){                    //if existed, go
                if(friends[i] === pageUser){
                    res.redirect('/u/'+pageUser);
                  //  existed = true;
                  //  break;
                }
            }
            if(existed == false){
                User.addFriend(req.params.currentUser, req.params.pageUser, function(err){    //if not, add
                    if(err){
                        req.flash('error', err);
                        return  res.redirect('back');
                    }
                    res.redirect('/u/'+pageUser);
                });      
            }
        });
    });



    app.get('/attend/:name/:day/:title/:loc/:partyDate/:attender', function(req, res){
        var attender = req.params.attender;
        var existed = false;
        Post.getAttender(req.params.name, req.params.day, req.params.title, req.params.loc, req.params.partyDate, function(err, attenders){
            for(i in attenders){
                if(attender === attenders[i]){
                   // res.write("haha~~~~~~~~~");
                    existed = true;
                }
            }
            if(existed == false){
                Post.addAttender(req.params.name, req.params.day, req.params.title, req.params.loc, req.params.partyDate, req.params.attender, function(err){
                    if(err){
                        req.flash('error', err);
                        return  res.redirect('/');
                    }
                  //  res.send(attender);
                
                   
                  // res.send({data: "  var data='name':'yuqj'  "});
                });
            }
        });
    });




    app.get('/u/:name/:day/:title/:loc/:partyDate', checkLogin);
    app.get('/u/:name/:day/:title/:loc/:partyDate', function(req, res){

        var currentUser = req.session.user;
        Post.getOne(req.params.name, req.params.day, req.params.title, req.params.loc, req.params.partyDate, function(err, post){
            if(err){
                req.flash('error', err);
                return  res.redirect('/');
            }
            console.log(req.session.user.name);
            console.log(req.params.name);
            res.render('article', {
                //title: 'Edit',
                title: req.params.title,
                post: post,
                attenders: post.attenders,
                user: req.session.user,
                articleowner: req.params.name,
                loc: req.params.loc,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });


//post comment info
    app.post('/u/:name/:day/:title/:loc/:partyDate', function(req, res){
            var date = new Date();
            var time = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes()<10 ? '0'+date.getMinutes : date.getMinutes());
            var comment = {
                name: req.session.user.name,
              //  email: req.body.email,
                website: req.body.website,
                time: time,
                content: req.body.content
            };

            var newComment = new Comment(req.params.name, req.params.day, req.params.title, req.params.loc, req.params.partyDate, comment);
            
            //console.log(newComment);

            newComment.save(function(err){
                if(err){
                    req.flash('error', err);
                    return res.redirect('back');
                }
                req.flash('success', 'Comment success!');
                res.redirect('back');
            });
    });
 

 //   app.get('/edit/:name/:day/:title/:loc/:partyDate', checkLogin);
    app.get('/edit/:name/:day/:title/:loc/:partyDate', function(req, res){
        var currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.day, req.params.title, req.params.loc, req.params.partyDate, function(err, post){
            if(err){
                req.flash('error', err);
                return  res.redirect('back');
            }
            res.render('edit', {
                title: 'Edit',
                post: post,
                user: req.session.user,
                loc: post.loc,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });


    app.post('/edit/:name/:day/:title/:loc/:partyDate', checkLogin);
    app.post('/edit/:name/:day/:title/:loc/:partyDate', function(req, res){
        var currentUser = req.session.user;

       // console.log(currentUser);
       // console.log("start post edit!!!")

        Post.update(currentUser.name, req.params.day, req.params.title, req.params.loc, req.params.partyDate, req.body.post, function(err){
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title + '/' + req.params.loc + '/' + req.params.partyDate);
            if(err){
                req.flash('error', err);
                return  res.redirect(url);
            }
            req.flash('success', 'Edit success!');
              res.redirect(url);
        });
    });


    app.get('/remove/:name/:day/:title/:loc/:partyDate', checkLogin);
    app.get('/remove/:name/:day/:title/:loc/:partyDate', function(req, res){
        var currentUser = req.session.user;
        Post.remove(currentUser.name, req.params.day, req.params.title, req.params.loc, req.params.partyDate, function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', 'delete success!');
            res.redirect('/');
        });
    });



    app.get('/admin', function(req, res){
        if(req.query.name == "admin" && req.query.password == "admin"){
            req.session.user = "admin";
            User.getAll(function(err, users){
                if(!users){
                    req.flash('error', 'Users not exist!');
                    return res.redirect('/');
                }

                res.render('admin', {
                    user: req.session.user,
                    users: users,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        }
        else{
            res.redirect('/login');
        }
    });



    app.get('/admin/:name', function(req, res){
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //see whether user existed
        User.get(req.params.name, function(err, user){
            if(!user){
                req.flash('error', 'User not existed!');
                return  res.redirect('/');
            }

            Post.getAll(user.name, function(err, posts, total){
                if(err){
                    req.flash('error', err);
                    return  res.redirect('/');
                }
                res.render('adminArticle', {
                    user: req.session.user,
                    posts: posts,
                    success:  req.flash('success').toString(),
                    error:  req.flash('error').toString()
                });
            });
        });
    });


    app.get('/adminRemoveUser/:username', function(req, res){
        User.remove(req.params.username, function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', 'delete success!');
            res.redirect('/admin');
        })
    })

    app.get('/adminEditArticle/:day/:title/:loc/:partyDate', function(req, res){
        Post.adminEdit(req.params.day, req.params.title, req.params.loc, req.params.partyDate, function(err, post){
            if(err){
                req.flash('error', err);
                return  res.redirect('back');
            }
            res.render('adminEdit', {
                user: "admin",
                title: 'Admin Edit',
                post: post,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    })



    app.post('/adminEditArticle/:day/:title/:loc/:partyDate', checkLogin);
    app.post('/adminEditArticle/:day/:title/:loc/:partyDate', function(req, res){

        Post.adminUpdate(req.params.day, req.params.title, req.params.loc, req.params.partyDate, req.body.post, function(err){
            var url = encodeURI('/admin/');
            if(err){
                req.flash('error', err);
                return  res.redirect(url);
            }
            req.flash('success', 'Edit success!');
              res.redirect(url);
        });
    });



    app.get('/adminRemoveArticle/:day/:title/:loc/:partyDate', checkLogin);
    app.get('/adminRemoveArticle/:day/:title/:loc/:partyDate', function(req, res){
        Post.adminRemove(req.params.day, req.params.title, req.params.loc, req.params.partyDate, function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', 'delete success!');
            res.redirect('/admin');
        });
    });



    function checkLogin(req, res, next){
        if(!req.session.user){
            req.flash('error', 'Not Login!');
            res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next){
        if(req.session.user){
            req.flash('error', 'already login!');
            res.redirect('back');
        }
        next();
    }


}

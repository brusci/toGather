var mongodb = require('./db');
var id = 0;

function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

module.exports = User;

User.prototype.save = function(callback){
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};

	//open DB
	mongodb.open(function(err, db){
		if(err)  return callback(err);
		//read users collection
		db.collection('users', function(err, collection){
            if(err){
            	mongodb.close();
            	return callback(err);
            }
            //add user data to users collection
            collection.insert(user, {safe: true}, function(err, user){
            	mongodb.close();
            	if(err)  return callback(err);
            	callback(null, user[0]);
            });
		});
	});
};

User.get = function(name, callback){
	//open DB
	mongodb.open(function(err, db){
		if(err)  return callback(err);
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({name: name}, function(err, user){
				mongodb.close();
				if(err)  return  callback(err);
				callback(null, user);
			});
		});
	});
};


User.getAll = function(callback){
	mongodb.open(function(err, db){
		if(err)  return callback(err);
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.find().sort({name: -1}).toArray(function(err, users){
                mongodb.close();
                if(err)  return  callback(err);
                callback(null, users);
            });
		});
	});
}



User.remove = function(name, callback){
	mongodb.open(function(err, db){
		if(err)  return callback(err);
        db.collection('posts', function(err, collection){    //delete posts of this user!
        	if(err){
        		mongodb.close();
        		return callback(err);
        	}
        	collection.remove({
        		"name": name
        	}, function(err){
        		mongodb.close();
        		if(err)  return callback(err);
        		callback(null);
        	})
        })


		db.collection('users', function(err, collection){    //delete info of this user!
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.remove({
				"name": name
			}, {w: 1},
			function(err){
				mongodb.close();
				if(err)  return callback(err);
				callback(null);
			})
		})
	})
}

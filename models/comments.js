var mongodb = require('./db');

function Comment(name, day, title, loc, comment){
	this.name = name;
	this.day = day;
	this.title = title;
	this.loc = loc;
	this.comment = comment;
}

module.exports = Comment;

//store one comment
Comment.prototype.save = function(callback){
	var name = this.name,
	    day = this.day,
	    title = this.title,
	    loc = this.loc,
	    comment = this.comment;

	mongodb.open(function(err, db){
		if(err)  return  callback(err);
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return  callback(err);
			}
			//need to insert comment to post, so use update here!
			collection.update({
				"name": name,
				"time.day": day,
				"title": title,
				"loc": loc
			}, {$push: {"comments": comment}},
			function(err){
				mongodb.close();
				if(err)  return  callback(err);
				callback(null);
			});
		});
	});
};
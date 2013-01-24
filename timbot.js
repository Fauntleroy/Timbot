// Some of these things are secret! So I hid them in a .json file
// Just replace anything with config. in front of it with the appropriate information
var config = require('./config.js');

// Fetch all the emoticon codes
var emoticons = require('./emoticons.js');

// Ranger is our Campfire module
var ranger = require('ranger');

var _ = require('underscore');

_.mixin({
	random: function( array ){
		return array[Math.floor(Math.random() * array.length)];
	}
});

var Timbot = function( params ){
	
	// Start a new Campfire API instance
	var campfire = ranger.createClient( params.account, params.token );
	
	var bot = this;
	var room;
	var room_id = params.room_id;
	this.insults = params.insults;
	this.wins = params.wins;
	
	campfire.me( function( self ){
		
		bot.self = self;

		// Join Campfire room and listen for messages
		campfire.room( room_id, function( selected_room ){
			
			bot.room = room = selected_room;
			
			room.join( function(){
				
				console.log('TIMBOT is listening...');
				
				bot.say('http://freewebs.com/chloemew4ever2/19.JPG');
				bot.say('TIMBOT, REPORTING FOR DUTY');

				room.listen( function( message ){

					var command = params.command.exec( message.body );

					if( command ){
						switch( command[1] ){
						
						case 'LET\'S DO THIS':
							bot.listUsers();
							break;

						case 'LET\'S DO THIS, TIM STYLE':
							bot.listUsers({
								last: 'Timothy Kempf'
							});
							break;

						case 'INSULT SOMEONE':
							bot.insult();
							break;

						case 'EMOTICON SOMEONE':
							bot.emoticon();
							break;

						case 'GTFO':
							bot.leave();
							break;

						case 'THAT\'S ALL FOR TODAY':
							bot.thatsAll();
							break;

						default:
							bot.say('what.');
							break;

						}
					}
					
				});
				
			});

		});
		
	});
	
};

// Utility function for getting user list and randomizing it
Timbot.prototype.getUsernames = function( callback ){
	
	var bot = this;
	var room = bot.room;

	room.users( function( users ){
		
		var usernames = _.pluck( users, 'name' );
		usernames = _.without( usernames, bot.self.name );
		usernames = _.shuffle( usernames );
		
		callback( usernames );
		
	});
	
};

// Sends a list of users, comma separated
// 'last' parameter moves specified username to the end of the list
Timbot.prototype.listUsers = function( options ){
	
	var options = options || {};
	var bot = this;
	var room = this.room;

	this.getUsernames( function( usernames ){
		
		if( options.last ){
			var usernames = _.sortBy( usernames, function( username ){
				return username === options.last;
			});
		}
		var username = usernames[0];
		var win_message = _.shuffle( bot.wins )[0];
		var usernames_list = usernames.join(', ');
		
		room.speak( usernames_list );
		room.speak( username + win_message );
		room.update({
			topic: usernames_list
		});
		
	});
	
};

// Insults a user, randomly by default
// 'username' defines a user to insult
Timbot.prototype.insult = function( username ){
	
	var bot = this;
	var room = this.room;

	this.getUsernames( function( usernames ){
		
		var insult = _.shuffle( bot.insults )[0];
		
		if( !username )
			username = usernames[0];
		
		room.speak( username + insult );
		
	});
	
};

// Sends a user an emoticon
Timbot.prototype.emoticon = function( username ){

	var room = this.room;

	this.getUsernames( function( usernames ){

		if( !username )
			username = usernames[0];

		var emoticon = _( emoticons ).random();

		room.speak( username +': :'+ emoticon +':' );

	});

};

// Says something
Timbot.prototype.say = function( message ){
	
	var room = this.room;

	room.speak( message );
	
};

// Ends the sync up
Timbot.prototype.thatsAll = function (){
	
	var room = this.room;

	room.update({
		topic: ''
	});
	
	this.leave();
	
};

// Leaves the room
Timbot.prototype.leave = function(){

	var room = this.room;

	room.stopListening();
	room.leave();
	
	console.log('TIMBOT has self terminated.');

};

var timbot = new Timbot({
	ssl: true,
	token: config.token,				// your Campfire token, find it in your Campfire user profile
	account: config.account,			// 'sparkartengineering', this is the room URL's subdomain usually
	room_id: config.room_id,					// ID number of the room you want to join
	command: /Tim\sBot\:\s(.*)/,		// regex that matches your command flag. keep matching parens at end
	insults: config.insults,			// array of strings
	wins: config.wins					// array of strings
});
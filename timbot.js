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
	var insults = params.insults;
	var wins = params.wins;
	console.log( campfire, campfire.rooms );
	
	// Join Campfire room and listen for messages
	campfire.room( room_id, function( selected_room ){
		
		room = selected_room;
		
		room.join( function(){
			
			room.listen( function( message ){
				
				var command = params.command.exec( message.body );
				
				if( command ){
					
					if( command[1] === 'LET\'S DO THIS' )
						bot.listUsers();
						
					else if( command[1] === 'LET\'S DO THIS, DANIEL STYLE' )
						bot.listUsers({
							last: 'Daniel O\'Shea'
						});
						
					else if( command[1] === 'INSULT SOMEONE' )
						bot.insult();
					
					else if( command[1] === 'EMOTICON SOMEONE' )
						bot.emoticon();

					else if( command[1] === 'GTFO' )
						bot.leave();
					
					else if( command[1] === 'THAT\'S ALL FOR TODAY' )
						bot.thatsAll();
					
					else
						bot.say('what.');
					
				}
				
			});
			
		});
		
	});
	
	// Utility function for getting user list and randomizing it
	var getUsernames = function( callback ){
		
		room.users( function( users ){
			
			var usernames = _.pluck( users, 'name' );
			usernames = _.without( usernames, 'TIM BOT' );
			usernames = _.shuffle( usernames );
			
			callback( usernames );
			
		});
		
	};
	
	// Sends a list of users, comma separated
	// 'last' parameter moves specified username to the end of the list
	this.listUsers = function( options ){
		
		var options = options || {};
		
		getUsernames( function( usernames ){
			
			if( options.last ){
				var usernames = _.sortBy( usernames, function( username ){
					return username === options.last;
				});
			}
			var username = usernames[0];
			var win_message = _.shuffle( wins )[0];
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
	this.insult = function( username ){
		
		getUsernames( function( usernames ){
			
			var insult = _.shuffle( insults )[0];
			
			if( !username )
				username = usernames[0];
			
			room.speak( username + insult );
			
		});
		
	};

	// Sends a user an emoticon
	this.emoticon = function( username ){

		getUsernames( function( usernames ){

			if( !username )
				username = usernames[0];

			var emoticon = _( emoticons ).random();

			room.speak( username +': :'+ emoticon +':' );

		});

	};
	
	// Says something
	this.say = function( message ){
		
		room.speak( message );
		
	};
	
	// Ends the sync up
	this.thatsAll = function (){
		
		room.update({
			topic: ''
		});
		
		this.leave();
		
	};
	
	// Leaves the room
	this.leave = function(){
		
		room.stopListening();
		room.leave();
		
	};
	
};

var timbot = new Timbot({
	ssl: true,
	token: config.token,				// your Campfire token, find it in your Campfire user profile
	account: config.account,			// 'sparkartengineering', this is the room URL's subdomain usually
	room_id: '463745',					// ID number of the room you want to join
	command: /TIM\sBOT\:\s(.*)/,		// regex that matches your command flag. keep matching parens at end
	insults: config.insults,			// array of strings
	wins: config.wins					// array of strings
});
var Campfire = require('node-campfire').Campfire;
var _ = require('underscore');

var Timbot = function( params ){
	
	// Start a new Campfire API instance
	var campfire = new Campfire({
		ssl: params.ssl,
		token: params.token,
		account: params.account,
		subdomain: params.subdomain
	});
	
	var bot = this;
	var room;
	var room_id = params.room_id;
	var insults = params.insults;
	var wins = params.wins;
	
	// Join Campfire room and listen for messages
	campfire.join( room_id, function( err, campfire_room ){
		
		if( err )
			throw err;
		
		room = campfire_room;
		
		room.listen( function( message ){
			
			var command = params.command.exec( message.body );
			
			if( command ){
				
				if( command[1] === 'LET\'S DO THIS' )
					bot.listUsers();
					
				else if( command[1] === 'LET\'S DO THIS, DANIEL STYLE' )
					bot.listUsers('Daniel O\'Shea');
					
				else if( command[1] === 'INSULT SOMEONE' )
					bot.insult();
					
				else
					bot.say('what.');
				
			}
			
		});
		
	});
	
	// Utility function for getting user list and randomizing it
	var getUsernames = function( room, callback ){
		
		campfire.get( '/room/'+ room, function( err, data ){
			
			if( err )
				throw err;
			
			var users = data.room.users;
			var usernames = _.pluck( users, 'name' );
			usernames = _.without( usernames, 'TIM BOT' );
			usernames = _.shuffle( usernames );
			
			callback( usernames );
			
		});
		
	};
	
	// Sends a list of users, comma separated
	// 'last' parameter moves specified username to the end of the list
	this.listUsers = function( last ){
		
		getUsernames( room_id, function( usernames ){
			
			if( last ){
				usernames = _.sortBy( usernames, function( username ){
					return username === last;
				});
			}
			var username = usernames[0];
			var win_message = _.shuffle( wins )[0];
			
			room.message( usernames.join(', '), 'TextMessage', function(){
				room.message( username + win_message, 'TextMessage' );
			});
			
		});
		
	};
	
	// Insults a user, randomly by default
	// 'username' defines a user to insult
	this.insult = function( username ){
		
		if( typeof username === 'undefined' )
			var username;
		
		getUsernames( room_id, function( usernames ){
			
			var insult = _.shuffle( insults )[0];
			
			if( !username )
				username = usernames[0];
			
			room.message( username + insult, 'TextMessage' );
			
		});
		
	};
	
	// Says something
	this.say = function( message ){
		
		room.message( message, 'TextMessage' );
		
	};
	
};

// Some of these things are secret! So I hid them in a .json file
// Just replace anything with config. in front of it with the appropriate information
var config = require('./config.js');

var timbot = new Timbot({
	ssl: true,
	token: config.token,				// your Campfire token, find it in your Campfire user profile
	account: config.account,
	subdomain: 'sparkartengineering',
	room_id: '463745',
	command: /TIM\sBOT\:\s(.*)/,		// regex that matches your command flag. keep matching parens at end
	insults: config.insults,			// array of strings
	wins: config.wins					// array of strings
});
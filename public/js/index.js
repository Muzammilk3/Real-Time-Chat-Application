/**
* Author: Wilbert Muza
* Version: 1.0.0
* Signature: wmuza
*/

'use strict';

let Fake, i=0, my_username = '';

// Configure Socket.IO client for Vercel deployment with polling fallback
const socket = io({
	transports: ['polling', 'websocket'],
	upgrade: true,
	rememberUpgrade: false,
	timeout: 20000,
	forceNew: true,
	reconnection: true,
	reconnectionDelay: 1000,
	reconnectionAttempts: 10,
	maxReconnectionAttempts: 10
});

// Handle connection status
socket.on('connect', () => {
	console.log('Connected to server');
	$('.status-indicator').removeClass('disconnected').addClass('connected');
});

socket.on('disconnect', () => {
	console.log('Disconnected from server');
	$('.status-indicator').removeClass('connected').addClass('disconnected');
});

socket.on('connect_error', (error) => {
	console.error('Connection error:', error);
	$('.status-indicator').removeClass('connected').addClass('disconnected');
});

socket.on('reconnect', (attemptNumber) => {
	console.log('Reconnected after', attemptNumber, 'attempts');
	$('.status-indicator').removeClass('disconnected').addClass('connected');
});

socket.on('reconnect_attempt', (attemptNumber) => {
	console.log('Reconnection attempt', attemptNumber);
});		


$(document).ready( () => {	
	new MainChat();
});


// A base class is defined using the new reserved 'class' keyword
class MainChat  {
	// constructor
	constructor () {
		$('.messages-content').mCustomScrollbar();
		MainChat.LoadEventHandlers();		
	}	
	
	static setDate(){
	  let d = new Date();
	  let m = d.getMinutes();
	  $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
	}
	
	static insertMessage() {
	  const msg = $('.message-input').val();
	  if ($.trim(msg) == '') return false;
	  $('.message-input').val(null);
	  MainChat.updateScrollbar();
	  // tell server to execute 'sendchat' and send along one parameter
	  socket.emit('sendchat', msg);
	}
		
	static LoadEventHandlers() {
			Fake = [ 'Hi there, I\'m Wilbert and you?', 'Nice to meet you', 'How are you?', 'Not too bad, thanks', 'What do you do?', 'That\'s awesome', 'Codepen is a nice place to stay', 'I think you\'re a nice person', 'Why do you think that?', 'Can you explain?', 'Anyway I\'ve gotta go now', 'It was a pleasure chat with you', 'Time to make a new codepen', 'Bye', ':)' ]

			$('.chat-title').on('click', () => {
				if ( $('.chat').height() == 500 )
					$( '.chat' ).animate({ height: 45 }, 1000 );
				else 
					$( '.chat' ).animate({ height: 500 }, 1000 );
				
				$('.message-box').slideToggle(300, 'swing');
				$('.chat-message-counter').fadeToggle(300, 'swing');
			});
			
			$('.message-submit').click( () => {
			  MainChat.insertMessage();
			});
			
			$(window).on('keydown', e => {
			  if (e.which == 13) {
				MainChat.insertMessage();
				return false;
			  }
			});
			
			
			// listener, whenever the server emits 'updatechat', this updates the chat body
				socket.on('updatechat',  (username, data) => {
				if(username == 'Chat Bot'){
					$('<div class="message loading new"><figure class="avatar"><img src="https://i.pravatar.cc/100?img=32" alt="User avatar" /></figure><span></span></div>').appendTo($('.mCSB_container'));
					MainChat.updateScrollbar();
					setTimeout( () => {
					$('.message.loading').remove();
					$('<div class="message new"><figure class="avatar"><img src="https://i.pravatar.cc/100?img=32" alt="User avatar" /></figure>' + data + '</div>').appendTo($('.mCSB_container')).addClass('new');
						MainChat.setDate();
						MainChat.updateScrollbar();
					}, 1000 + (Math.random() * 20) * 100);
				} else {	
					setTimeout( () => {
					$('.message.loading').remove();
					$('<div class="message message-personal">' + data + '</div>').appendTo($('.mCSB_container')).addClass('new');
						MainChat.setDate();
						MainChat.updateScrollbar();
					}, 100);
					
					setTimeout( () =>	MainChat.fakeMessage(), 1000 + (Math.random() * 20) * 100);
				}
			});
			
			// listener, whenever the server emits 'msg_user_handle', this updates the chat body
			socket.on('msg_user_handle', (username, data) => {
				setTimeout( () => {
				$('.message.loading').remove();
				$('<div class="message message-personal">' + data + '</div>').appendTo($('.mCSB_container')).addClass('new');
					MainChat.setDate();
					MainChat.updateScrollbar();
				}, 1000 + (Math.random() * 20) * 100);
			});
			
			// on connection to server, show username modal
			socket.on('connect', () => {
				$('#usernameModal').show();
			});
			
			// Handle username form submission
			$('#usernameForm').submit(function(e) {
				e.preventDefault();
				const username = $('#usernameField').val().trim();
				if (username) {
					socket.emit('adduser', username);
					$('#usernameModal').hide();
				}
			});
			
			// listener, whenever the server emits 'msg_user_found'
			socket.on('msg_user_found', username => {
				const message = prompt("Type your message:");
				if (message) {
					socket.emit('msg_user', username, my_username, message);
				}
			});
			
			
			// listener, whenever the server emits 'store_username', this updates the username
			socket.on('store_username', username => my_username = username);
	}
	
	static updateScrollbar() {
		$('.messages-content').mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
			scrollInertia: 10,timeout: 0
		});
	}
	
	// when the user sends a private msg to a user id, first find the username
	static sendmsg (id) { 
		socket.emit('check_user', my_username, id);
	}
	
	static fakeMessage() {
		if ($('.message-input').val() != '') return false;
		$('<div class="message loading new"><figure class="avatar"><img src="https://i.pravatar.cc/100?img=32" alt="User avatar" /></figure><span></span></div>').appendTo($('.mCSB_container')); 
			MainChat.updateScrollbar();
			setTimeout( () => {
					$('.message.loading').remove();
					$('<div class="message new"><figure class="avatar"><img src="https://i.pravatar.cc/100?img=32" alt="User avatar" /></figure>' + Fake[i] + '</div>').appendTo($('.mCSB_container')).addClass('new');
						MainChat.setDate();
						MainChat.updateScrollbar();
						i++;
			}, 1000 + (Math.random() * 20) * 100);
	}
	
}











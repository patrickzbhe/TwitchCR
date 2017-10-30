//globals
currentUsers = []

function addMessages(messages){
	//add messages to the chat box
	for (var i in messages) {
		var line = messages[i];
		var box = document.getElementById('chat-box');

		var container = document.createElement('div');
		container.className += ' message-line ' + line.username
		container.id = box.children.length + 1
		var time = document.createElement('span');
		time.innerHTML = line.time + ' ';
		var user = document.createElement('span');
		user.innerHTML = line.username + ': ';
		
		var message = document.createElement('span');
		message.innerHTML = line.message;
		
		var split = line.message.split(' ');
		var directed = []
		for (var i in split) {
			var part = split[i];
			if (part.indexOf('@') == 0) {
				directed.push(part);
			}
		}
		var directed = directed[0]
		if (directed) {
			directed = directed.slice(1)
		}
		
		container.appendChild(time);
		container.appendChild(user);
		container.appendChild(message);
		var u = line.username
		container.addEventListener('click', function(us,d) {
			return function() {filter(us,d);}
		}(u,directed));
		box.appendChild(container);
		
	}
	while (box.children.length > 700) {
		box.removeChild(box.children[0])
	}
}

function filter(usernames,directed){
	// filters out messages to make conversations readable
	var chat = document.getElementById('chat-box');
	var directChat = document.getElementById('direct');
	
	directChat.innerHTML = ''
	
	var sender = Array.from(chat.getElementsByClassName(usernames));
	var dirSender = Array.from(chat.getElementsByClassName(directed));
	var allSender = sender.concat(dirSender);
	
	allSender = allSender.sort((a,b) => {
		return  a.id - b.id;
	})
	
	for (var i = 0; i < allSender.length; i++) {
		console.log('adding message to filter');
		
		var mes = allSender[i];
		
		
		var clone = mes.cloneNode(1)
		directChat.appendChild(clone);
	}

}


function start(){
	chrome.tabs.query({"active": true, "currentWindow": true}, (tab) => {
		tab = tab[0];

		
	
		
		if (tab.url.indexOf('twitch.tv') < 0){
			return;
		}
		chrome.storage.local.get(tab.url, (data) => {
		  if (data[tab.url]) {
			
			addMessages(data[tab.url]['data']);
			box.scrollTop = box.scrollHeight;
			chrome.storage.onChanged.addListener((change, place) => {
				
				var diffs = change[tab.url];
				chrome.storage.local.get(tab.url, (data) => {
					var chatState = data[tab.url]['data']
					if (chatState.length > 700) {
						while (chatState.length > 700) {
							chatState = chatState.splice(1);
						}
						var data = {};
						data[tab.url] = {'data': chatState};
						chrome.storage.local.set(data);
					}
				})
				if (diffs){
					
					var newMessages = [];
					nv = diffs.newValue.data;
					ov = diffs.oldValue.data;

					for (var i = nv.length-1; i > ov.length-1; i--){
						newMessages.push(nv[i]);
					}
					addMessages(newMessages);
					if (document.getElementById('autoscroll').checked) {
						box.scrollTop = box.scrollHeight;
					}
				}
			});
		  } else {
			  setTimeout(() => {
				  console.log('Nothing found trying again in a second');
				  start();
			  }, 1000 )
			}
		});
	});
}

document.addEventListener("DOMContentLoaded", () => {
	start();
});
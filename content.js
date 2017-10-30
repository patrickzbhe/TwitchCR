// globals
chatList = '.chat-lines'
usernameClass = 'from'
lineClass = 'message-line'
go = false
currentChat = []
nth = 0
console.log(currentChat);


// wait until specific element exists and call a callback on it
function wait_exist(element, wait_time, callback) {
  if (document.querySelector(element) !== null) {
    console.log(document.querySelector(element))
    callback(document.querySelector(element));
    return;
  } else {
	console.log("Chat not found waiting another " + wait_time.toString() + " milliseconds.")
    setTimeout(() => {
      wait_exist(element, wait_time,callback);
    }, wait_time)
  }
}

// test to see what is in our storage
function checkStorage(url){
  chrome.storage.local.get(null, function(data){
    x =window.location.href
  });
}

// save the chat and save it. Also send a message to popup
function sendUpdate(chat) {
	loc = window.location.href;

	data = {};
	
	currentChat = currentChat.concat(chat);
	data[loc] = {'data': currentChat};
	console.log(data)
	console.log(JSON.parse(JSON.stringify(data)))
	if (typeof data === 'object') {
		try{
			chrome.storage.local.set(JSON.parse(JSON.stringify(data)));
		}
		catch(error){
			console.log(error);
		}
	}
}

function getChat(){ 
    var lines = document.getElementsByClassName(lineClass);
	console.log(lines.length)
    chat= [];
    for (var i = lines.length-1; i > 0; i--) {
		var line = lines[i];
		
		if ((line.innerHTML.indexOf('Top Cheer by ') > -1) || (line.className.indexOf('special-message') > -1)){
			continue;
		} else if (line.getAttribute('checked')){
			break;
		} else {
			
			line.setAttribute('checked', 'checked');
			if (line.children.length == 0) {
			  continue;
			}
			var username = line.getElementsByClassName('from')[0].innerHTML;
			if (go){
			  var message = document.querySelectorAll('div[class="' + lineClass + '"] > span[data-a-target="chat-message-text"]')[i].innerHTML;
			} else {
			  var message = line.getElementsByClassName('message')[0].textContent.trim() || line.getElementsByClassName('message')[0].innerText.trim();
			}
			var time = line.getElementsByClassName('timestamp')[0].innerHTML;
			
			data = {'time': time, 'username': username, 'message':message.replace(/(\r\n|\n|\r)/gm,"").replace(/ +/g, ' ')};
			chat.push(data);
		}
    }
    nth = lines.length;
    return chat;
}

function main() {
  wait_exist(chatList, 1000, (element) => {
	loc = window.location.href;
    sendUpdate(getChat());
    checkStorage(loc);
    setInterval(() => {
      sendUpdate(getChat());
	  console.log('updated');
    }, 3000);
  });
}



chrome.storage.local.clear();
main();









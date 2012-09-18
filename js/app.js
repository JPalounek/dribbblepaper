var DribbbleAPI = function () {};

DribbbleAPI.prototype.getShotSrc = function (id, title, cb) {
	var done = false;

	$.getJSON('http://api.dribbble.com/shots/' + id + "?callback=?", {}, function(details, status, xhr) {
		if(xhr.status != 200) {
			console.log(xhr.status)
		}
		if(typeof details['image_url'] != 'undefined') {
			done = true;
			var title = '<a href="' + details['url'] + '">' + details['title'] + '</a>';
			cb(details['image_url'], title);
		} else {
			done = true;
			cb('broken');
		}
	});

	if(!done) {
		setTimeout(function() {
    		cb('broken');
		}, 3000);
	}
}

function importShotsSrcs(shots, titles, cb) {
	var srcs = [];
	var api = new DribbbleAPI();
	var received = 0;

	for(var i in shots) {
		api.getShotSrc(shots[i], titles[shots[i]], function (src, title) {
			received++;

			if(src != 'broken') {
				srcs.push({
					src: src,
					title: title
				});
			}

			if(shots.length == received) {
				console.log(shots.length);
				console.log(srcs.length)
				cb(srcs);
			}
		})
	}
}

function hideSpinner() {
	var spinner = document.getElementById('fbload');
	spinner.setAttribute('class', 'hidden');

	var spinner = document.getElementById('spinner');
	spinner.setAttribute('class', 'hidden');
}

function showSpinner() {
	var spinner = document.getElementById('fbload');
	spinner.setAttribute('class', '');

	var spinner = document.getElementById('spinner');
	spinner.setAttribute('class', '');
}

function renderGallery(srcs) {
	var gallery = document.getElementById('gallery');
	var j = 0;

	for(var i in srcs) {
		j++;
		var shotTray = document.createElement('div');
		shotTray.setAttribute('class', 'shot-tray');

		var title = document.createElement('div');
		title.setAttribute('class', 'shot-title');
		title.innerHTML = srcs[i].title;

		var shot = document.createElement('img');
		shot.setAttribute('class', 'shot');
		shot.setAttribute('id', 'shot-' + j);
		shot.setAttribute('src', srcs[i].src);

		shotTray.appendChild(title);
		shotTray.appendChild(shot);

		gallery.appendChild(shotTray);
	}

	console.log('render')
}

function showView(name, views) {
	var view = document.getElementById('view-' + name + '-container');
	
	view.setAttribute('class', view.getAttribute('class').replace(' hidden', ''));

	for(var i in views) {
		if(views[i] != name) {
			var view = document.getElementById('view-' + views[i] + '-container');
			if(!stringContains(view.getAttribute('class'), 'hidden')) {
				view.setAttribute('class', view.getAttribute('class') + ' hidden');
			}			
		}
	}
}

function stringContains(origin, string) {
	if(origin.split(string).join('') != origin) {
		return true;
	} else {
		return false;
	}
}

function mineDribbbles(text, views) {
	var data = text.split(',');
	var shots = [];
	var titles = {};

	for(var i in data) {
		if(stringContains(data[i], 'http://dribbble.com/shots/')) {
			var id = data[i].split('http://dribbble.com/shots/')[1].split('-')[0];
			titles[id] = data[parseInt(i) + 1].split('"').join('');
			shots.push(id);
		}
	}

	if(shots.length != 0) {
		importShotsSrcs(shots, titles, function (srcs) {
			renderGallery(srcs);
			showView('gallery', views);
			hideSpinner();
		});
	}
}

function handleMineButton(editor, views) {
	document.getElementById('get-dribbles').onclick = function () {
		showSpinner();
		mineDribbbles(editor.getSession().getValue(), views);
	}
}

window.onload = function () {
	var editor = ace.edit("editor");
	var views = ['gallery', 'import'];

    handleMineButton(editor, views);

 	showView('import', views);
 	hideSpinner();
}
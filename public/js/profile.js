document.addEventListener('DOMContentLoaded', () => {
	var dragSrcEl = null;
	let moved
	let before
	let tid
	function handleDragStart(e) {
		if (this.parentNode.childElementCount < 3) return false;
		this.style.opacity = '0.4';
		dragSrcEl = this;
		moved = false
		before = false
		tid = this.id;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.innerHTML);
		console.log(order)
	}
	function handleDragOver(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}
		e.dataTransfer.dropEffect = 'move';

		return false;
	}
	function handleDragEnter(e) {
		this.classList.add('over');
		if (dragSrcEl !== this) {
			let targetHeight = this.getBoundingClientRect().height;
			let half = e.offsetY < targetHeight / 2
			if (half) {
				this.parentNode.insertBefore(dragSrcEl, this);
				before = true;
				tid = this.id;
				moved = true;
			} else {
				this.parentNode.insertBefore(this, dragSrcEl);
				before = false;
				tid = this.id;
				moved = true;
			}
		}
	}
	function handleDragLeave() {
		this.classList.remove('over');
	}
	function handleDrop(e) {
		e.preventDefault()
		if (e.stopPropagation) {
			e.stopPropagation(); // stops the browser from redirecting.
		}
		return false;
	}
	function handleDragEnd() {
		order.splice(order.indexOf(dragSrcEl.id), 1); // remove the dragged element from the array
		order.splice(order.indexOf(tid) + (before ? 0 : 1), 0, dragSrcEl.id); // add the dragged element back at the correct position
		this.style.opacity = '1';
		items.forEach(function (item) {
			item.classList.remove('over');
		});
	}
	let items = document.querySelectorAll('[draggable=true]');
	items.forEach(function(item) {
		item.addEventListener('dragstart', handleDragStart, false);
		item.addEventListener('dragenter', handleDragEnter, false);
		item.addEventListener('dragover', handleDragOver, false);
		item.addEventListener('dragleave', handleDragLeave, false);
		item.addEventListener('drop', handleDrop, false);
		item.addEventListener('dragend', handleDragEnd, false);
	});
});

function updateProfile() {
	fetch('/api/v1/profile', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			"action": "update",
			"order": order
		})
	}).then(res => res.json()).then(res => {
		if (res.error) {
			alert(res.error);
		} else {
			window.location.replace(window.location.href.replaceAll("?editmode", ""));
		}
	})
}

let bgMode = "color";
let bgColor = document.getElementById("bgColor").value;
let bgImage = document.getElementById("bgImage").value;

let bge = false
let csse = false
let main = true

function backgroundEditor() {
	if (csse) cssEditor();
	bge = !bge;
	document.getElementById("css-editor").classList.add("hidden");
	document.getElementById("bg-editor").classList.toggle("hidden");
	document.getElementById("profile-card").classList.toggle("hidden");
}

function cssEditor() {
	if (bge) backgroundEditor();
	csse = !csse;
	document.getElementById("bg-editor").classList.add("hidden");
	document.getElementById("css-editor").classList.toggle("hidden");
	document.getElementById("profile-card").classList.toggle("hidden");
}

function changeBgMode(newMode) {
	document.getElementById("bg-editor-color").classList.add("hidden");
	document.getElementById("bg-editor-random").classList.add("hidden");
	document.getElementById("bg-editor-image").classList.add("hidden");
	bgMode = newMode;
	switch (newMode) {
		case "color":
			document.querySelector(".content").style.backgroundImage = "";
			document.querySelector(".content").style.backgroundColor = bgColor;
			document.getElementById("bg-editor-color").classList.remove("hidden");
			break;
		case "random":
			document.getElementById("bg-editor-random").classList.remove("hidden");
			break;
		case "image":
			document.getElementById("bg-editor-image").classList.remove("hidden");
			break;
	}
}

function submitBg() {
	bgColor = document.getElementById("bgColor").value;
	fetch('/api/v1/profile', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			"action": "background",
			"bgMode": bgMode,
			"bgColor": bgColor,
			"bgImage": bgImage
		})
	}).then(res => res.json()).then(res => {
		if (res.error) {
			alert(res.error);
		} else {
			backgroundEditor();
		}
	})
}
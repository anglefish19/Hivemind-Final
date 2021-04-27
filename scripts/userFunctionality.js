// majority, if not all, functions within this file contain code borrowed and 
// adapted from Mrs. Denna's Student Tutoring App and the firebase intro we did 
// as a class

var dynamicList;
var taskItem;    // values of the task input box
var tlName;
var tlCode;


// ABOUT
function changePage() {
	window.location.href = "html/about.html";
}

// CONTROLS TASK LIST LISTING ON MENU
function tlListing() {
	
}

// CREATE
function createTL() {
	tlName = document.getElementById("tlNameInput").value;
	tlCode = document.getElementById("tlCodeInput").value;
	sessionStorage.setItem("tlName", tlName);
	
	// https://stackoverflow.com/questions/46880323/how-to-check-if-a-cloud-firestore-document-exists-when-using-realtime-updates
	// https://stackoverflow.com/questions/47997748/is-possible-to-check-if-a-collection-or-sub-collection-exists
	var tempRef = db.collection("users").doc(userID.email).collection("task lists").doc(sessionStorage.getItem("tlName"));
	
	tempRef.get().then((doc) => {
		if (doc.exists) {
			console.log("You've already used this name; please choose a different one.");
		}
		else {
			tempRef.set({ 
				name: tlName,
				code: tlCode,
				maker: userID.email,
				user: userID.email,
			}).then(() => {window.location.href = "taskList.html"}).catch(e => console.log(e.message));
		}
	});
}

// VIEW TASK LISTS
function viewTL() {
	

	
}

// loads the tasks already in database onto page and adds/removes tasks when changes
// are made
function loadTasks() {
	var tempRef = db.collection("users").doc(userID.email).collection("task lists").doc(sessionStorage.getItem("tlName"));
	var tempRefTasks = tempRef.collection("tasks");
	var tempRefComplete = tempRef.collection("completed");
	var tempRefDeleted = tempRef.collection("deleted");

	tempRefTasks.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
			let li = document.getElementById("liID" + change.doc.id);
			let aTask = document.getElementById("taskID" + change.doc.id);

            if (change.type === "added") {
                createTaskRow(change.doc.data().task, change.doc.id)
            }
            if (change.type === "modified") {
                aTask.textContent = change.doc.data().task;
            }
            if (change.type === "removed") {
				li.remove();
            }
        });
    });
}

// adds a task to list
function createTaskRow(newTask, id) {
	var tempRef = db.collection("users").doc(userID.email).collection("task lists").doc(sessionStorage.getItem("tlName"));
	var tempRefTasks = tempRef.collection("tasks");
	var tempRefComplete = tempRef.collection("completed");
	var tempRefDeleted = tempRef.collection("deleted");

	let li = document.createElement("li");
	let taskRow = document.createElement("div");
	let aTask = document.createElement("div");
    let checkButtonWrap = document.createElement("div");
    let checkButton = document.createElement("button");
    let check = document.createElement("img");
	let editButtonWrap = document.createElement("div");
    let editButton = document.createElement("button");
    let edit = document.createElement("img");
	let xButtonWrap = document.createElement("div");
    let xButton = document.createElement("button");
    let x = document.createElement("img");

	li.setAttribute("id", "liID" + id);
	aTask.setAttribute("id", "taskID" + id);
	checkButton.setAttribute("id", "checkID" + id);
	editButton.setAttribute("id", "editID" + id);
	xButton.setAttribute("id", "xID" + id);

	// Set up images
	check.setAttribute("src", "../images/check.png");
	check.setAttribute("alt", "check");
	edit.setAttribute("src", "../images/edit.png");
	edit.setAttribute("alt", "push off");
	x.setAttribute("src", "../images/x.png");
	x.setAttribute("alt", "delete");

	// Set the text for the elements to display
	aTask.textContent = newTask;
	
	// set the class for the styles to apply to the HTML tag
	li.classList = "fbText tText";
	taskRow.classList = "task";
    aTask.classList = "fbInput tInput";
    checkButtonWrap.classList = "buttonWrap";
    checkButton.classList = "taskButton";
	check.classList = "taskIcon";
	editButtonWrap.classList = "buttonWrap";
    editButton.classList = "taskButton";
	edit.classList = "taskIcon";
	xButtonWrap.classList = "buttonWrap";
    xButton.classList = "taskButton";
	x.classList = "taskIcon";

	checkButton.appendChild(check);
    checkButtonWrap.appendChild(checkButton);
	editButton.appendChild(edit);
    editButtonWrap.appendChild(editButton);
	xButton.appendChild(x);
    xButtonWrap.appendChild(xButton);
	taskRow.appendChild(aTask);
    taskRow.appendChild(checkButtonWrap);
	taskRow.appendChild(editButtonWrap);
	taskRow.appendChild(xButtonWrap);
    li.appendChild(taskRow);
    dynamicList.appendChild(li);

	checkButton.addEventListener("click", (e) => {
		e.stopPropagation();
		var taskID = e.target.parentElement.getAttribute("id"); 
      	taskID = taskID.substring(7);
		
		var removedTask;
		tempRefTasks.doc(taskID).get().then((doc) => {
			removedTask = doc.data().task;
		}).then(() => {
			tempRefComplete.add({
				task: removedTask
			})
		}).then(() => {
			tempRefTasks.doc(taskID).delete();
		}).catch(e => console.log(e.message));
    })

	// incomplete
	editButton.addEventListener("click", (e) => {
		e.stopPropagation();
		var taskID = e.target.parentElement.getAttribute("id");
		taskID = taskID.substring(6);

		if (document.getElementById("divInputID" + id) === null) {
			let divInput = document.createElement("div");
			let divButton = document.createElement("div");
			let eInput = document.createElement("input");
			let eButton = document.createElement("button");
			divInput.setAttribute("id", "divInputID" + id);
			divButton.setAttribute("id", "divButtonID" + id);
			eInput.setAttribute("type", "text");
			eInput.setAttribute("placeholder", "enter the new task here");
			eInput.setAttribute("id", "editInputID" + id);
			eInput.setAttribute("style", "height: 4vh;");
			eButton.setAttribute("style", "margin-top: 2vh; margin-bottom: 2vh; margin-left: 0.5%;");
			eButton.setAttribute("id", "eButtonID" + id);

			eInput.classList = "fInput tInput";
			eButton.classList = "suliButton";

			eButton.textContent = "Make Edit";

			divInput.appendChild(eInput);
			divButton.appendChild(eButton);
			li.append(divInput);
			li.append(divButton);

			eButton.onclick = () => { tempRefTasks.doc(taskID).set({
				task: eInput.value
			}).then(() => {
				document.getElementById("divInputID" + id).remove();
				document.getElementById("divButtonID" + id).remove();
			}).catch(e => console.log(e.message)) };
		}
		else {
			document.getElementById("divInputID" + id).remove();
			document.getElementById("divButtonID" + id).remove();
		}
	});

	xButton.addEventListener("click", (e) => {
		e.stopPropagation();
		var taskID = e.target.parentElement.getAttribute("id"); 
      	taskID = taskID.substring(3);

		var removedTask;
		tempRefTasks.doc(taskID).get().then((doc) => {
			removedTask = doc.data().task;
		}).then(() => {
			tempRefDeleted.add({
				task: removedTask
			})
		}).then(() => {
			tempRefTasks.doc(taskID).delete();
		}).catch(e => console.log(e.message));
    })
}

// gets input from task input box
function ready() {
    taskItem = document.getElementById("taskItem").value;
}

// adds task to database
function addTask() {
	var tempRef = db.collection("users").doc(userID.email).collection("task lists").doc(sessionStorage.getItem("tlName"));
	var tempRefTasks = tempRef.collection("tasks");

	ready();
    tempRefTasks.add({
        task: taskItem
    }).catch(e => console.log(e.message));

	document.getElementById("taskItem").value = "";
}

// https://www.w3schools.com/howto/howto_css_modals.asp
// Get the modal
var modal = document.getElementById("menuModal");

function ctrlModal() {
	if (window.getComputedStyle(modal).display === "none") {
		modal.style.display = "flex";
	}
	else {
		modal.style.display = "none";
	}
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
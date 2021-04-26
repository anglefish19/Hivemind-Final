// majority, if not all, functions within this file contain code borrowed and 
// adapted from Mrs. Denna's Student Tutoring App and the firebase intro we did 
// as a class

var dynamicList;
var taskItem;    // values of the task input box

// changes page to about
function changePage() {
	window.location.href = "html/about.html";
}

// loads the tasks already in database onto page and adds/removes tasks when changes
// are made
function loadTasks() {
	db.collection("taskCollection" + userID.email).onSnapshot(snapshot => {
		let changes = snapshot.docChanges();
		changes.forEach(change => {
			if (change.type == "added") {
				createTaskRow(change.doc.data().task, change.doc.id)
			}
			else if (change.type == "removed") {
				// finding the li in the DOM of the document that was just removed
				const idToRemove = "liID" + change.doc.id;

				let li = document.querySelector("[data-id=" + idToRemove + "]");
				li.remove();
			}
		})
	});
}

// adds a task to list
function createTaskRow(newTask, id) {
	let li = document.createElement("li");
	let taskRow = document.createElement("div");
	let aTask = document.createElement("div");
    let checkButtonWrap = document.createElement("div");
    let checkButton = document.createElement("button");
    let check = document.createElement("img");

	li.setAttribute("data-id", "liID" + id);
	checkButton.setAttribute("data-id", "buttonID" + id);

	// Set up image
	check.setAttribute("src", "../images/check.png");
	check.setAttribute("alt", "check");

	// Set the text for the elements to display
	aTask.textContent = newTask;
	
	// set the class for the styles to apply to the HTML tag
	li.classList = "fbText tText";
	taskRow.classList = "task";
    aTask.classList = "fbInput tInput";
    checkButtonWrap.classList = "buttonWrap";
    checkButton.classList = "taskButton";
	check.classList = "taskIcon";

	checkButton.appendChild(check);
    checkButtonWrap.appendChild(checkButton);
	taskRow.appendChild(aTask);
    taskRow.appendChild(checkButtonWrap);
    li.appendChild(taskRow);
    dynamicList.appendChild(li);

	checkButton.addEventListener("click", (e) => {
		e.stopPropagation();
		var deleteID = e.target.parentElement.getAttribute("data-id"); 
      	deleteID = deleteID.substring(8);
		db.collection("taskCollection" + userID.email).doc(deleteID).delete();
    })
}

// gets input from task input box
function ready() {
    taskItem = document.getElementById("taskItem").value;
}

// adds task to database
function addTask() {
	ready();
    db.collection("taskCollection" + userID.email).add({
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
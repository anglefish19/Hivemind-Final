// some functions within this file contain code borrowed and 
// adapted from Mrs. Denna's Student Tutoring App and the firebase intro we did 
// as a class

var taskItem;    // values of the task input box
var tlName;
var tlCode;

let unsubscribe;

// ABOUT
function changePage() {
	window.location.href = "html/about.html";
}

// USER'S HOMEPAGE
function loadAllTL() {
	// https://stackoverflow.com/questions/4597050/how-to-check-if-the-url-contains-a-given-string
	if (window.location.href.indexOf("today.html") > -1) {
		var tempRef = db.collection("users").doc(userID.email).collection("task lists");

		tempRef.get().then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				if (document.getElementById("dynamicList" + doc.id) === null) {
					sessionStorage.setItem("tlName", doc.data().name);
					sessionStorage.setItem("tlCode", doc.data().code);
					
					let tlTitle1 = document.createElement("div");
					tlTitle1.setAttribute("id", "tlTitle1" + doc.id);
					tlTitle1.classList = "listTitle clickableLT";
					tlTitle1.textContent = doc.data().name;
					tlTitle1.onclick = () => { viewTL(doc.data().name, doc.data().code) };
					tlTitle1.style.fontSize = "3vh";

					let tlTitle2 = document.createElement("div");
					tlTitle2.setAttribute("id", "tlTitle2" + doc.id);
					tlTitle2.classList = "listTitle clickableLT";
					tlTitle2.textContent = doc.data().name;
					tlTitle2.onclick = () => { expCol("completedList" + doc.id) };
					tlTitle2.style.fontSize = "3vh";

					let tlTitle3 = document.createElement("div");
					tlTitle3.setAttribute("id", "tlTitle3" + doc.id);
					tlTitle3.classList = "listTitle clickableLT";
					tlTitle3.textContent = doc.data().name;
					tlTitle3.onclick = () => { expCol("deletedList" + doc.id) };
					tlTitle3.style.fontSize = "3vh";

					let dynamicList = document.createElement("ul");
					dynamicList.setAttribute("id", "dynamicList" + doc.id);

					let completedList = document.createElement("ul");
					completedList.setAttribute("id", "completedList" + doc.id);
					// https://www.w3schools.com/jsref/met_element_setattribute.asp
					completedList.style.display = "none";

					let deletedList = document.createElement("ul");
					deletedList.setAttribute("id", "deletedList" + doc.id);
					deletedList.style.display = "none";

					document.getElementById("dynamicListsContainer").append(tlTitle1);
					document.getElementById("dynamicListsContainer").append(dynamicList);

					document.getElementById("completedListsContainer").append(tlTitle2);
					document.getElementById("completedListsContainer").append(completedList);

					document.getElementById("deletedListsContainer").append(tlTitle3);
					document.getElementById("deletedListsContainer").append(deletedList);
				}

				loadTasks("dynamicList" + doc.id, "completedList" + doc.id, "deletedList" + doc.id);
			});
		});
	}
}

// CONTROLS TASK LIST LISTING ON MENU
function tlListing() {
	var tempRef = db.collection("users").doc(userID.email).collection("task lists");
	
	// https://firebase.google.com/docs/firestore/query-data/get-data
	tempRef.get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			if (document.getElementById("tlAccess" + doc.id) === null) {
				let tlAccess = document.createElement("button");
				tlAccess.setAttribute("id", "tlAccess" + doc.id);
				tlAccess.classList = "modalSubButton";
				tlAccess.textContent = doc.data().name;
				// https://stackoverflow.com/questions/95731/why-does-an-onclick-property-set-with-setattribute-fail-to-work-in-ie
				tlAccess.onclick = () => { viewTL(doc.data().name, doc.data().code) };

				document.getElementById("listOfTaskLists").append(tlAccess);
			}
			else {
				document.getElementById("tlAccess" + doc.id).remove();
			}
		});
	});
}

// EXPAND/COLLAPSE COMPLETED/DELETED
function expCol(elementID) {
	toggle = document.getElementById(elementID);

	if (toggle.style.display === "none") {
		toggle.style.display = "block";
	}
	else {
		toggle.style.display = "none";
	}
}

// CREATE
function createTL() {
	tlName = document.getElementById("tlNameInput").value;
	tlCode = document.getElementById("tlCodeInput").value;
	
	// generates random number to add to code, then checks if that code is used
	var randomNum = getRandomIntInclusive(0, 9999);
	var usedNums = [randomNum];

	// https://firebase.google.com/docs/firestore/query-data/queries#collection-group-query
	db.collectionGroup("task lists").get().then((querySnapshot) => {
		querySnapshot.forEach((tl) => {
			if(tl.data().code === tlCode + randomNum) {
				var checkedThrough = false;

				while (!checkedThrough) {
					for (var i = 0; i < usedNums.length; i++) {
						if (usedNums[i] === randomNum) {
							randomNum = getRandomIntInclusive(0, 9999);
							usedNums.push(randomNum);
							i = usedNums.length;
						}
						else if (i = usedNums.length - 1) {
							checkedThrough = true;
						}
					}
				}
			}
		});
	});

	// https://stackoverflow.com/questions/46880323/how-to-check-if-a-cloud-firestore-document-exists-when-using-realtime-updates
	// https://stackoverflow.com/questions/47997748/is-possible-to-check-if-a-collection-or-sub-collection-exists
	var tempRef = db.collection("users").doc(userID.email).collection("task lists").doc(tlCode + randomNum);

	// checks if user has already made task list with the same name
	var notUsed = false;

	db.collectionGroup("task lists").get().then((querySnapshot) => {
		var num = querySnapshot.size;

		if (num === 0) { notUsed = true; }
		else if (tlName === "") {
			console.log("Please provide a name for your task list.")
		}
		else {
			querySnapshot.forEach((tl) => {
				if(tl.data().name === tlName && tl.data().maker === userID.email) {
					console.log("You've already made a task list with this name.");
				}
				else {
					num = num - 1;

					if (num === 0) { notUsed = true; }
				}		
			});
		}
	}).then(() => {
		if (notUsed) {
			tempRef.set({ 
				name: tlName,
				code: tlCode + randomNum,
				maker: userID.email,
				user: userID.email,
			}).then(() => {viewTL(tlName, tlCode + randomNum)}).catch(e => console.log(e.message));
		}
	});
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// random integer generator
function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

// VIEW TASK LISTS
function viewTL(tlName, tlCode) {
	sessionStorage.setItem("tlName", tlName);
	sessionStorage.setItem("tlCode", tlCode);
	window.location.href = "taskList.html";
}

// loads the tasks already in database onto page and adds/removes tasks when changes
// are made
function loadTasks(dynamicList, completedList, deletedList, added, deleted, edited) {
	if (sessionStorage.getItem("tlCode") != null) {
		var tempRef = db.collection("users").doc(userID.email).collection("task lists").doc(sessionStorage.getItem("tlCode"));
		var tempRefTasks = tempRef.collection("tasks");
		var tempRefComplete = tempRef.collection("completed");
		var tempRefDeleted = tempRef.collection("deleted");

		if (window.location.href.indexOf("taskList.html") > -1) {
			var rhAdd = tempRef.collection("rhAdd");
			var rhDelete = tempRef.collection("rhDelete");
			var rhEdit = tempRef.collection("rhEdit");

			handleChanges(rhAdd, added);
			handleChanges(rhDelete, deleted);
			handleChanges(rhEdit, edited);
		}

		handleChanges(tempRefTasks, dynamicList);
		handleChanges(tempRefComplete, completedList);
		handleChanges(tempRefDeleted, deletedList);
	}
}

function handleChanges(ref, list) {
	ref.onSnapshot((snapshot) => {
		snapshot.docChanges().forEach((change) => {
			let li = document.getElementById("liID" + change.doc.id);
			let aTask = document.getElementById("taskID" + change.doc.id);

			if (change.type === "added") {
				createTaskRow(change.doc.data().task, change.doc.id, list)
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
function createTaskRow(newTask, id, listElement) {
	dynamicList = document.getElementById(listElement);

	var tempRef = db.collection("users").doc(userID.email).collection("task lists").doc(sessionStorage.getItem("tlCode"));
	var tempRefTasks = tempRef.collection("tasks");
	var tempRefComplete = tempRef.collection("completed");
	var tempRefDeleted = tempRef.collection("deleted");

	var rh;
	if (listElement === "added") { rh = tempRef.collection("rhAdd"); }
	else if (listElement === "deleted") { rh = tempRef.collection("rhDelete"); }
	else if (listElement === "edited") { rh = tempRef.collection("rhEdit"); }

	let li = document.createElement("li");
	let taskRow = document.createElement("div");
	let aTask = document.createElement("div");
	let originalTask = document.createElement("div");
	let user = document.createElement("div");
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
	originalTask.setAttribute("id", "otID" + id);
	user.setAttribute("id", "uID" + id);

	checkButton.setAttribute("id", "checkID" + id);
	editButton.setAttribute("id", "editID" + id);
	xButton.setAttribute("id", "xID" + id);

	// Set up images
	check.setAttribute("src", "../images/check.png");
	check.setAttribute("alt", "check");
	edit.setAttribute("src", "../images/edit.png");
	edit.setAttribute("alt", "edit");
	x.setAttribute("src", "../images/x.png");
	x.setAttribute("alt", "delete");

	// Set the text for the elements to display
	aTask.textContent = newTask;
	if (listElement === "added" || listElement === "deleted" || listElement === "edited") {
		rh.doc(id).get().then((doc) => {
			if (listElement === "edited") {
				originalTask.textContent = "Original Task: " + doc.data().original;
			}

			user.textContent = "Changed by: " + doc.data().changedBy;
		}).catch(e => console.log(e.message));
	}
	
	// set the class for the styles to apply to the HTML tag
	li.classList = "fbText tText";
	taskRow.classList = "task";
    aTask.classList = "tInput";
    checkButtonWrap.classList = "buttonWrap";
    checkButton.classList = "taskButton";
	check.classList = "taskIcon";
	editButtonWrap.classList = "buttonWrap";
    editButton.classList = "taskButton";
	edit.classList = "taskIcon";
	xButtonWrap.classList = "buttonWrap";
    xButton.classList = "taskButton";
	x.classList = "taskIcon";

	if (listElement === "added" || listElement === "deleted" || listElement === "edited") {
		li.classList = "fbText tText rhLI";
		aTask.classList = "tInput rhBodyText";
		originalTask.classList = "tInput";
		originalTask.style.marginBottom = "1%";
		user.classList = "tInput rhInfoText";
		checkButtonWrap.classList = "buttonWrap rhButton";
		editButtonWrap.classList = "buttonWrap rhButton";
		xButtonWrap.classList = "buttonWrap rhButton";
	}

	taskRow.appendChild(aTask);

	if (listElement.includes("dynamicList") || listElement === "added" || listElement === "deleted" || listElement === "edited") {
		checkButton.appendChild(check);
		checkButtonWrap.appendChild(checkButton);
		if (listElement.includes("dynamicList")) {
			editButton.appendChild(edit);
			editButtonWrap.appendChild(editButton);
		}
		xButton.appendChild(x);
    	xButtonWrap.appendChild(xButton);
		taskRow.appendChild(checkButtonWrap);
		if (listElement.includes("dynamicList")) {
			taskRow.appendChild(editButtonWrap);
		}
		taskRow.appendChild(xButtonWrap);
	}

    li.appendChild(taskRow);

	if (listElement === "added" || listElement === "deleted" || listElement === "edited") {
		if (listElement === "edited") {
			li.appendChild(originalTask);
		}
		li.appendChild(user);
	}

	if (dynamicList != null) {
    	dynamicList.appendChild(li);
	}

	checkButton.addEventListener("click", (e) => {
		e.stopPropagation();
		var taskID = e.target.parentElement.getAttribute("id"); 
		if(taskID != null) { 
			taskID = taskID.substring(7);
		
			var removedTask, originalTask;
			if (listElement.includes("dynamicList")) {
				tempRefTasks.doc(taskID).get().then((doc) => {
					removedTask = doc.data().task;
				}).then(() => {
					tempRefComplete.get().then((querySnapshot) => {
						tempRefComplete.doc((querySnapshot.size + 1) + "taskComplete").set({
							task: removedTask
						}).catch(e => console.log(e.message));
					});
				}).then(() => {
					tempRefTasks.doc(taskID).delete();
				}).catch(e => console.log(e.message));
			}
			else if (listElement === "added" || listElement === "deleted" || listElement === "edited") {
				rh.doc(taskID).get().then((doc) => {
					removedTask = doc.data().task;

					if (listElement === "edited") {
						originalTask = doc.data().original;
					}
				}).then(() => {
					if (listElement === "added") {
						addTask("check", removedTask);
					}
					else if (listElement === "deleted" || listElement === "edited") { 
						var notDE = true;
						tempRefTasks.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								if (((listElement === "deleted" && doc.data().task === removedTask) || 
								(originalTask != null && doc.data().task === originalTask)) && notDE) {
									if (listElement === "deleted") {
										notDE = false;
										db.doc(doc.ref.path).delete().catch(e => console.log(e.message));
									}
									else if (listElement === "edited") {
										db.doc(doc.ref.path).set({
											task: removedTask
										}).then(() => { notDE = false }).catch(e => console.log(e.message));
									}
								}
							})
						})
					}
				}).then(() => {
					rh.doc(taskID).delete();
				}).catch(e => console.log(e.message));
			}
		}
    })

	editButton.addEventListener("click", (e) => {
		e.stopPropagation();
		var taskID = e.target.parentElement.getAttribute("id");
		if (taskID != null) { taskID = taskID.substring(6); }
		

		if (document.getElementById("divInputID" + id) === null && taskID != null) {
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

			eButton.onclick = () => { 
				db.collectionGroup("task lists").get().then((querySnapshot) => {
					querySnapshot.forEach((tl) => {
						tempRefTasks.doc(taskID).get().then((doc) => {
							if(tl.data().code === sessionStorage.getItem("tlCode") &&
							tl.data().user != userID.email) {
								var addToEdit = true;

								db.collection(tl.ref.path + "/rhAdd").get().then((subQS) => {
									subQS.forEach((taskObj) => {
										if (taskObj.data().task === doc.data().task) {
											addToEdit = false;
											db.doc(taskObj.ref.path).set({
												task: eInput.value,
												changedBy: userID.email,
											});
										}
									})
								}).then(() => {
									if (addToEdit) {
										db.collection(tl.ref.path + "/rhEdit").get().then((subQS) => {
											var notUpdated = true;
											var num = subQS.size;

											if (num === 0 && notUpdated) {
												db.collection(tl.ref.path + "/rhEdit").doc((subQS.size + 1) + "taskRHEdit").set({
													task: eInput.value,
													original: doc.data().task,
													changedBy: userID.email,
												})
											}
											
											subQS.forEach((taskObj) => {
												if (taskObj.data().task === doc.data().task) {
													db.doc(taskObj.ref.path).set({ 
														task: eInput.value,
														original: taskObj.data().original,
														changedBy: userID.email,
													}).then(() => {
														notUpdated = false;
													})
												}
												else {
													num = num - 1;

													if (num === 0 && notUpdated) {
														db.collection(tl.ref.path + "/rhEdit").doc((subQS.size + 1) + "taskRHEdit").set({
															task: eInput.value,
															original: doc.data().task,
															changedBy: userID.email,
														})
													}
												}
											})
										}).then(() => {
											tempRefTasks.doc(taskID).set({
												task: eInput.value
											})
										}).catch(e => console.log(e.message));
									}
									else {
										tempRefTasks.doc(taskID).set({
											task: eInput.value
										}).catch(e => console.log(e.message))
									}
								})
							}
						})
					});
				}).then(() => {
					document.getElementById("divInputID" + id).remove();
					document.getElementById("divButtonID" + id).remove();
				}).catch(e => console.log(e.message));
			};
		}
		else if (taskID != null) {
			document.getElementById("divInputID" + id).remove();
			document.getElementById("divButtonID" + id).remove();
		}
	});

	xButton.addEventListener("click", (e) => {
		e.stopPropagation();
		var taskID = e.target.parentElement.getAttribute("id"); 
      	if(taskID != null) { 
			taskID = taskID.substring(3);

			var removedTask;
			if (listElement.includes("dynamicList")) {
				tempRefTasks.doc(taskID).get().then((doc) => {
					removedTask = doc.data().task;
				}).then(() => {
					tempRefDeleted.get().then((querySnapshot) => {
						tempRefDeleted.doc((querySnapshot.size + 1) + "taskDeleted").set({
							task: removedTask
						}).then(() => {
							db.collectionGroup("task lists").get().then((querySnapshot) => {
								querySnapshot.forEach((tl) => {
									if(tl.data().code === sessionStorage.getItem("tlCode") &&
									tl.data().user != userID.email) {
										var addToDelete = true;

										db.collection(tl.ref.path + "/rhAdd").get().then((subQS) => {
											subQS.forEach((taskObj) => {
												if (taskObj.data().task === removedTask) {
													addToDelete = false;
													db.doc(taskObj.ref.path).delete();
												}
											})
										}).then(() => {
											db.collection(tl.ref.path + "/rhEdit").get().then((subQS) => {
												subQS.forEach((taskObj) => {
													if (taskObj.data().task === removedTask) {
														addToDelete = false;
														db.doc(taskObj.ref.path).delete();
													}
												})
											}).then(() => {
												if (addToDelete) {
													db.collection(tl.ref.path + "/rhDelete").get().then((subQS) => {
														db.collection(tl.ref.path + "/rhDelete").doc((subQS.size + 1) + "taskRHDelete").set({
															task: removedTask,
															changedBy: userID.email,
														})
													}).catch(e => console.log(e.message));
												}
											})
										}).catch(e => console.log(e.message));
									}
								});
							});
						}).catch(e => console.log(e.message));
					});
				}).then(() => {
					tempRefTasks.doc(taskID).delete();
				}).catch(e => console.log(e.message));
			}
			else if (listElement === "added" || listElement === "deleted" || listElement === "edited") {
				rh.doc(taskID).get().then((doc) => {
					removedTask = doc.data().task;
				}).then(() => {
					rh.doc(taskID).delete();
				}).catch(e => console.log(e.message));
			}
		}
    })
}

// gets input from task input box
function ready(button, task) {
	if (button === "addTask" && document.getElementById("taskItem").value != "") { 
		taskItem = document.getElementById("taskItem").value; 
	}
    else if (button === "check" && task != null) { taskItem = task; }
}

// adds task to database
function addTask(button, task) {
	var taskNum = 1;

	var tempRef = db.collection("users").doc(userID.email).collection("task lists").doc(sessionStorage.getItem("tlCode"));
	var tempRefTasks = tempRef.collection("tasks");
	var tempRefComplete = tempRef.collection("completed");
	var tempRefDeleted = tempRef.collection("deleted");
	
	ready(button, task);

	tempRefTasks.get().then((querySnapshot) => {
		taskNum = taskNum + querySnapshot.size;
	}).then(() => {
		tempRefComplete.get().then((querySnapshot) => {
			taskNum = taskNum + querySnapshot.size;
		}).then(() => {
			tempRefDeleted.get().then((querySnapshot) => {
				taskNum = taskNum + querySnapshot.size;
			}).then(() => {
				tempRefTasks.doc(taskNum + "task").set({
					task: taskItem
				}).then(() => {
					db.collectionGroup("task lists").get().then((querySnapshot) => {
						querySnapshot.forEach((tl) => {
							if(tl.data().code === sessionStorage.getItem("tlCode") &&
							tl.data().user != userID.email && button === "addTask") {
								db.collection(tl.ref.path + "/rhAdd").get().then((subQS) => {
									db.collection(tl.ref.path + "/rhAdd").doc((subQS.size + 1) + "taskRHAdd").set({
										task: taskItem,
										changedBy: userID.email,
									})
								}).catch(e => console.log(e.message));
							}
						});
					});
				}).catch(e => console.log(e.message));

				document.getElementById("taskItem").value = "";
			});
		});
	});
}

// JOIN
function joinTL() {
	var code = document.getElementById("tlJoinInput").value;
	db.collectionGroup("task lists").get().then((querySnapshot) => {
		var num = querySnapshot.size;

		querySnapshot.forEach((tl) => {
			if(tl.data().code === code && tl.data().user != userID.email) {
				var tempRef = db.collection("users").doc(userID.email).collection("task lists").doc(code);

				tempRef.set({ 
					name: tl.data().name,
					code: code,
					maker: tl.data().maker,
					user: userID.email,
				}).then(() => {
					// https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference
					db.collection(tl.ref.path + "/tasks").get().then((subQS) => {
						subQS.forEach((taskObj) => {
							tempRef.collection("tasks").doc(taskObj.id).set({
								task: taskObj.data().task
							}).catch(e => console.log(e.message))
						})
					}).catch(e => console.log(e.message)).then(() => {
						viewTL(tl.data().name, code)
					}).catch(e => console.log(e.message));
				});
			}
			else if (tl.data().code === code && tl.data().user === userID.email) {
				console.log("You've already joined this task list.")
			}
			else {
				num = num - 1;

				if (num === 0) {
					console.log("Invalid code.");
				}
			}
		});
	});
}

// https://www.w3schools.com/howto/howto_css_modals.asp
// Get the modal
var menuModal = document.getElementById("menuModal");
var rhModal = document.getElementById("rhModal");

function ctrlModal() {
	if (window.getComputedStyle(menuModal).display === "none") {
		menuModal.style.display = "flex";
		if (window.location.href.indexOf("taskList.html") > -1) {
			rhModal.style.display = "none";
		}
	}
	else { menuModal.style.display = "none"; }
}

function ctrlRHModal() {
	rhModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == menuModal) {
    menuModal.style.display = "none";
  }

  if (event.target == rhModal) {
    rhModal.style.display = "none";
  }
}

// adjust height of modal
window.onscroll = function() {
	menuModal.style.height = $(window).height() + $(window).scrollTop();
	
	if (window.location.href.indexOf("taskList.html") > -1) {
		rhModal.style.height = $(window).height() + $(window).scrollTop();
	}
}
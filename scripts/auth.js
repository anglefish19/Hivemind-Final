var suForm1 = document.getElementById("suForm1");
var suForm2 = document.getElementById("suForm2");
var suTitle = document.getElementById("suFormTitle");
var liForm = document.getElementById("liForm");
var liTitle = document.getElementById("liFormTitle");
var suliMobile = document.getElementById("suliMobile");
var cpContainer = document.getElementById("cpContainer");
var tasklist = document.getElementById("tasklist");

var suButton = document.getElementById("signUpButton");
var liButton = document.getElementById("logInButton");
var loButton = document.getElementById("logOutButton");

var userID;
var email;

// goes to next page of sign up
function suNext() {
    var firstName = document.getElementById("firstNameInput").value;
    var lastName = document.getElementById("lastNameInput").value;
    email = document.getElementById("emailInput").value;

    // regular expression taken from https://www.w3resource.com/javascript/form/email-validation.php
    // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    const emailValidation = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    
    if (firstName === "" || lastName === "" || email === "") {
        console.log("Please make sure that all fields have been completed.");
    }

    if (firstName != "" && lastName != "" && email != "" && emailValidation.test(email)) {
        sessionStorage.setItem("firstName", firstName);
        sessionStorage.setItem("lastName", lastName);
        sessionStorage.setItem("email", email);
        window.location.href = "signUp2.html";
    }
    else if (email != "" && !emailValidation.test(email)) {
        console.log("\"" + email + "\" is not a valid email.");
    }
}

// finishs sign up
function su() {
    var username = document.getElementById("usernameInput").value;
    var password1 = document.getElementById("passwordInput1").value;
    var password2 = document.getElementById("passwordInput2").value;

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    // https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username/12019115
    // https://stackoverflow.com/questions/9628879/javascript-regex-username-validation
    const usernameValidation = /^(?=.{6,18}$)[\w\*\-\~\.]+$/;
    const passwordValidation = /^(?=.{6,18}$)[\S]+$/;

    if (username === "" || password1 === "" || password2 === "") {
        console.log("Please make sure that all fields have been completed.");
    }
    
    if (username != "" && !usernameValidation.test(username)) {
        console.log("Invalid username. Username must be 6-18 characters long; " + 
        "acceptable characters include alphanumeric characters, *, -, ~, and .");
    }
    
    if ((password1 != "" || password2 != "") && password1 != password2) {
        console.log("Passwords do no match.");
    }
    else if (password1 != "" && !passwordValidation.test(password1)) {
        console.log("Invalid password. Password must be 6-18 characters long and " + 
        "should not include spaces.");
    }

    if (username != "" && password1 != "" && password2 != "" && password1 == password2
    && usernameValidation.test(username) && passwordValidation.test(password1)) {
        db.collection("users").doc(sessionStorage.getItem("email")).set({
            firstName: sessionStorage.getItem("firstName"),
            lastName: sessionStorage.getItem("lastName"),
            username: username,
            email: sessionStorage.getItem("email"),
            password: password1,
        }).catch(e => console.log(e.message));
        
        auth.createUserWithEmailAndPassword(sessionStorage.getItem("email"), password1).then(() => {
            console.log("Signed up");
        }).catch(e => console.log(e.message));
        sessionStorage.removeItem("firstName");
        sessionStorage.removeItem("lastName");
        sessionStorage.removeItem("email");
    }
}

// logs in
function li() {
    email = document.getElementById("emailInputLI").value;
    var password = document.getElementById("pwInputLI").value;
    
    auth.signInWithEmailAndPassword(email, password).then(() => {
        console.log("Logged in");
    }).catch(e => console.log(e.message));
}

// changes display based on whether a user is logged in or not
auth.onAuthStateChanged(user => {
    if (user) {
        userID = firebase.auth().currentUser;
        console.log(userID.email)

        var currentPage = window.location.href;
        if (currentPage.includes("index.html")) {
            window.location.href = "html/today.html";
        }
        else if (!currentPage.includes("today.html") && !currentPage.includes("create.html") &&
        !currentPage.includes("join.html") && !currentPage.includes("taskList.html")) {
            window.location.href = "today.html";
        }

        dynamicList = document.getElementById("dynamicList");
        // document.createElement("ul");
        // dynamicList.setAttribute("data-id", "dynamicList");
        // sessionStorage.setItem("dynamicList", dynamicList);
	    loadTasks();
    }
    else {
        if (document.getElementById("dynamicList") != null) {
            document.getElementById("dynamicList").remove();
        }
    }
 }) 

// logs out
function lo() {
    auth.signOut();
    var currentPage = window.location.href;
    if (currentPage.includes("today.html") || currentPage.includes("create.html") ||
    currentPage.includes("join.html") || currentPage.includes("taskList.html")) {
        window.location.href = "../index.html";
    }
    console.log("Signed Out");
}
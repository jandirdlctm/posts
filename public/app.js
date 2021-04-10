
function createUserAccountOnServer(user){
    var userData = "firstName=" + encodeURIComponent(user.firstName);
    userData += "&lastName=" + encodeURIComponent(user.lastName);
    userData += "&email=" + encodeURIComponent(user.email);
    userData += "&plainPassword=" + encodeURIComponent(user.password);

    return fetch("http://localhost:3000/users", {
        method: "POST",
        body: userData,
        credentials: 'include',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
}

function verifyUserAccountOnServer(user){
    var userData = "email=" + encodeURIComponent(user.email);
    userData += "&plainPassword=" + encodeURIComponent(user.password);

    return fetch("http://localhost:3000/session", {
        method: "POST",
        body: userData,
        credentials: 'include',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
}
// session
function getSession(){
    return fetch("http://localhost:3000/session",{
        credentials: "include"
    });
}

// posts
function getPostsFromServer(){
    return fetch('http://localhost:3000/posts',{
        credentials: 'include'
    })
}

function createPostOnServer(post){
    var postData = "firstName=" + encodeURIComponent(post.firstName);
    postData += "&lastName=" + encodeURIComponent(post.lastName);
    postData += "&post=" + encodeURIComponent(post.post);

    return fetch('http://localhost:3000/posts',{
        method: "POST",
        body: postData,
        credentials: 'include',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
}

function deletePostOnServer(postId){
    return fetch(`http://localhost:3000/posts/${postId}`,{
        method: "DELETE",
        credentials: "include"
    })
}


var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      logInMode: true,
      registerMode: false,
      //   register
      // register inputs
      firstNameInput: "",
      lastNameInput: "",
      emailInput: "",
      passwordInput: "",
      //register succcess?
      registerSuccess: false,
      registerInputErrorsMode: false,
      registerSuccessMessage: "",
      //register error
      registerInputErrors: [],
      //LOGIN
      //LOGIN INPUTS
      logInEmailInput: "",
      logInPasswordInput: "",
      //LOGIN ERRORS
      logInFailure: false,
      logInInputErrorsMode: false,
      logInFailureMessage: "",
      logInInputErrors: [],
      //AUTHENTICATED  
      authenticated: null,
      // posts
      postsArray: [],
      showPostMode: true,
      //ADDING POSTS
      addPostMode: false,
      //POST INPUT
      postFirstNameInput : "",
      postLastNameInput: "",
      postInput : "",
      //POST ERRORS
      postInputErrorsMode : false,
      postInputErrors : [],  
    },
    methods: {
        logInModeOn: function(){
            this.logInMode = true;
            this.registerMode = false;
            // clearing inputs
            this.logInInputErrorsMode = false;
            this.logInEmailInput = "";
            this.logInPasswordInput = "";
        },
        registerModeOn: function(){
            this.registerInputErrorsMode = false;
            this.registerSuccess = false;
            this.logInMode = false;
            this.registerMode = true;
            // clearing all inputs
            this.firstNameInput = "";
            this.lastNameInput = "";
            this.emailInput = "";
            this.passwordInput= "";
        },
        // REGISTER BARBER
        validateRegisterUserInputs: function(){
            this.registerInputErrors = [];
            if (this.firstNameInput.length == 0) {
                this.registerInputErrors.push("Please enter Name")
            }
            if (this.lastNameInput.length == 0) {
                this.registerInputErrors.push("Please enter Last Name")
            }
            if (this.emailInput.length == 0) {
                this.registerInputErrors.push("Please enter Email")
            }
            if (this.passwordInput.length == 0) {
                this.registerInputErrors.push("Please enter Password");
            }
        
            return this.registerInputErrors == 0;
        },

        registerUser: function(){
            var valid = this.validateRegisterUserInputs();
            if (!valid){
                this.registerInputErrorsMode = true;
                return;
            }
            // creating the BARBER OBJECT
            var newUser = {
                firstName: this.firstNameInput,
                lastName: this.lastNameInput,
                email: this.emailInput,
                password: this.passwordInput
            }
            // sending the request to the api
            createUserAccountOnServer(newUser).then((response) =>{
                console.log(response.status);
                if (response.status == 201){
                    console.log("successful created");
                    this.registerSuccess = true;
                    this.registerSuccessMessage = "Your account has been created succesfully, please log in."
                    this.firstNameInput = "";
                    this.lastNameInput = "";
                    this.emailInput = "";
                    this.passwordInput = ""
                }
                else if (response.status == 422){
                    this.registerSuccess = true;
                    this.registerSuccessMessage = "The email entered already exists";
                    this.emailInput = "";
                }
                else if(response.status == 500){
                    this.registerSuccess = true;
                    this.registerSuccessMessage = "Error ocurred when creating account"
                    this.firstNameInput = "";
                    this.lastNameInput = "";
                    this.emailInput = "";
                    this.passwordInput = ""
                }
            })

        },
        // LOGIN METHODS
        validateLogin: function(){
            this.logInInputErrors = [];
            if (this.logInEmailInput.length == 0) {
                this.logInInputErrors.push("Please enter an email");
            }
            if (this.logInPasswordInput.length == 0) {
                this.logInInputErrors.push("Please enter a password");
            }
            return this.logInInputErrors == 0;
        },

        logInUser: function(){
            console.log("log in user button clicked");
            // VALIDATING THE LOGIN INPUTS
            var valid = this.validateLogin();
            if (!valid){
                this.logInInputErrorsMode = true;
                return;
            }
            // CREATING THE USER OBJECT
            var user = {
                email: this.logInEmailInput,
                password: this.logInPasswordInput
            }
            // SENDING THE REQUEST TO THE API
            verifyUserAccountOnServer(user).then((response)=>{
                console.log(response.status);
                if (response.status == 201){
                    this.authenticated = true;
                }
                else if (response.status == 401){
                    this.logInFailure = true;
                    this.logInFailureMessage = "Please enter valid account";
                    this.logInEmailInput = "";
                    this.logInPasswordInput = "";
                }
            })
        },

        //check if logged in
        checkLoggedIn: function(){
            getSession().then((response)=>{
                if (response.status == 401){
                    this.authenticated = false;
                }
                else if (response.status == 200){
                    this.authenticated = true;
                    // this.loadPosts();
                }
            })
        },
        loadPosts: function(){
            // this.showPostMode = !this.showPostMode;
            console.log("loadPosts clicked")
            getPostsFromServer().then((response)=>{
                response.json().then((data)=>{
                    console.log("Posts loaded from server", data);
                    this.postsArray = data;
                })
            })
        },
        validateAddPost: function(){
            this.postInputErrors = [];
            if (this.postFirstNameInput.length == 0){
                this.postInputErrors.push("Please enter first name")
            }
            if (this.postLastNameInput.length == 0){
                this.postInputErrors.push("Please enter last name")
            }
            if (this.postInput.length == 0){
                this.postInputErrors.push("Please enter post")
            }
            return this.postInputErrors == 0;
        },
        addPostSubmitButtonClicked: function(){
            console.log("add post button clicked");
            var valid = this.validateAddPost();
            if (!valid){
                this.postInputErrorsMode = true;
                return;
            }
            // CREATE THE POST
            var newPost = {
                firstName : this.postFirstNameInput,
                lastName : this.postLastNameInput,
                post : this.postInput
            }
            createPostOnServer(newPost).then((response)=>{
                console.log(response);
                this.loadPosts();
            });
            this.postFirstNameInput = "";
            this.postLastNameInput = "";
            this.postInput = "";

        },
        // DELETE
        deletePost: function(post){
            deletePostOnServer(post._id).then((response)=>{
                if (response.status == 404){
                    alert("Please delete only the posts you created")
                }
                
                this.loadPosts();
            })
        },
        // sign out
        signOutAction: function(){
            this.authenticated = false;
            this.logInEmailInput = "";
            this.logInPasswordInput = "";
        }
    },
    created: function() {
        console.log("Created hit")
        this.checkLoggedIn();
    }
  })
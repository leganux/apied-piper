# APIed Piper

A minute microservice API rest generator

<hr>
<br>
<p align="center">
  <img src="https://raw.githubusercontent.com/leganux/apied-pipper/main/apiedpiper.jpg" width="550" title="apied piper logo">
</p>

NOW AVAILABLE =>> If you want to install Code-Rag-SDK visit
<a href="https://www.npmjs.com/package/code-rag-sdk" target="_blank">npm Code-Rag-SDK docs</a>

<p align="justify">


</p>

## How to use

**Install**

```text
npm install apied-piper
```

```javascript
// example definition object
let definitionObject = {
    employee: {
        operation: {
            createOne: true,
            createMany: true,
            getMany: true,
            getOneById: true,
            getOneWhere: true,
            findUpdateOrCreate: true,
            findUpdate: true,
            updateById: true,
            findIdAndDelete: true,
        },
        definition: {
            name: {
                type: 'string',
                mandatory: true
            },
            position: {
                type: 'age',
            },
            location: {
                type: 'string',
            },
        }
    }
}

// import library
let piedPiper = require('apied-piper');


//Create new service API REST instance
let microService = new piedPiper(definitionObject, 'mongodb://localhost:27017/piedpipper', 3000, options)


// construct routes
microService.constructRoutes()


// start the service
microService.start()

```

**Full example definition object**

```javascript
let definitionObject = {
    kindOfClassmate: {
        operation: {
            all: true
        },
        definition: {
            name: {
                type: 'string',
                mandatory: true
            },
            active: {
                type: 'boolean',
                mandatory: true
            },
            createdAt: {
                type: 'date',
                mandatory: true,
                default_function: dateFunction
            },
        }
    },
    classmate: {
        operation: {
            all: true
        },
        definition: {
            name: {
                type: 'string',
                mandatory: true
            },
            age: {
                type: 'number',
                mandatory: true
            },
            kind: {
                type: 'oid',
                rel: 'kindOfClassmate'
            },
            moreInfo: {
                type: 'any',
            },
        }
    },
    classRoom: {
        operation: {
            createOne: true,
            createMany: true,
            getMany: true,
            getOneById: true,
            getOneWhere: true,
            findUpdateOrCreate: true,
            findUpdate: true,
            updateById: true,
            findIdAndDelete: true,
        },
        definition: {
            name: {
                type: 'string',
                mandatory: true
            },
            description: {
                type: 'string',
                mandatory: true
            },
            isOpen: {
                type: 'boolean',
            },
            position: {
                type: 'number',
            },
            createdAt: {
                type: 'date',
                mandatory: true,
                default_function: dateFunction
            },
            classmates: {
                type: 'array_oid',
                rel: 'classmate'
            }

        }
    }
}

```

**SSL support**

```javascript

let options = {active_cors: false}
let ssl_config = {
    private: "path/to/private/key", // SSL key file location
    cert: "path/to/certificate/file", // CERT  file location
    port: 443,// SSL port
}

let microService = new piedPiper(definitionObject, 'mongodb://localhost:27017/apied-pipper', 80, options, ssl_config)

```

**Options**

Options can be used to personalize every instance of APIed-Piper

```javascript

let options = {
    active_cors: true, // if you want to allow cors from everywhere *optional*
    api_base_uri: '/apiv2/', // the base url you consume. default  = /api/ *optional*
    activeLogRequest: true, // shows in console all the http request in te API *optional*
    acl: {[object]},  //the acl definition for auth routes. Read the documentation below *optional*
    acl_custom: {[object]}, //the acl definition for auth in custom routes *optional*
    middleware: async function (req, res, next) { //custom middelware function for rutes, use as express middelware *optional*
        next()
    },
    db_timestamps: true // adds automaticalli collections fields updateAt & createdAt *optional*

}


```

**Mailing (for register activation and reset password)**

You can review nodemailer documentation for more info

```javascript

let transport = {
    host: "smtp.apipedpiper.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: "apiedpiper",
        pass: "tables",
    },
}
let data = await microService.configureMailer(transport)

// console data: 

{
    verify:[object],
        transporter
:
    {
        ClassTransporter
        Nodemailer
    }

}

```

Now you can use this config to send mails

```javascript

let message = {
    from: "sender@server.com",
    to: "apied-piper@leganux.com",
    subject: "Default mail from Apied Piper",
    html: "<p>Default mail from Apied Piper</p>",
    attachments: [
        {
            filename: 'text3.txt',
            path: '/path/to/file.txt'
        }

    ]
}

let data = await microService.sendMail(message)

// console data: 
{
    Object
    Nodemailer
    sended
}

```

**ACL and Login**

Now in version 3.0+ you can create an easy ACL to allow or disallow access some profiles to some routes. This acl
includes the pre-register of first admin user, a register module, a login module, a token generator and finaly an
automatic middleware to validate sessions.
APIed-Piper now is a solution all in one to easy deploy APIs with protection included.

To use those new functions you must to invoque activeLoginAndRegister method as describe bellow

The ACL object defines which role has what permissions, a continuation an example.

```javascript

let acl = {
    Admin: {
        kindOfClassmate: '*',
        classmate: '*',
        classRoom: '*',
    },
    User: {
        kindOfClassmate: {
            getMany: true,
            getOneById: true,
            getOneWhere: true,
            findUpdateOrCreate: true,
            findUpdate: true,
            updateById: true,
            findIdAndDelete: true,
            datatable: true,
            datatable_aggregate: true,
        },
        classmate: {
            createOne: true,
            createMany: true,
            getMany: true,
            getOneById: true,
            getOneWhere: true,
        },
        classRoom: {
            getMany: true,
            getOneById: true,
            getOneWhere: true,
        },

    }
}

```

config and call to method (now you need to execute config email to activate users via email)

```javascript
let defaultUser = {user: "Jared", pass: "Meinertzhagens-Haversack", email: "JaredDunn@piedpiper.com"} // defines the first admin will be created in system, be carafull
let collection = 'signature-box' //the model and collection name to save profiles and roles

let optionsLogin = {
    activeNewUsers: true, //DEPRECATED ----> REMOVED FOR SCURITY REASONS
    adminProfileName: "Admin", // the name of main role default:admin
    fAfterRegister: async function (user) { // callback to execute after user register
        return user
    },
    durationToken: 60, // time in munites will token live default:60
    JWTPASSWORD: "bachmanityinsanity", // the token pasword for auth
    sendConfirmMail: { //mandatory to activate users by mail
        from: 'activate@myserver.com',//mail of sender, typically the mail of nodemailer config
        subject: 'Please activate account',//topic of activation subject
        html: "Please activate account, open next link: <br> <a href='{{link}}'>{{link}}</a>" // html template for email must have {{link}} patern to reference  user correct link
    },
    sendResetPasswordMail: { //mandatory to activate users by mail
        from: 'password@myserver.com',//mail of sender, typically the mail of nodemailer config
        subject: 'Reset your password',//topic of activation subject
        html: "Please change ypur paswword in the next link: <br> <a href='{{link}}'>{{link}}</a>" // html template for email must have {{link}} patern to reference  user correct link
    },
    customFields: { // OPTIONAL object structure like mongoose schema to add users collection
        born_date: {
            type: Date,
            mandatory: false
        },
        country_number: {
            type: Number,
            mandatory: true,
            default: 0
        }

    },
    message_not_user_found: "This user was not found",//custom message user not found html
    message_expired_link: "This code has been expired",//custom message expirred link html
    html_change_password: <htmlfiletemplate path>,//custom  html template for reset pasword

}

microService.activeLoginAndRegister(defaultUser, collection, optionsLogin)

```

Next is the html template for reste password, very importan preserve

* ___MAIL___
* ___CODE___

Parameters, and the same url but method post to made the change

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Reset-Password</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
          integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
</head>
<body>
<div class="container">
    <br>
    <br>
    <br>
    <div class="row">
        <div class="col-md-3 col-12"></div>
        <div class="col-md-6 col-12">
            <div class="card bg-secondary text-white">
                <div class="card-header">

                    <h3 class=""> Password</h3>
                </div>
                <div class="card-body">
                    <label> Password</label>
                    <input type="email" class="form-control" id="email" value="___MAIL___" disabled="true"
                           placeholder="User email">
                    <label> Password</label>
                    <input type="password" class="form-control" id="password" placeholder="Insert new password">
                    <label> Password again</label>
                    <input type="password" class="form-control" id="password2" placeholder="Retype password">
                    <input class="form-control" id="userCode" value="___CODE___" placeholder="" style="display: none;">
                    <br>
                    <button class="btn btn-dark btn-block" id="save"> SAVE</button>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-12"></div>
    </div>
</div>


<script src="https://code.jquery.com/jquery-3.6.1.js" integrity="sha256-3zlB5s2uwoUzrXK3BT7AX3FyvojsraNFxCc2vC/7pNI="
        crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"
        integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
        crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js"
        integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
        crossorigin="anonymous"></script>
<script>

    $(document).ready(function () {
        $("#save").click(function () {
            let email = $("#email").val()
            let password = $("#password").val()
            let password2 = $("#password2").val()
            let code = $("#userCode").val()

            if (password2 != password) {
                alert('Password doesn´t match')
                return
            }
            if (password.length < 8) {
                alert('Password  too short')
                return
            }

            $.post(location.href, {email, password, password2, code}, function (data) {
                if (data.success) {
                    alert('Password set correctly')
                    setTimeout(function () {
                        window.close();
                    }, 1)
                } else {
                    alert("Can't change password: ", data.message)
                }
            })
        })
    })

</script>

</body>

</html>


```

<b>How to register and login </b>

Register

```javascript

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "user": "Dinesh",
    "pass": "hotdog-nothotdog3",
    "email": "dinesh@piedpipper.com"
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3000/apiv2/register/<ROLE_NAME>", requestOptions) // ROLE_NAME will be reemplace with the role  name of user you want ro register for example Admin, or User. According to the ACL
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));



```

Forgot Password

```javascript

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "email": "dinesh@piedpipper.com"
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3000/apiv2/forgotPassword", requestOptions) 
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
```

Login

```javascript

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "user": "Jared",
    "pass": "Meinertzhagens-Haversack"
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3000/apiv2/login", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));


/** Response example */

let rsp = {
    "success": true,
    "code": 200,
    "message": "Login success",
    "data": {
        "user": {
            "_id": "62e6d094964b170c8a442a7a",
            "active": true,
            "user": "Jared",
            "email": "Jared@piedpiper.com",
            "profile": "Admin",
            "createdAt": "2022-07-31T18:57:24.798Z",
            "updatedAt": "2022-07-31T18:57:24.798Z",
            "__v": 0
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTkyOTc1MzEsImRhdGEiOnsiX2lkIjoiNjJlNmQwOTQ5NjRiMTcwYzhhNDQyYTdhIiwiYWN0aXZlIjp0cnVlLCJ1c2VyIjoiSmFyZWQiLCJlbWFpbCI6IkphcmVkQHBpZWRwaXBlci5jb20iLCJwcm9maWxlIjoiQWRtaW4iLCJjcmVhdGVkQXQiOiIyMDIyLTA3LTMxVDE4OjU3OjI0Ljc5OFoiLCJ1cGRhdGVkQXQiOiIyMDIyLTA3LTMxVDE4OjU3OjI0Ljc5OFoiLCJfX3YiOjB9LCJpYXQiOjE2NTkyOTM5MzF9.AkQ1yplY-Xv3dBiL5bd-W_-hOZuxcaUXuEsQMMKy49I"
    }
}
```

Toke must to be saved locally to use in every next request to check if user has o no permission to access some route

```javascript
myHeaders.append("Authorizathion", "Bearer <token here>");
```

**Methods and params**

This project is based on leganux project APIATO You can find more information at
<a href="https://www.npmjs.com/package/apiato"> APIATO NPM Page </a>

In APIed Piper you can use any of the following functions independently or simultaneously.

* POST: createOne (The way to create a new item in a collection)
* POST: createMany (The way to create multiple items in a collection)
* GET: getMany (Get multiple items from a collection)
* GET: getOneById (Get an item from the collection by ID)
* GET: getOneWhere (Get an item from the collection through a search)
* PUT: findUpdateOrCreate (Find an element, and edit it; In case of not finding it, create the new element in the
  collection)
* PUT: findUpdate (Find an item and edit it in a collection)
* PUT: updateById (Find an item by ID and edit it)
* DELETE: findIdAndDelete (Find an item by ID and delete it)

And this is not all within those functions and through parameters that can be sent mainly in the query of the URL you
can.

* Populate one or more fields
* Select the fields you want to return only
* Paginate an item
* Apply filters and searches (by objectID, value, and% LIKE%)
* Sort items and much more.

<hr>

### *POST:createOne

**Request Parameters**

* body(Object): The object will be stored in collection
* query(url): Could contain the next elements
    * populate(Object): Object that defines parameters will return populated
    * select(Object):Object that defines wich parameters return. Object must be transformed to url format

**Fetch request example**

```javascript
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "name": "Erlich Bachman",
    "age": 38,
    "location": "Palo Alto C.A."
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3000/api/employee/?select[name]=1&select[age]=1", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": {
    "_id": "60e14341b17c7b17a388e5a5",
    "name": "Erlich Bachman",
    "age": 38
  }
}
```

### *POST:createMany

**Request Parameters**

* body(Object): The array of objects will be stored in collection
* query(url): Could contain the next elements
    * populate(Object): Object that defines parameters will return populated
    * select(Object):Object that defines wich parameters return. Object must be transformed to url format

**Fetch request example**

```javascript
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify([{
    "name": "Erlich Bachman",
    "age": 38,
    "location": "Palo Alto C.A."
}, {
    "name": "Dinesh",
    "age": 28,
    "location": "Palo Alto C.A."
}]);

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3000/api/employee/?select[name]=1&select[age]=1", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": [
    {
      "name": "Erlich Bachman",
      "age": 38,
      "location": "Palo Alto C.A."
    },
    {
      "name": "Dinesh",
      "age": 28,
      "location": "Palo Alto C.A."
    }
  ]
}

```

### *GET:getMany

**Request Parameters**

* query(url): Could contain the next elements
    * populate(Object): Object that defines parameters will return populated
    * select(Object):Object that defines wich parameters return. Object must be transformed to url format
    * sort(Object):Object that defines the fields will be used for order results 'DESC' for descending or 'ASC'
      ascending
    * paginate(Object):Object with 2 properties 'page' and limit, defines the number of results to return and page
    * where(Object):Object filter to exactly match in find query for values
    * whereObject(Object):Object filter to exactly match in find query for mongoose objectIDs
    * like(Object):Object filter to regex match in find query for values %LIKE% equivalent

**Fetch request example**

```javascript
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};

fetch("http://localhost:3000/api/employee/?paginate[page]=2&paginate[limit]=3&sort[name]=ASC&select[name]=1", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": [
    {
      "_id": "60e0f5ef37eb110f8c2b5768",
      "name": "Dinesh Chugtai"
    },
    {
      "_id": "60e0f63a6d6d6e0f8f016e11",
      "name": "Dinesh Chugtai"
    },
    {
      "_id": "60e0f6c5435a9b0f904c347b",
      "name": "Dinesh Chugtai"
    }
  ]
}

```

### *GET:getOneWhere

**Request Parameters**

* query(url): Could contain the next elements
    * populate(Object): Object that defines parameters will return populated
    * select(Object):Object that defines wich parameters return. Object must be transformed to url format
    * sort(Object):Object that defines the fields will be used for order results 'DESC' for descending or 'ASC'
      ascending
    * where(Object):Object filter to exactly match in find query for values
    * whereObject(Object):Object filter to exactly match in find query for mongoose objectIDs
    * like(Object):Object filter to regex match in find query for values %LIKE% equivalent

**Fetch request example**

```javascript
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};

fetch("http://localhost:3000/api/employee/one?like[name]=Jared", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": {
    "_id": "60e0f6c5435a9b0f904c347c",
    "name": "Donald 'Jared' Dunn",
    "age": 24,
    "location": "Palo Alto C.A.",
    "__v": 0
  }
}

```

### *GET:getOneById

**Request Parameters**

* query(url): Could contain the next elements
    * populate(Object): Object that defines parameters will return populated
    * select(Object):Object that defines wich parameters return. Object must be transformed to url format

**Fetch request example**

```javascript
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};

fetch("http://localhost:3000/api/employee/60e0f5ef37eb110f8c2b5768", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": {
    "_id": "60e0f5ef37eb110f8c2b5768",
    "name": "Dinesh Chugtai",
    "age": 24,
    "location": "Palo Alto C.A.",
    "__v": 0
  }
}

```

### *PUT:findUpdateOrCreate

(Updates only first appearance by match, not updates many elements )

**Request Parameters**

* query(url): Could contain the next elements
    * populate(Object): Object that defines parameters will return populated
    * select(Object):Object that defines wich parameters return. Object must be transformed to url format
    * where(Object):Object filter to exactly match in find query for values
    * whereObject(Object):Object filter to exactly match in find query for mongoose objectIDs

**Fetch request example**

```javascript
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "name": "Erlich Bachmanity",
    "age": 40,
    "location": "Palo Alto C.A."
});

var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3000/api/employee/find_update_or_create?where[name]=Erlich Bachmanity", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": {
    "_id": "60e243c82b4d320571d00639",
    "name": "Erlich Bachmanity",
    "age": 40,
    "location": "Palo Alto C.A.",
    "__v": 0
  }
}

```

### *PUT:findUpdate

(Updates only first appearance by match, not updates many elements )

**Request Parameters**

* query(url): Could contain the next elements
    * populate(Object): Object that defines parameters will return populated
    * select(Object):Object that defines wich parameters return. Object must be transformed to url format
    * where(Object):Object filter to exactly match in find query for values
    * whereObject(Object):Object filter to exactly match in find query for mongoose objectIDs
    * like(Object):Object filter to regex match in find query for values %LIKE% equivalent

**Fetch request example**

```javascript
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "name": "Erlich BachmanityX",
    "age": 40,
    "location": "Palo Alto C.A."
});

var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3000/api/employee/find_where_and_update?where[name]=Erlich Bachmanity", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": {
    "_id": "60e243c82b4d320571d00639",
    "name": "Erlich BachmanityX",
    "age": 40,
    "location": "Palo Alto C.A.",
    "__v": 0
  }
}
```

### *PUT:updateById

**Request Parameters**

* query(url): Could contain the next elements
    * populate(Object): Object that defines parameters will return populated
    * select(Object):Object that defines wich parameters return. Object must be transformed to url format

**Fetch request example**

```javascript
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "name": "Erlich Bachman!!",
    "age": 50,
    "location": "Huston TX"
});

var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3000/api/employee/60e243c82b4d320571d00639", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": {
    "_id": "60e243c82b4d320571d00639",
    "name": "Erlich Bachman!!",
    "age": 50,
    "location": "Huston TX",
    "__v": 0
  }
}
```

### *DELETE:findIdAndDelete

**Fetch request example**

```javascript
var requestOptions = {
    method: 'DELETE',
    redirect: 'follow'
};

fetch("http://localhost:3000/api/employee/60e243c82b4d320571d00639", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": {
    "_id": "60e243c82b4d320571d00639",
    "name": "Erlich Bachman!!",
    "age": 50,
    "location": "Huston TX",
    "__v": 0
  }
}
```

## Responses examples

**Success**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": {
    "_id": "60e243c82b4d320571d00639",
    "name": "Erlich Bachman!!",
    "age": 50,
    "location": "Huston TX",
    "__v": 0
  }
}
```

**Error**

```json
{
  "error": "404 not found",
  "success": false,
  "message": "404 not found",
  "code": 404,
  "data": {}
}
```

## Object request query URL example

**where**

```text
?where[name]=erick&where[age]=30
```

equal to

```javascript
let where = {
    name: 'erick',
    age: 30
}
```

**whereObject**

```text
?where[user_id]=60e243c82b4d320571d00639
```

equal to

```javascript
let whereObject = {
    user_id: ObjectId('60e243c82b4d320571d00639'),
}
```

**like**

```text
?like[name]=eri
```

equal to

```javascript
let like = {
    name: {$regex: 'eri', $options: 'i'},
}
```

**paginate**

```text
?paginate[page]=1&paginate[limit]=10
```

equal to

```javascript
let paginate = {
    page: 1,
    limit: 10
}
```

**sort**

```text
?sort[name]=DESC&sort[age]=ASC
```

equal to

```javascript
let sort = {
    name: "DESC",
    age: "ASC"
}
```

**select**

```text
?select[name]=1&select[age]=1&select[location]=0
```

equal to

```javascript
let select = {
    name: 1,
    age: 1,
    location: 0,
}
```

**populate**

```text
?populate[class]=1&populate[king]=1&populate[users]=0
```

equal to

```javascript
let populate = {
    class: 1,
    kind: 1,
    users: 0,
}
```

## EXTEND: Object methods example

**GET the ExpressJS Instance APP**

This is helpful if you want to add another functionality directly to instance app of express.

```javascript
let app = microService.getExpressInstanceApp()
/** you can use to add  some functionalities like this
 *
 app.use(<library or function>);*/

//example
app.use(upload());

```

**GET the Mongoose Instance, schemas, and models**

This is helpful if you want to add another functionality o for custom routes area, you can use models and schemas from
mongoose.

```javascript
let {mongooseInstance, schema, model} = microService.getMongooseInstanceApp()
/** you can use a model or schema like this
 schema.<modelName>
 model.<modelName>
 */

//example
let list = await model.kindOfClassmate.find()
```

**Custom Routes**

The custom routes helps you to generate your own routes, in the same way you create it directly in ExpressJS

```javascript
let custom = [
    {
        path: 'custom/route', // defines path will be consumed
        method: 'GET', // defines method
        function: async function (req, res) { // defines the rute function in expressjs format
            res.status(200).json({OK: 'ok'})
        },
        middleware: false // defines if this route uses the middleware or not
    },
]


let middleware_function_for_custom = async function (req, res, next) { //defines if custom routes has speccial middleware checker,
    next()
}

microService.addCustomRoutes(custom, middleware_function_for_custom)

```

**Extend - Log aggregator**

You can log remote microservices using Hooli logger, now client is included, yuo only need to call method,
for more information visit ( <a href="https://www.npmjs.com/package/hooli-logger-client" target="_blank"> Hooli
Logger</a> )

```javascript
let HooliServerUrl = 'https://myhostdomain.com:3333' //the remote URL for hooli logger 
let Name = "APIed-Piper" // the name of instance app

microService.addHooliLogger(HooliServerUrl, Name)
```

**Extend - Server Status**

Server status is helpfully to see some statistics about the server, easily, only execute method and visit the path STATS
to get about server info

```javascript
microService.publishServerStats()
```

visit your API stats url for example  http://mymicroservice/api/STATS

Response example

```json
{
  "success": true,
  "code": 200,
  "error": "",
  "message": "APIed-Piper server statistics",
  "data": {
    "model_counts": [
      {
        "name": "kindOfClassmate",
        "count": 0
      },
      {
        "name": "classmate",
        "count": 2
      },
      {
        "name": "classRoom",
        "count": 0
      }
    ],
    "cpu_usage": 10.09,
    "cpu_average": {
      "totalIdle": 16850430,
      "totalTick": 21947190,
      "avgIdle": 2106303.75,
      "avgTotal": 2743398.75
    },
    "cpu_free": 91.38,
    "cpu_count": 8,
    "osCmd_whoami": "angelerickcruzolivera\n",
    "drive_info": {
      "totalGb": "72.9",
      "usedGb": "14.4",
      "freeGb": "58.6",
      "usedPercentage": "19.7",
      "freePercentage": "80.3"
    },
    "drive_free": {
      "totalGb": "72.9",
      "freeGb": "58.6",
      "freePercentage": "80.3"
    },
    "drive_used": {
      "totalGb": "72.9",
      "usedGb": "14.4",
      "usedPercentage": "19.7"
    },
    "mem_used": {
      "totalMemMb": 16384,
      "usedMemMb": 11096.33
    },
    "mem_free": {
      "totalMemMb": 16384,
      "freeMemMb": 5284.53
    },
    "netstat_inout": "not supported",
    "os_info": "macOS 12.5",
    "os_uptime": 2745,
    "os_platform": "darwin",
    "os_ip": "192.168.68.107",
    "os_hostname": "LeganuxPC.local",
    "os_arch": "arm64"
  },
  "container_id": false
}
```

<hr>



<p align="center">
    <img src="https://leganux.net/web/wp-content/uploads/2020/01/circullogo.png" width="100" title="hover text">
    <br>
  APIed Piper is another project of  <a href="https://leganux.net">leganux.net</a> &copy; 2021 all rights reserved
    <br>
   This project is distributed under the MIT license. 

<br>
<br>
The logo and the name of APIed Piper is inspired by the name of PiedPiper, the fictional company of Richard Hendrikcs, a character from the HBO series, Silicon Valley. This inspiration was taken for fun purposes only. The original name and logo reserve their rights to their original creators. 
</p>



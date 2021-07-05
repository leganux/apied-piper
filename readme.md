# APIed Piper

A minute microservice API rest generator

<hr>
<br>
<p align="center">
  <img src="https://raw.githubusercontent.com/leganux/apied-pipper/main/apiedpiper.jpg" width="550" title="apied piper logo">
</p>


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
let microService = new piedPiper(definitionObject, 'mongodb://localhost:27017/piedpipper', 3000)

// satar the service
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

## Object methods example

**Options**

```javascript
let options = {
    "customValidationCode": 450, //default 435
    "customErrorCode": 600, //default 500
    "customNotFoundCode": 420, //default 404
    "mongooseOptions": {}, //bypass mongoose options

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



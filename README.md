# tracer
the server is running on port 3000
In this server code was implemented by the mongodb.
there is no need for create the external entities in database.the collections are automatically created when we execute the server file.
The database name is " mongodb://localhost/mytestl " this is the connection for the database "MYTESTL"
following are the collections .each collections are stored different data.


textstore -this is the collection to store all the captured data informations
login-is store the login details of the users
general-is store the public related informations
folders-is to store the folder realted informations
otp-store the otp number


Now i tell about each routes with respective functionalities
/auth/facebook/
this is the path for login via facebook
/auth/twitter/
this is the path for login via twitter
/auth/google/
this is the path for login via gmail
/auth/linkedin/
this is the path for login via linkedin


/sendotp
in this path send the otp to registered mobile number.
here phone number is the input

/verifyotp
this is verify the otp .if its correct then it allow to register.otherwise it send the error message.

/login
this is the login api its need the phone number or email and password as the input .once the login is success it send the token and redirect to hoem page
once the user login the user name is stored in all the collections


/sendlink
this is the api for send the  link to registed email id while the forget password module wil execute
the email is the input.

/forgetpassword
here the new password is set only by the clicking the email verfication link

/forlderrename
this is the api for rename the folder.
here token ,folder old name ,folder new name are all the inputs

/folderadd
it is the api for creating the new folder.when the folder is created the folder id is added to the textstore collections.
folder name is the input

/topfolderdisply
this the api for the display the most recent folder are created.

/folderdisplay
is display all the folders present inside the folders collections

/addcontent
In this api first check the folder choosed or not.that meant if the data are where to store.
if the folder is choosed the following things are inputs
folderID,link documents
if folder is not selected then the same inputs are entered in the general collections

/generaldisplay 
it disply the what are all the data inside the genaral folder 

/searchbyclick
this api for the display the all the data inside the particular folder.

/serachbybar
here keyword is the input.
in this keyword will search in the textstore data.



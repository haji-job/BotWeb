import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import rivescript from 'rivescript';
const app = express();
app.use(cors()); // Enable ALL CORS request
const port = 3001
app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(express.static('public'))


//npm i @replit/database
import Database from "@replit/database";
const db = new Database();
db.list().then(e => console.log(e));


//initialise les listes. peut etre serialisé grace à la db
let listeBrains=[] ; 
listeBrains.push({'name':"aiden"});
  listeBrains.push({'name':"bb"});
  listeBrains.push({'name':"tonton"});
listeBrains.push({"name":"standard"});

//initialise les chatbots pour les ajouter à la liste de bots
let username = "local-user";
let bot = new rivescript();
bot.loadFile("./public/brains/bb.rive").then(
  function(){
    bot.sortReplies();
  }
).catch(e => {console.log(e)});

let listeBots = [];
listeBots.push({'id':1,'name':'bot'+1,'status':'up','brain':'bb','bot':bot});

let bot2 = new rivescript();
bot2.loadFile("./public/brains/aiden.rive").then(
  function(){
    bot2.sortReplies();
  }
).catch(e => {console.log(e)});
listeBots.push({'id':2,'name':'bot'+2,'status':'up','brain':'aiden','bot':bot2})

let bot3 = new rivescript();
bot3.loadFile("./public/brains/tonton.rive").then(
  function(){
    bot3.sortReplies();
  }
).catch(e => {console.log(e)});
listeBots.push({'id':3,'name':'bot'+3,'status':'up','brain':'tonton','bot':bot3});

let listeBouches = [];
listeBouches.push({'id':1,'name':'bouche'+1,'botID':'none'});


//used to init the db the first time
/*
let listeDB = [];
for(let i=0;i < listeBots.length;i++){
  listeDB.push({'id':listeBots[i].id,'name':listeBots[i].name,'status':listeBots[i].status,'brain':listeBots[i].brain});
}
//save in the database the list of bots without the chatbot
await db.set("listeBots",listeDB);*/
console.log(await db.get("listeBots"));


function initLists(){
 db.get("listeBots").then(e =>  listeBots = e );
 db.get("listeBrains").then(e =>  listeBrains = e );
 db.get("listeBouches").then(e =>  listeBouches = e );
}

 function addBotDb(varbot){
  let liste = [];
  let temp ={'id':varbot.id,'name':varbot.name,'status':varbot.status,'brain':varbot.brain};
  console.log(temp);
  db.get("listeBots")
    .then(e =>{  liste = e;
                liste.push({temp});
               return db.set("listeBots",liste);
              })
    .catch(e => console.log(e)); 
}

function deleteBotDb(idbot){
  let liste = [];
  db.get("listeBots").then(e => {
    liste = e;
    console.log("liste",liste);
    liste.splice(liste.findIndex(b => b.id==idbot),1);
    return db.set("listeBots",liste);
  }).catch(err => console.log(err));
}
//these functions are not used, but could be to store the bot in case of a server shutdown




//a list of brains available to chatbots
app.get('/brains',(req,res)=>{
  res.status(200).json(listeBrains);
});

//section ------bouches --------
/* a list of mouths available to communicate with chatbots
this section include everything to create, destroy and use these mouths. */
app.get('/bouches',(req,res)=>{
  res.status(200).json(listeBouches);
});


app.post('/bouche/:id',(req,res)=>{
  let id = req.params.id;
  let question = req.body.question;
  let login = req.body.login;
  let botID = listeBouches.find(e => e.id==id).botID;
  if(botID !=='none'){
    listeBots.find(e => e.id==botID).bot.reply(login,question).then(function(reply) {
    console.log("The bot says: " + reply);
   res.status(201).send(reply);
    }).catch(e => {console.log(e)});
  }
  else{
     res.status(404).send("this mouth is not linked");
  }
  
});


app.get('/bouche/:id',(req,res)=>{ 
  let id = req.params.id;
  if(listeBots.find(e => e.id==id)){
    let e = listeBots.find(e => e.id==id).bot;
    res.send(template("bouche",id));
  }
  else{
    res.status(404).send('not found');
  }
});


app.post('/bouches', function(req,res) { 
  listeBouches.sort(function(a, b) {
  // Compare the 2 id
  if (a.id <b.id) return -1;
  if (a.id >b.id) return 1;
  return 0;
});
  let newid= (listeBouches[listeBouches.length-1].id);
  newid++;
  listeBouches.push({'id':newid,'name':req.body.name,'botID':'none'});
  res.status(201).send("done");
});


app.delete('/bouche/:id',(req,res)=>{
  let id = req.params.id; 
try{ listeBouches.splice(listeBouches.findIndex(e=>e.id==id),1);
res.status(201).send("done");
}
catch(e){
  console.log(e);
  res.status(404).send("not found");
}
});


app.put('/bouche/:id', function(req,res) { 
  let id = req.params.id;
    let botid = req.body.botID;
  if(listeBouches.find(e=>e.id==req.params.id)){
    listeBouches.find(e=>e.id==req.params.id).botID=botid;
    if(botid !=='none'){
    listeBots.find(e=>e.id==botid).status='linked';
  }
    else{
    listeBots.find(e=>e.id==botid).status='unlinked';
    }
  }
});
//-------------fin section bouches --------------

// ------------ section chatbots -----------------
//this gives a list of bots and an URL to test if they work (called mouths).
app.get('/bots',(req,res)=>{
  let reponseListe = [];
  listeBots.forEach(e => reponseListe.push({'id':e.id,'name':e.name,'status':e.status,'brain':e.brain,'url':'https://BotWeb.hajijob.repl.co/'+e.id+'/mouth'}));
  res.status(200).json(reponseListe);
});

//landing page to show how a chatbot works. 
app.get('/', (req, res)=>{
	try{
		res.sendFile('index.html', { root: '.' })

	}
	catch(err){
		console.log(`Error ${err} thrown`);
		res.status(404).send('NOT FOUND');
	}
});

//this is used as interface to talk with chatbot
const template = (name,text) => {
return `
 <!DOCTYPE html>
 <html>
   <head>
    <title>chatbot</title>
<script type="text/javascript" src="../test.js"></script>
<script>
function login(){
  let login = prompt("Please enter your name:", "coucou");
let elt = document.getElementById("login");
elt.value = login;
}
</script>
</head>

<body onload="login()">

	<h1>${name} ${text}</h1>
<input type="hidden" id="login"></input>

	<p>
		say: <input id="user_input" />
		<button id="submit" onclick=${name}(${text})>submit</button>
	</p>

	<p>
		reply: <span id="output"></span>
	</p>

  <img src='../business.jpg'></img>

</body>

</html>`;
}

//this is an exemple of how you can load the brain of a chatbot into another. could be used to load new files on the fly 

/*
app.get('/test', function(req, res) {
  listeBots.find(e=> e.id==2).bot.stream(listeBots.find(e=>e.id==1).bot.stringify());
  listeBots.find(e=> e.id==1).bot.sortReplies();
 // listeBots.find(e=>e.id==1).bot.write("./test1.rive");
  res.status(200).send("ok");
});*/

//show the content of the brain of a chatbot
app.get('/:id', function(req, res) {
     let id = req.params.id;
  if(listeBots.find(e => e.id==id)){
    res.status(200).send(listeBots.find(e => e.id==id).bot.stringify());
  }
  else{
    res.status(404).send("not found");
  }
});

//show the users variables of a chatbot. could be used to store profile and get loaded back with setUservars()
app.get('/:id/data', function(req, res) {  try{listeBots.find(e=> e.id==req.params.id).bot.getUservars().then(e => {
  res.status(200).send(e);
}).catch(e => console.log(e)); }catch(e){
   console.log(e);                                        res.status(404).send("not found");}
  
});

//exemple of mouth to test a chatbot. Could be removed if you only want users to access a chatbot through the mouths listed in bouches.html
app.get('/:id/mouth', function(req, res) {
     let id = req.params.id;
  if(listeBots.find(e => e.id==id)){
    let e = listeBots.find(e => e.id==id).bot;
    res.send(template("chat",id));
  }
  else{
    res.status(404).send('not found');
  }
});


//create new bot
app.post("/", function(req, res) {
  listeBots.sort(function(a, b) {
  // Compare the 2 id
  if (a.id <b.id) return -1;
  if (a.id >b.id) return 1;
  return 0;
});
  let newid= listeBots[listeBots.length-1].id;
    newid++;
    if(!(listeBots.find(e=>e.id==newid))){
   let temp = new rivescript(); 
      let brain = "standard";
      temp.loadFile("./public/brains/"+brain+".rive").then(
  function(){
    temp.sortReplies();
  }
).catch(e => {console.log(e)});
listeBots.push({'id':newid,'name':req.body.name,'status':req.body.status,'brain':brain,'bot':temp}).catch(e => {console.log(e)});
    }
});

//ask for a reply from a bot
app.post('/:id', function(req, res) {
  let id = req.params.id;
  let question = req.body.question;
  let login = req.body.login;
  console.log(id);
  console.log(question);
  listeBots.find(e => e.id==id).bot.reply(login,question).then(function(reply) {
    console.log("The bot says: " + reply);
   res.status(201).send(reply);
    }).catch(e => {console.log(e)});
  
});


app.put('/:id', function(req,res) { 
  let id = req.params.id;
    let brain = req.body.brain;
  if(listeBots.find(e=>e.id==req.params.id)){
    
   let bot = listeBots.find(e=>e.id==id); listeBots.splice(listeBots.findIndex(e=>e.id==id),1);
   
    let temp = new rivescript();
    temp.loadFile("./public/brains/"+brain+".rive").then(function(){
    temp.sortReplies();
    });
    listeBots.push({'id':id,'name':bot.name,'status':bot.status,'brain':brain,'bot':temp});
    res.status(201).send(reply);
  }
  res.status(404).send("not found");
});


app.delete('/:id', function(req, res) {
  let id = req.params.id;
  listeBots.splice(listeBots.findIndex(e=>e.id==id),1);
});


app.patch('/:id', function(req, res) {

  if((listeBots.find(e=>e.id==req.params.id))){
    listeBots.find(e=>e.id==req.params.id).name=req.body.name;
    listeBots.find(e=>e.id==req.params.id).status=req.body.status;
    if(req.body.status ==='unlinked'){
     while(listeBouches.find(e=>e.botID==req.params.id)){listeBouches.find(e=>e.botID==req.params.id).botID='none';} 
    }
    res.status(200).send("ok");
}
  else{
    res.status(404).send("not found")
  }
});


app.listen(port, () => {
  		console.log(`Example app listening at http://localhost:${port}`)
	});


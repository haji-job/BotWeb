import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {Low, JSONFile} from 'lowdb';

const app = express();
app.use(cors()); // Enable ALL CORS request
const port = 3001

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(express.static('public'))

const adapter = new JSONFile("./model/db.json");
let db = new Low(adapter);
await db.read();
db.data = db.data || { Mouths: [] };


//End point to get all the tasks
app.get('/', (req, res)=>{
	try{
    let json_var = {'test':'oui'};
		res.sendFile('index.html', { root: '.' })

	}
	catch(err){
		console.log(`Error ${err} thrown`);
		res.status(404).send('NOT FOUND');
	}
});

const template = (text) => {
return `
 <!DOCTYPE html>
 <html>
   <head>
    <title>chatbot</title>
 <script type="text/javascript" src="https://unpkg.com/rivescript@latest/dist/rivescript.min.js"></script>
<script type="text/javascript" src="./test.js"></script>
</head>

<body>

	<h1>${text}</h1>

	<p>
		say: <input id="user_input" />
		<button id="submit" onclick=chat()>submit</button>
	</p>

	<p>
		reply: <span id="output"></span>
	</p>

  <img src='./chat.jpeg'></img>

</body>

</html>`;
}

app.get('/:id', function(req, res) {
  let id = req.params.id;
  res.send(template('chatbot '+id));
});

app.listen(port, () => {
  		console.log(`Example app listening at http://localhost:${port}`)
	});
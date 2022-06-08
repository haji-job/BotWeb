function chat(id) {
    let input = document.getElementById("user_input").value;
let login = document.getElementById("login").value;
  
    let myHeaders = new Headers();
			myHeaders.append('Content-Type', 'application/json');
			let payload = {
                login:login,
           			question:input
           	};
			let myBody = JSON.stringify(payload);
    console.log(myBody);
			let myInit = {
				method: 'POST',
           		headers: myHeaders,
           		mode: 'cors',
           		cache: 'default',
           		body:myBody
        	};
      let myURL = "https://BotWeb.hajijob.repl.co/"+id;
        	//launch the request
			fetch(myURL,myInit)
			.then((httpResponse)=>{
				return httpResponse.text();
			})
			.then((responseBody)=>{
        let botreponse = document.getElementById("output");
        botreponse.innerHTML = responseBody;
			})
			.catch((err)=>{
				console.log(`ERROR : ${err}`);
			});
		}

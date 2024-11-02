/*const express = require('express')
const sls = require('serverless-http')
const app = express()
app.get('/', async (req, res, next) => {
  res.status(200).send('Hello World!')
})*/
module.exports.handler = async (event, context) =>  {	  
	
	
	let  response= {
		    statusCode: 200,
		    body: JSON.stringify({
		      message: `Page ! requested in process ...`,
		      }),
		   }
	console.log("this time it works " );
	return response;
}
							 
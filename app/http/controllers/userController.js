'user strict'

const { MongoUserService } = require("../services/MongoUserService");
const User = require("../models/User");

require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});

var userController = {

    getUserInfo: async(request, response) => {
		try {
			
			let id = request.headers.tokenDecoded.data.id;
			console.log(id);
			
			let user = await MongoUserService.getFullUser(id);
        
			console.log(user);
        
			response.json({ user });
		
		} catch (e) {
			console.log(e);
			response.json({ error: e});
		}
    },
   

}

module.exports = userController;

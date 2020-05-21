'user strict'

const User = require("../models/User");

const userController = {

	lastUser: async(request) => {

		try{
			let user = await User.findOne({}, {}, { sort: { 'createdAt' : -1 } });
			return user;
		}
		catch(error){
			console.error(error);
		}

	},
	show: async(request, response) => {
		let id = request.params.id || request.headers.tokenDecoded.data.id;

        try{
            let user = await User.findById(id);

            return response.json({ 
                code: 200,
                user: user 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener un usuario",
                error: error
            });
        }
	},
	update: async(request, response) => {
        let id = request.params.id;

        try{
            let userUpdated = await User.findByIdAndUpdate(id, request.body);

            return response.json({ 
                code: 200,
                msg: "Usuario actualizado exitosamente",
                userUpdated: userUpdated 
            });
        } 
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar un usuario",
                error: error
            });
        }
    },

}

module.exports = userController;

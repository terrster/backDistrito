'user strict'

const User = require("../models/User");

const userController = {

	lastUser: async(request) => {
		try{
			let user = await User.findOne({}, {}, { sort: { 'createdAt' : -1 } });
			return user;
		}
		catch(error){
			return {
                code: 500,
                msg: "Algo salió mal tratando de obtener el último usuario",
                error: error
            };
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
            let user = await User.findByIdAndUpdate(id, request.body, (error, userUpdated) => {
                return userUpdated;
            });

            return response.json({ 
                code: 200,
                msg: "Usuario actualizado exitosamente",
                user: user
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

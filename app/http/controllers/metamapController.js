
const metamapController = {

    inicio : async (request, response) => {
        console.log("Inicio");
        // console.log(request);
        if(request.body.metadata.hasOwnProperty('canal')){
            console.log("Canal");
            let body = request.body;
            let event = request.body.event;
            let uid = request.body.metadata.uid; 
            console.log("UID: " + uid);
            global.io.emitToSocket(uid, "connect", "conectado");
            global.io.emitToSocket(uid, "new-document", body);
            console.log(body);
        }

        return response.json({
            msg: "Inicio"
        });
    },
    consulta : async (request, response) => {
        console.log("Consulta");
        console.log(request.headers);
        console.log(request.ip);
        console.log(request.headers['x-forwarded-for']);
        console.log(request.body);
        return response.json({
            msg: "Consulta"
        });
    }
}

module.exports = metamapController;
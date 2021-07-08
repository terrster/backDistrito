'use strict'

// const mailManager = require("./mailManager");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

const hubspotInfoPath = path.resolve('config/hubspotInfo.json'); 

const realTimeManager = {
    hubspotInfo: async(request, response) => {
        // let notificationTI = await mailManager.sendToTI({
        //     to: "miguelwayas@distritopyme.com",
        //     subject: "Notificación de servicio en tiempo real",
        //     message: JSON.stringify(request.body)
        // });
        
        // return response.json(notificationTI);
        try{
            let data = request.body;
            let user = await User.findOne().sort({ _id: -1 });
            data.Solicitudes = user.idDistrito;

            if(fs.existsSync(hubspotInfoPath)){
                let hubpostInfo = JSON.parse(fs.readFileSync(hubspotInfoPath));
                let difference = [];
                
                Object.keys(hubpostInfo).map((key) => {
                    if(data[key] != hubpostInfo[key]){
                        difference.push(key);
                    }
                });

                if(difference.length){
                    fs.writeFileSync(hubspotInfoPath, 
                        JSON.stringify(data)
                    );

                    global.io.emitToAll("hubspotInfo", {
                        data,
                        difference
                    });

                    return response.json({ 
                        code: 200,
                        msg: "Información de Hubspot actualizada en tiempo real exitosamente"
                    });
                }

                return response.json({ 
                    code: 200,
                    msg: "No hay nueva información de Hubspot que actualizar"
                });
            }
            else{
                fs.appendFileSync(hubspotInfoPath, 
                    JSON.stringify(data)
                );

                global.io.emitToAll("hubspotInfo", {
                    data,
                    difference: []
                });

                return response.json({ 
                    code: 200,
                    msg: "Información de Hubspot actualizada en tiempo real exitosamente"
                });
            }
        }
        catch(error){
            console.log(error);
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de actualizar la información de Hubspot en tiempo real"
            });
        }
    },
    getHubpostInfo: (_, response) => {
        try{
            if(fs.existsSync(hubspotInfoPath)){
                let hubpostInfo = JSON.parse(fs.readFileSync(hubspotInfoPath));

                return response.json({ 
                    code: 200,
                    hubpostInfo
                });
            }
            else{
                return response.json({ 
                    code: 404,
                    msg: "No existe información de Hubspot en tiempo real"
                });
            }
        }
        catch(error){
            console.log(error);
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener la información de Hubspot en tiempo real"
            });
        }
    }
}

module.exports = realTimeManager;
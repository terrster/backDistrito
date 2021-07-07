'use strict'

const mailManager = require("./mailManager");

const realTimeManager = {
    hubspotInfo: async(request, response) => {
        let notificationTI = await mailManager.sendToTI({
            to: "miguelwayas@distritopyme.com",
            subject: "Notificación de servicio en tiempo real",
            message: request
        });
        console.log(request);
        return response.json(notificationTI);
    }
}

module.exports = realTimeManager;
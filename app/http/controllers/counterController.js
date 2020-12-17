'use strict'

const fs = require("fs");
const path = require("path");

const counterPath = path.resolve('config/counter.json'); 

const incrementCounter = (type) => {
    let counter = JSON.parse(fs.readFileSync(counterPath));

    switch(type){
        case 'visit':
            counter.visits += 1;
        break;
        case 'simulator':
            counter.simulations += 1;
        break;
    }

    fs.writeFileSync(counterPath, 
        JSON.stringify(counter)
    );
}

const counterController = {
    add: (request, response) => {
        let type = request.params.type;

        try{
            if(fs.existsSync(counterPath)){
                incrementCounter(type);
            }
            else{
                fs.appendFileSync(counterPath, 
                    JSON.stringify({
                        visits: 0,
                        simulations: 0
                    })
                );

                incrementCounter(type);
            }

            return response.json({ 
                code: 200,
                msg: "Contador incrementado"
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de incrementar el contador",
                error
            });
        }
    },
    total: (request, response) => {
        try{
            let counter = JSON.parse(fs.readFileSync(counterPath));

            return response.json({ 
                code: 200,
                counter
            });
        }
        catch(error){
            return response.json({
                code: 500,
                msg: "Algo salió mal tratando de obtener la información del contador",
                error: error
            });
        }
    }
}

module.exports = counterController;

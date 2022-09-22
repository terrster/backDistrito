const User = require("../models/User");
const Documents = require("../models/Documents");

const updateDataController = {
    updateData: async (request, response) => {
        const nameAux = (value) => {
            let nameDoc = "";
            if (value.name === undefined) {
              let aux = value.split("-");
              for (let i = 6; i < aux.length; i++) {
                nameDoc += aux[i];
              }
              if (nameDoc === "") {
                for (let i = 5; i < aux.length; i++) {
                  nameDoc += aux[i];
                }
              }
            } else {
              let aux = value.name.replace(" ", "");
              nameDoc = aux;
            }
            return nameDoc;
          };
        try {
            let { id } = request.body;
            try {
                let user = await User.findById(id);
                if(user){
                    // await User.findByIdAndUpdate(id, {
                    //     __v : 0
                    // });
                    let idDoc = user.idClient.appliance[0].idDocuments
                    if(idDoc.__v !== 0){
                        console.log("idDoc.__v: " + idDoc.__v);
                        return response.status(200).json({
                            msg: "Ya se ha actualizado la información"
                        });
                    }
                    let doc = [
                        "oficialID",
                        "proofAddress",
                        "bankStatements",
                        "constitutiveAct",
                        "otherActs",
                        "financialStatements",
                        "rfc",
                        "lastDeclarations",
                        "acomplishOpinion",
                        "facturacion",
                        "others",
                        "cventerprise",
                        "proofAddressMainFounders",
                        "collectionReportSaleTerminals",
                        "localContractLease"
                    ]
                    let params = {
                        __v: 1
                    };
                    for(let key in idDoc){
                        if(doc.indexOf(key) !== -1){
                            let value = idDoc[key];
                            let url ="";
                            let name = "";
                            let newValues = [];
                            let status = false;
                            if(value.length >= 0){
                                for(let i = 0; i < value.length; i++){
                                    url = value[i].url ? value[i].url.url : value[i];
                                    name = nameAux(value[i]);
                                    value[i].status? status = status : status = true;
                                    newValues.push({url, name, status});
                                }
                                idDoc[key] = newValues;
                                params[key] = newValues;
                            }
                        }
                    }
                    await Documents.findByIdAndUpdate(idDoc._id, params);
                    let userUpdate = await User.findById(id);
                    return response.status(200).json({
                        msg: "Usuario encontrado",
                        user : userUpdate
                    });
                }
            } catch (error) {
                console.log(error);
                return response.status(500).json({
                    msg: "Error al buscar el cliente"
                });
            }
        } catch (error) {
            console.log(error);
            return response.status(500).json({
                msg: "Error al buscar el cliente"
            });
        }
    }
}

module.exports = updateDataController;
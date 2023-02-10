const Control = require("../models/Control");
const Consultas = require("../models/Consultas");
const Buro = require("../models/Buro");
const hubspotController = require("../controllers/hubspotController");
const Client = require("../models/Client");

const dataController = {
    async getControl(req, res) {
        try {
            let Prospector = await Control.findOne({name : "Prospector"});
            let Moral = await Control.findOne({ name: "Reporte Moral" });
            let Buro = await Control.findOne({ name: "Reporte Persona Fisica" });

            if (!Prospector) {
                const newControl = new Control({
                    name: "Prospector",
                    unykoo: false,
                    userBuro: "123",
                    passwordBuro: "456",
                });
                await newControl.save();
                Prospector = await Control.findOne({ name: "Prospector" });
            }

            if (!Moral) {
                const newControl = new Control({
                    name: "Reporte Moral",
                    unykoo: false,
                    userBuro: "123",
                    passwordBuro: "456",
                });
                await newControl.save();
                Moral = await Control.findOne({ name: "Reporte Moral" });
            }

            if (!Buro) {
                const newControl = new Control({
                    name: "Reporte Persona Fisica",
                    unykoo: false,
                    userBuro: "456",
                    passwordBuro: "789",
                });
                await newControl.save();
                Buro = await Control.findOne({ name: "Reporte Persona Fisica" });
            }
            let controlMap = [Prospector, Moral, Buro];

            res.json(controlMap);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateControl(req, res) {
        let { password, user, name } = req.body;
        try {
            const control = await Control.findOneAndUpdate(
                { name: name },
                { $set: { passwordBuro : password, userBuro: user } },
                { new: true }
            );
            console.log("se actualizo", control);
            res.json(control);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
    async getConsultas(req, res) {
        try {
            await Consultas.find({}, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    let consultasMap = []
                    docs.forEach((consulta) => {
                        const {__v : _, ...consultaWithoutV} = consulta.toObject();
                        consultasMap.push(consultaWithoutV);
                    });
                    let reOrden = consultasMap.sort((a, b) => {
                        return b.folio - a.folio;
                    });

                    // console.log(reOrden);
                    res.json(consultasMap);
                }
            });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = dataController;


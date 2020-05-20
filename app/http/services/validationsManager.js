'use strict'

class validationsManager {

    user = (errors) => {
        let messages = {
            email: {
                unique: "El campo email debe de ser único"
            }
        }

        return this.extractor(errors, messages);
    }

    extractor = (errors, messages) => {
        let errmsgs = [];

        Object.keys(errors).forEach((key) => {
            messages[key] ? 
            errmsgs.push(messages[key][errors[key].kind]) : 
            errmsgs.push("No se especificó un mensaje para "+key);
        });

        return errmsgs;
    }
}

module.exports = new validationsManager();
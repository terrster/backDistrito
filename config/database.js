'use strict'

const mongoose = require('mongoose');

class DB{
    constructor(){
        if(process.env.NODE_ENV === 'localhost'){
            if(process.env.USER_DB === '' && process.env.PASSWORD_DB === ''){
                this.destiny = `mongodb://${process.env.CLUSTER}/${process.env.DATABASE}`;
            }
            else if(process.env.CLUSTER !== "localhost:27017"){//localhost:27017
                this.destiny = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}${process.env.CLUSTER}/${process.env.DATABASE}?retryWrites=true&w=majority`;
            }
            else{
                this.destiny = `mongodb://${process.env.USER_DB}:${process.env.PASSWORD_DB}@${process.env.CLUSTER}/${process.env.DATABASE}`;
            }
        }
        else{
            this.destiny = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}${process.env.CLUSTER}/${process.env.DATABASE}?retryWrites=true&w=majority`;
        }
    }

    async connect(){
        try{
            await mongoose.connect(this.destiny, {
                useCreateIndex: true,    
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            });

            console.log("Database is connected successfully");
        }
        catch(error){
            // console.log(error);
            console.log("Something went wrong trying to establish a connection with the database :(");
        }
    }
}

module.exports = DB;
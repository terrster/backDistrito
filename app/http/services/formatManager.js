'use strict'

//Type bussiness

const PERSON_TYPE = {//type
    PF: 'Persona Física',
    RIF: 'RIF',
    PFAE: 'Persona Física con A.E.',
    PM: 'Persona Moral',
};

//Amount

const REASON = {//whyNeed 
    EXPANSION: "Expansión",
    NEWPROYECTS: "Nuevos proyectos",
    MERCHANDISE: "Comprar mercancía",
    PAYMENTS: "Pagos administrativos",
    REMODELING: "Remodelación",
    DEBT: "Consolidar deuda",
    EQUIPMENT: "Compra de equipo",
    OTHER: "Otro"
};

const TERM = {//term
    ASAP: "Cuanto antes",
    WAIT: "Puedo esperar"
};

const OLD = {//old
    LESS6: "Menos de 6 meses",
    ONE: "1 año",
    TWO: "2 años",
    THREE: "3 años",
    PFOUR: "4 años o más"
};

//Comercial info

const GYRE = {//gyre
	RETAILCOMMERCE: "Comercio Minorista",
	WHOLESALETRADE: "Comercio Mayorista",
	ELECTRONICCOMMERCE: "Comercio Electrónico",
	CONSTRUCTION : "Construcción",
	MANUFACTURE: "Manufactura",
	PROFESSIONALSERVICES: "Servicios Profesionales, Agencias, Consultoría, Despachos.",
	RESTAURANT: "Restaurante, Cafetería, Eventos.",
	MEDICALSERVICES: "Servicios Médicos, Salud, Hospitales, Laboratorios.",
	EDUCATIONALSERVICES: "Servicios Educativos",
	TECHONOLOGY: "Tecnología, Software, Servicios Web.",
	TRANSPORT: "Transporte, Logística, Mensajería.",
	PRIMARY: "Sector Primario (Agricultura, Ganadería, Pesca, Mineria, etc.)",
	OTROS : "Otros"
};

const WARRANTY = {
    1: "Inmobiliaria",
    2: "Activo fijo",
    3: "Ambos",
    4: "No"
};

const YES_NO_QUESTION = {
    true: "Sí",
    1: "Sí",
    2: "Sí",
    3: "Sí",
    4: "No",
    false: "No",
    0: "No"
};

const EMPRESARIAL_CREDIT_CARD = {
    1: "Sí",
    2: "Tarjeta crédito empresarial",
    0: "No"
};

//General info, DATOS PERSONALES

const CIVIL_STATUS = {//civilStatus
    SINGLE: "Soltero",   
    MARRIED: "Casado", 
    DIVORCED: "Divorciado", 
    WIDOWER: "Viudo", 
};

const AGE = (birthDate) => {
    let userDay = parseInt(birthDate.split("/")[0]);
    let userMonth = parseInt(birthDate.split("/")[1]);
    let userYear = parseInt(birthDate.split("/")[2]);

    let date = new Date();
    let currentDay = date.getDate();
    let currentMonth = date.getMonth() + 1;
    let currentYear = date.getFullYear();

    let age = currentYear - userYear;

    if(currentMonth < userMonth){
        age--;
    }

    if(currentMonth == userMonth && currentDay < userDay){
        age--;
    }

    return age;
}

const CAR_CREDIT = {//carCredit
    MORE4: "Hace 4 años o más",
    YES: "Sí",
    NO: "No"               
};

const RELATIVE = {//relative
    FAMILY: "Familiar",
    // FRIEND: "Amigo",
    CLIENT: "Cliente" ,
    PROVIDER: "Proveedor" 
};

module.exports = {
    PERSON_TYPE,
    REASON,
    TERM,
    OLD,
    GYRE,
    WARRANTY,
    YES_NO_QUESTION,
    EMPRESARIAL_CREDIT_CARD,
    CIVIL_STATUS,
    AGE,
    CAR_CREDIT,
    RELATIVE
};
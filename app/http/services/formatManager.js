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
    COMERCE: "Comercio",
    SERVICE: "Servicios",
    PRODUCTS: "Productos",
    CONSTRUCTION: "Construcción",
    PRIMARY: "Sector primario",
    OTROS: "Otro"
};

const WARRANTY = {
    1: "Sí",
    2: "Sí",
    3: "Sí",
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

//General info

const CIVIL_STATUS = {//civilStatus
    SINGLE: "Soltero",   
    MARRIED: "Casado", 
    DIVORCED: "Divorciado", 
    WIDOWER: "Viudo", 
};

const CAR_CREDIT = {//carCredit
    MORE4: "Hace 4 años o más",
    YES: "Sí",
    NO: "No"               
};

const RELATIVE = {//relative
    FAMILY: "Familiar",
    FRIEND: "Amigo",
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
    CIVIL_STATUS,
    CAR_CREDIT,
    RELATIVE
};
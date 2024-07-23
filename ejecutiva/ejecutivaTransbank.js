var tarjetas = {
    VI: "VISA",
    MC: "MASTERCARD",
    CA: "CABAL",
    CR: "CREDENCIAL",
    AX: "AMEX",
    CE: "CERRADA",
    DC: "DINNERS",
    TP: "PRESTO",
    MG: "MAGNA",
    TM: "MAS (CENCOSUD)",
    RP: "RIPLEY",
    EX: "EXTRA",
    TC: "CMR",
    DB: "REDCOMPRA"
    };
var responseCodesPos = {
    0: "Aprobado",
    1: "Rechazado",
    2: "Host no Responde",  
    3: "Conexión Fallo",    // pedir verificar cable de red -> 3
    4: "Transacción ya Fue Anulada", 
    5: "No existe Transacción para Anular",
    6: "Tarjeta no Soportada",
    7: "Transacción Cancelada desde el POS",
    8: "No puede Anular Transacción Débito",
    9: "Error Lectura Tarjeta",
    10: "Monto menor al mínimo permitido",
    11: "No existe venta",
    12: "Transacción No Soportada",
    13: "Debe ejecutar cierre",  
    14: "No hay Tono",
    15: "Archivo BITMAP.DAT no encontrado. Favor cargue", 
    16: "Error Formato Respuesta del HOST",   
    17: "Error en los 4 últimos dígitos.", 
    18: "Menú invalido",
    19: "ERROR_TARJ_DIST",   
    20: "Tarjeta Invalida",
    21: "Anulación. No Permitida",
    22: "TIMEOUT",          // timepo de espera  -> 22
    24: "Impresora Sin Papel",
    25: "Fecha Invalida",    // verifique la fechas -> 25
    26: "Debe Cargar Llaves", // cargar las llaves ->26
    27: "Debe Actualizar",    // solicitar actualizar el pos -> 27
    60: "Error en Número de Cuotas",  
    61: "Error en Armado de Solicitud",
    62: "Problema con el Pinpad interno", 
    65: "Error al Procesar la Respuesta del Host", 
    67: "Superó Número Máximo de Ventas, Debe Ejecutar Cierre", 
    68: "Error Genérico, Falla al Ingresar Montos",  
    70: "Error de formato Campo de Boleta MAX 6",
    71: "Error de Largo Campo de Impresión",
    72: "Error de Monto Venta, Debe ser Mayor que 0",
    73: "Terminal ID no configurado",
    74: "Debe Ejecutar CIERRE",
    75: "Comercio no tiene Tarjetas Configuradas",
    76: "Supero Número Máximo de Ventas, Debe Ejecutar CIERRE",
    77: "Debe Ejecutar Cierre",
    78: "Esperando Leer Tarjeta",
    79: "Solicitando Confirmar Monto",
    81: "Solicitando Ingreso de Clave",
    82: "Enviando transacción al Host",
    88: "Error Cantidad Cuotas",
    93: "Declinada",
    94: "Error al Procesar Respuesta",
    95: "Error al Imprimir TASA"
    };

/*
    Funciones Complementarias
*/
function showAlerts(text, tipeAlert, idContainerAlerts) {
    /*
    Solicita el contenedor de las alertas y la Clase de la alerta
        - Buscamos todas la alertas disponibles y las escondemos
        - buscamos en el contendor la alerta luego le agregamos el text y la dejamos visible
    */
    var containerAlert = document.getElementById(idContainerAlerts);
    var listAlert = ["alert-success","alert-danger","alert-warning"];

    // hide all the visible alerts
    listAlert.forEach((alertclasshide) => {
        var allAlertshide = document.querySelectorAll("."+alertclasshide);
        var alertSelecthide = Array.from(allAlertshide);
        alertSelecthide.forEach((elementohide)=>{
            elementohide.style.display = "none";
            
        });
    });
    //select one alert for show focus
    listAlert.forEach((alertclass) => {
        var allAlerts = containerAlert.querySelectorAll("."+alertclass);
        var alertSelect = Array.from(allAlerts);
        alertSelect.forEach((elemento)=>{
            if (elemento.className.includes(tipeAlert)){
                elemento.innerHTML = text;
                elemento.style.display = "inline-block";
                elemento.scrollIntoView({ behavior: 'smooth' });
            }else{
                elemento.style.display = "none";
            }
        });
    });
}
function validateNumberInput(dato, salida){
    /*
        Validamos que el campo sea numerico y no este nulo 
    */
    const regex = /^[0-9]*$/;
    let isNum = regex.test(dato);
    if (dato.length === 0){
        alert("- Ingrese el "+salida+".");
        return false;
    }
    if (isNum === false){
        alert("- Ingresar Solo Numeros en "+salida+".");
        return false;
    }
    return true;
}
function btn_disable(btn_id){
    document.getElementById(btn_id).disabled = true;
    document.getElementById(btn_id).innerHTML="Enviando...";
}
function btn_enable(btn_id,btn_name){
    let btn = document.getElementById(btn_id);
    btn.innerHTML= btn_name; 
    btn.disabled = false;
}
//hiden all div for class 
function hidenConteinerAlert({Status=true, Sale=true, Refund=true, Info=true, } = {}){ 
    let nameContainer = {"elementsAlertStatus":Status,"elementsAlertSale":Sale,"elementsAlertRefund":Refund,"elementsAlertInfo":Info};
    let ContainerAlert = document.querySelectorAll(".containerAlert");
    ContainerAlert.forEach((elementClass)=>{ 
        if(nameContainer[elementClass.id]){
            elementClass.style.display = "none";
        }else{
            elementClass.style.display = "inline-block";
        }
    });
}
//Cambio de tablas 
function hidenContainerTable({saleSuccess=true,salaDanger=true,saleWarning=true,refundSuccess=true, detailsSuccess=true, lastSaleSuccess=true}={}){
    let nameContainer = {"elementTableSuccess":saleSuccess,
                        "elementTableDanger":salaDanger,
                        "elementTableWarning":saleWarning,
                        "elementTableRefund":refundSuccess,
                        "elementTableDetalle":detailsSuccess,
                        "elementTableLastSale":lastSaleSuccess};
    let ContainerTable = document.querySelectorAll(".containerTable");
    ContainerTable.forEach((elementClass)=>{ 
        if(nameContainer[elementClass.id]){
            elementClass.style.display = "none";
        }else{
            elementClass.style.display = "block";
        }
    });
    

}
/*
    Funciones de Conexiones y desconexiones 
*/
// verificamos que el agente este desplegado y nos conectamos
async function ConnectAgent(){
    /*
    Generamos un consulta la la url para evaluar si el agente esta desplegado
        en caso de no encontrar el agente desplegado pasamos por el catch y generamos la alerta 
    */
    try{
        let isConnect = await Transbank.POS.isConnected;
        let response = await fetch("https://localhost:8090/");
        if (response){
            //console.log("online");
            if (isConnect != true){
                let connect = await Transbank.POS.connect();
                console.log("- Agente Conectado Correctamente."); 
            } else { 
                showAlerts("- Ya estas Conectado al Agente.","alert-warning","elementsAlertStatus");
            }
        } 
    } catch(error){
        //console.log("Offline");
        showAlerts("- El Agente no se encuentra Despeglado.","alert-danger","elementsAlertStatus");

    }    
}
// buscamos el puerto del pos y los conectamos 
async function ConnectTransbankPosOpenPort(){
    /*
    Evaluamos que la Seleccion del puerto no este vacio
    Ejecutamos la Función de Transbank openPort()
    */
    try{
        let SelectCom = document.getElementById("SelectCom");
        let isConnect = await Transbank.POS.isConnected;
        if (isConnect){
            console.log("Puerto seleccionado",SelectCom.value);
            let openPort = await Transbank.POS.openPort(SelectCom.value);  
            if (openPort){
                //No hay problemas al ejecutarse se guarda el puerto
                localStorage.setItem("PortCom",SelectCom.value );
                console.log("- Conectado con el POS.");   
                return true;
            }else {
                console.log("- No se  pudo establecer concexión con el POS."); 
                showAlerts("- No se  pudo establecer concexión con el POS.","alert-warning","elementsAlertStatus");
                hidenConteinerAlert({Status: false});
                return false;
            }
        } else { 
            return false;
        }
        
    } catch (error){
        console.log("-Error openPort: ",error);
        if (error === "Another connect command was already sent and it is still waiting"){
            showAlerts("Problemas de comunicación, Se recomienda reiniciar el Agente.","alert-danger","elementsAlertStatus");
        }else if(error.includes("not open serial")){
            showAlerts("Problemas de comunicación, Se recomienda reiniciar el Agente y/o Reconectar el 'POS'.","alert-danger","elementsAlertStatus");
        }else if(error.includes("ACK has not been received in 2000 ms")){
            showAlerts("No se pudo establecer conexión con el 'POS'. Verifique que el puerto sea el correspondiente." ,"alert-danger","elementsAlertStatus");
        }else{
            showAlerts("Problema en la comunicación, Reintente la operación","alert-danger","elementsAlertStatus");
        }
        hidenConteinerAlert({Status: false});
        await disconnectTransbankAgent();
        return false;
    }
}
// cerramos el puerto donde se conecto el POS
async function closePortTransbanck(){
    /* 
    Ejecutamos la Función de Transbank closePort()
        Retorna un Bool 
    */
    try{
        const isConnect = await Transbank.POS.isConnected;
        if(isConnect){
            let isPosConnect = await Transbank.POS.getPortStatus();
            if (isPosConnect === null){
                console.log(isPosConnect);
                return;
            }
            if (isPosConnect.connected === true){
                let closePort = await Transbank.POS.closePort();
                if (closePort === null){
                    console.log(closePort);
                    return;
                }
                if(closePort === true){
                    console.log("- Desconectado del POS Correctamente.");
                }else {
                    console.log("- Problemas en la Comunicación con el POS.");
                }
            }else {
                console.log("- No se encontro ningun POS conectado.");
            }
        }else {
            console.log("- No estas conectado al agente.");
        }
    }catch (error){
        console.log("- Close Port: "+ error);
        if("Cannot read" in error){
            console.log(error);
        }else{
            showAlerts("- "+error,"alert-danger","elementsAlertStatus");
        }
        return;
    }
}
// cerramos la conexión con el agente
async function disconnectTransbankAgent(){
    /*
    Ejecutamos la Función de Transbank disconnect()
        Retorna un Bool 
    */
    try{
        let isConnect = await Transbank.POS.isConnected;
        if(isConnect === true){
            const disconnect = await Transbank.POS.disconnect();
            if (disconnect != null){
                console.log("- Desconectado del Agente Correctamente.");
            } else {
                console.log("- Problemas en la Comunicación con el Agente.");
            }
        }else {
            console.log("- No se encontro ningun Agente conectado.");
        }
    } catch (error) {
        console.log("- disconnect agente: "+error);
    }
}  
//Cargar Select con los puertos disponibles
async function ConnectAgentChargeSelect(){
    /* 
    Ejecutamos la Función de Transbank getPorts()
        Retorna un objeto con todos los purtos COM disponibles.

    -----------------Detalle de los puertos COM--------------------------

        manufacturer = fabricante del dispositivos.
        vendorId =  Identifica al fabricante del dispositivo.
        productId = Identifica el modelo específico del dispositivo.

                     manufacturer = "INGENICO";
                     vendorId = "0B00";
                     productId = "0054";
                    
        Alta probabilidad de encontrar estas variables en los puertos COM
    -----------------------------------------------------------------------

    */
    try{
        let SelectCom = document.getElementById("SelectCom");
        let alloption = SelectCom.querySelectorAll("option");
        var PortCom = localStorage.getItem("PortCom");
        let isConnect = await Transbank.POS.isConnected;
        let response = await fetch("https://localhost:8090/");
      
        if (response){
            //console.log("online");
            if (isConnect != true){
                let connect = await Transbank.POS.connect();
                console.log("- Agente Conectado Correctamente."); 
                if(connect){
                    const PortSelect = await Transbank.POS.getPorts();
                    if (PortSelect.length != 0 ){
                        // eliminamos el contenido del select antes de recargar
                        for(let o=0; alloption.length > o ; o++){
                            if(alloption[o].val != ""){
                                alloption[o].remove();
                            }
                        }
                        let coincidencia = false; 
                        for(let i=0; i<PortSelect.length; i++){
                            let data_value = PortSelect[i];
                            const option = document.createElement("option");
                            if(PortCom === data_value["path"]){
                                //Si encontramos el mismo puerto en el localStoreg
                                //lo seleccionamos y no generamos él optionDisable 
                                option.selected = true;
                                coincidencia = true;
                            }
                            option.value = data_value["path"];
                            option.innerHTML = data_value["path"]+" - "+data_value["manufacturer"];
                            SelectCom.appendChild(option);
                        }
                        if (!coincidencia){
                            const optionDisable = document.createElement("option"); 
                            optionDisable.disabled = true;
                            optionDisable.innerHTML = "Seleccionar";
                            optionDisable.value= "";
                            optionDisable.selected = true;
                            SelectCom.prepend(optionDisable);
                        }
                    }else{
                        showAlerts("- No se encontraron dispositivos disponibles.","alert-danger","elementsAlertStatus");
                    }
                }else {
                    showAlerts("- No se pudo establecer conexión con el agente.","alert-warning","elementsAlertStatus");
                }
            } else { 
                showAlerts("- Ya estas Conectado al Agente.","alert-warning","elementsAlertStatus");
            }
        } 
    } catch(error){
        //console.log("Offline");
        console.log("- Error ChargeSelect: "+error);
        showAlerts("- El Agente no se encuentra Despeglado.","alert-danger","elementsAlertStatus");

    }finally{
        await disconnectTransbankAgent();
        console.log("finally function ConnectAgentSelectPort");
    }
    
}
//Funcion de cargar para que el poll genere el error 
async function ConnectAgentPortPoll() {
    /*
    Funcion para conectar y lance el error para el poll sin arrojar alertas
    */
    try{
        let isConnect = await Transbank.POS.isConnected;
        try{
            let response = await fetch("https://localhost:8090/");
            if (response){
                //console.log("online");
                if (isConnect != true){
                    let connect = await Transbank.POS.connect();
                    console.log("- Agente Conectado Correctamente."); 
                } else {
                    console.log("- Ya estas Conectado al Agente.");   
                }
            } 
        } catch(error){
            //console.log("Offline");
            console.log("- El Agente no se encuentra Despeglado.");
            return false;
        }    
        const statusport = await Transbank.POS.getPortStatus();
        if(statusport.connected){ 
            await closePortTransbanck();
        }
        const getPort = await Transbank.POS.getPorts();
        if (getPort.length != 0 ){
            let SelectCom = document.getElementById("SelectCom");
            let selectedOption = SelectCom.options[SelectCom.selectedIndex];
          
            let openPort = await Transbank.POS.openPort(selectedOption.value); 
            if(openPort){
                console.log("Puerto conectado con POS");
                return true;
            } else{
                console.log("No se pudo Conectar con el POS");
                return false;
           }
        }
    }catch(error){
        console.log("Connect Poll: ",error);
        if (error === "Another connect command was already sent and it is still waiting"){
            showAlerts("Problemas al Conectar, Se recomienda reiniciar el Agente.","alert-danger","elementsAlertStatus")
        }else if (error.includes("not open serial")){
            showAlerts("Problemas al Conectar el POS, Se recomienda reiniciar el Agente y Verificar el Puerto de Selección.","alert-danger","elementsAlertStatus")
        }
        await disconnectTransbankAgent();
        return false;
    }
    
}
/*
    Funciones de Transbank POS

    Las siguentes Funciones siguen este esquema de ejecucion 
    Conectarse al agente de Transbank
        - Preguntar si el puerto esta disponible
        (En caso de estar ocupado, Se ejecutara la funcion para cerrar y se volvera conectar para solventar problemas)
        Nos Conectamos al puerto donde esta el POS
            Ejecutamos la funcion correspondiente
            -Evaluamos estados de exito , falla y errores
        Finalizamos con la desconecion del puerto y del agente
*/
//anulacion de compra solo se puede con credito
async function refundTransbank(btn_id){
    /*
    Ejecutamos la Funcion  de Transbank refund(Numero de Operación)
        Evaluamos que el input no este null
        (Sólo pueden realizarse para transacciones con tarjeta de crédito y que aún se encuentren en la memoria del POS)

    */
    let btn_name = document.getElementById(btn_id).innerHTML;
    btn_disable(btn_id);
    let SelectCom = document.getElementById("SelectCom");
    if(SelectCom.value === ""){
        alert("¡Seleccione un puerto!. Antes de ejecutar cualquier función.");
        btn_enable(btn_id,btn_name);
        return;
    }
    let numberOperationPos = $("#numeroOperation").val();
    let isValueOperation = validateNumberInput(numberOperationPos , "Nº de Operación");
    if (!isValueOperation){
        btn_enable(btn_id,btn_name);
        return;
    }

    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        btn_enable(btn_id,btn_name);
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){
                btn_enable(btn_id,btn_name);
                return;
            }
        }else{
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){ 
                btn_enable(btn_id,btn_name);
                return;
            }
        }
    }
    try{
        let refundPos = await Transbank.POS.refund(numberOperationPos);
        if (refundPos !=null){
            if(refundPos.responseCode === 0){
                showAlerts("- Anulación: Aceptada","alert-success","elementsAlertRefund");
                hidenConteinerAlert({Refund:false});
                hidenContainerTable({refundSuccess:false});
        
                var table = document.getElementById("tableRefund");
                //antes de cargar la tabla eliminamos los elementos antiguos.
                deleteElementsTable('tableLastSale'); 
               
                let data_key = Object.keys(refundPos);
                let data_value = refundPos;
                //head 
                var thead = table.querySelector('thead');
                var state = thead.querySelector('tr');
                if (state === null){
                    console.log(data_value);
                    var iskeySharesNumber = "sharesNumber" in data_value;
                    console.log(iskeySharesNumber);
                    const row1 = document.createElement("tr");
                    for (let i = 0; i <data_key.length; i++) {
                        const th = document.createElement("th");
                        th.setAttribute("scope", "col");
                        let bandera = false;
                        let msj = "";
                        if(data_key[i] === "functionCode"){
                            msj = "Código de función";
                            bandera = true;
                        }else if(data_key[i] === "responseCode"){
                            msj = "código de respuesta";
                            bandera = true;
                        }else if(data_key[i] === "commerceCode"){
                            msj = "código de comercio";
                            bandera = true;
                        }else if(data_key[i] === "terminalId"){
                            msj = "identificador de terminal";
                            bandera = true;
                        }else if(data_key[i] === "responseMessage"){
                            msj = "mensaje de respuesta";
                            bandera = true;
                        }else if(data_key[i] === "successful"){
                            msj = "exitosa";
                            bandera = true;
                        }else if(data_key[i] === "ticket"){
                            msj = "boleto";
                            bandera = true;
                        }else if(data_key[i] === "amount"){
                            msj = "Monto";
                            bandera = true;
                        }else if(data_key[i] === "authorizationCode"){
                            msj = "Código de Autorización";
                            bandera = true;
                        }else if(data_key[i] === "realDate"){
                            msj = "Fecha";
                            bandera = true;
                        }else if(data_key[i] === "employeeId"){
                            msj = "ID de empleado";
                            bandera = true;
                        }else if(data_key[i] === "sharesNumber"){
                            msj = "Número de cuotas";
                            bandera = true;
                        }else if(data_key[i] === "sharesAmount"){
                            msj = "Monto de la cuota";
                            bandera = true;
                        }else if(data_key[i] === "last4Digits"){
                            msj = "Últimos 4 dígitos";
                            bandera = true;
                        }else if(data_key[i] === "operationNumber"){
                            msj = "número de operación";
                            bandera = true;
                        }else if(data_key[i] === "cardType"){
                            msj = "tipo de tarjeta";
                            bandera = true;
                        }else if(data_key[i] === "accountingDate"){
                            msj = "Fecha de contabilidad";
                            bandera = true;
                        }else if(data_key[i] === "cardBrand"){
                            msj = "Tarjeta";
                            bandera = true;
                        }else if(data_key[i] === "commerceProviderCode"){
                            msj = "Código de proveedor";
                            bandera = true;
                        }else if(data_key[i] === "accountNumber"){
                            msj = "número de cuenta";
                            bandera = true;
                        }else if(data_key[i] === "realTime"){
                            msj = "Hora";
                            bandera = true;
                        }
                        if (bandera === true){
                            const textth = document.createTextNode(msj);
                            th.appendChild(textth);
                            row1.appendChild(th);
                            bandera = false;
                        }
                    }
                    thead.appendChild(row1);
                }   
                //body 
                let tbody =  table.querySelector("tbody");
                let row2 = document.createElement("tr");
                for (let x = 0; x <data_key.length; x++) {
                    const td = document.createElement("td");
                    let bandera = false;
                    let msj = "";
                    if(data_key[x] === "functionCode"){
                        bandera = true;
                    }else if(data_key[x] === "responseCode"){
                        bandera = true;
                    }else if(data_key[x] === "commerceCode"){
                        bandera = true;
                    }else if(data_key[x] === "terminalId"){
                        bandera = true;
                    }else if(data_key[x] === "responseMessage"){
                        bandera = true;
                    }else if(data_key[x] === "successful"){
                        bandera = true;
                    }else if(data_key[x] === "ticket"){
                        bandera = true;
                    }else if(data_key[x] === "amount"){
                        bandera = true;
                    }else if(data_key[x] === "authorizationCode"){
                        bandera = true;
                    }else if(data_key[x] === "realDate"){
                        bandera = true;
                    }else if(data_key[x] === "employeeId"){
                        bandera = true;
                    }else if(data_key[x] === "sharesNumber"){
                        bandera = true;
                    }else if(data_key[x] === "sharesAmount"){
                        bandera = true;
                    }else if(data_key[x] === "last4Digits"){
                        bandera = true;
                    }else if(data_key[x] === "operationNumber"){
                        bandera = true;
                    }else if(data_key[x] === "cardType"){
                        bandera = true;
                    }else if(data_key[x] === "accountingDate"){
                        bandera = true;
                    }else if(data_key[x] === "cardBrand"){
                        bandera = true;
                    }else if(data_key[x] === "commerceProviderCode"){
                        bandera = true;
                    }else if(data_key[x] === "accountNumber"){
                        bandera = true;
                    }else if(data_key[x] === "realTime"){
                        bandera = true;
                    }
                    if(bandera === true){
                        let  data = "";
                        if (data_key[x] === "cardBrand"){
                            data = tarjetas[data_value[data_key[x]]];
                        } else if (data_key[x] === "cardType") {
                            // CR: Crédito  | DB: Débito
                            if (data_value[data_key[x]] === "CR"){
                                data = "Crédito";
                            }else{
                                data = "Débito";
                            }
                        } else if (data_key[x] === "realDate") {
                            const fechaString = data_value[data_key[x]];
                            // Divide el string en partes
                            const dia = fechaString.slice(0, 2);
                            const mes = fechaString.slice(2, 4);
                            const ano = fechaString.slice(4, 8);
        
                            // Devuelve el formato de fecha completo
                            data = `${dia}/${mes}/${ano}`;
        
                        } else if (data_key[x] === "realTime") {
                            const numeroString = data_value[data_key[x]];
                            // Divide el string en partes de dos caracteres
                            const horas = numeroString.slice(0, 2);
                            const minutos = numeroString.slice(2, 4);
                            const segundos = numeroString.slice(4, 6);
        
                            // Devuelve el formato de hora completo
                            data = `${horas}:${minutos}:${segundos}`;
                        }else if (data_key[x] === "accountingDate"){
                            //Se utiliza solo con ventas Débito (Opcional)
                            if (data_value["cardType"] === "DB"){
                                data = data_value[data_key[x]];
                            } else {
                                data = "--";
                            }
                        } else if (data_key[x] === "accountNumber"){
                            //Se utiliza solo con ventas Débito (Opcional)
                            if (data_value["cardType"] === "DB"){
                                data = data_value[data_key[x]];
                            } else{
                                data = "--";
                            }
                        }else if (data_key[x] === "sharesNumber"){
                            //Se utiliza solo con ventas Débito (Opcional)
                            if (data_value["cardType"] === "CR"){
                                data = data_value[data_key[x]];
                            } else {
                                data = "--";
                            }
                        } else if (data_key[x] === "sharesAmount"){
                            //Se utiliza solo con ventas Débito (Opcional)
                            if (data_value["cardType"] === "CR"){
                                data = data_value[data_key[x]];
                            } else{
                                data = "--";
                            }
                        }else {
                            data = data_value[data_key[x]];
                        }
                        const textNode = document.createTextNode(data);
                        td.appendChild(textNode);
                        row2.appendChild(td);
                        bandera = false;
                    }
                } 
                tbody.appendChild(row2);
            }else{
                tablaErrorsResponse(parseInt(refundPos.responseCode));
                // showAlerts("- Anulacion Denegada ","alert-danger","elementsAlertRefund");
            }
        } else{
            showAlerts("- La anulción no se pudo llevar acabo.","alert-warning","elementsAlertRefund");
        }
        btn_enable(btn_id,btn_name);
    }catch(error){
        console.log("-Error refund: "+error);
        if(error.includes("Cannot read")){
            console.log(error);
        }else{
            showAlerts("- "+error,"alert-warning","elementsAlertRefund");
        }

    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgent();
        console.log("Finally function RefundTransbank");
        btn_enable(btn_id,btn_name);
    }
}
// Cargamos llaves al pos para que este sincronizado con transbank
async function loadKeyTransbank(){
    /*
    Ejecutamos la Funcion  de Transbank loadKeys()
        Sincroniza el POS con los servidores de Transbank.
    */ 
    const isConnect =  await Transbank.POS.isConnected;
   if (isConnect){
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){return;}
        }else{
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){return;}
        }
    }  
    try {
        const loadKey = await Transbank.POS.loadKeys();
        if (loadKey != null ){
            if (loadKey["responseCode"] === 0){
                var msj = "";
                let data_key = Object.keys(loadKey); // Genera un array con las keys del diccionario
                for ( x=0 ; x < data_key.length; x++){
                    if (data_key[x] === "commerceCode"){
                        msj += "Código de comercio: "+loadKey[data_key[x]]+", ";
                    } else if(data_key[x] === "terminalId"){
                        msj += "Terminal ID ="+loadKey[data_key[x]]+".";
                    }
                }
                let out = "- Llaves Cargadas Exitosamente: "+msj;
                console.log(out);
            }else {
                console.log("- No se pudo Cargar las llaves.");
                tablaErrorsResponse(parseInt(loadKey["responseCode"]));
            }
        } else {
            console.log("- Problema al cargar llaves.");
            
        }
       
    } catch (error) {
        console.log("-Error loadkey: "+error);
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgent();
        console.log("finally function refundTransbank");
    }
}
// generamos el detales de ventas del día (se imprime en el pos)
async function GetDetailsTransbankPrint(btn_id){
    /*
        Ejecutamos la Funcion  de Transbank getDetails(bool)
            [bool == true (Genera el detalle en el POS en la boleta)] --> Arreglo vacio 
            [bool == false (Solo pide los datos que esten en la memoria del POS)] --> Arreglo con cada venta 
                En este Caso de uso bool == True 
                    Solo se Emitira la boleta en el POS 
    */
    let btn_name = document.getElementById(btn_id).innerHTML;
    btn_disable(btn_id);
    let SelectCom = document.getElementById("SelectCom");
    if(SelectCom.value === ""){
        alert("¡Seleccione un puerto!. Antes de ejecutar cualquier función.");
        btn_enable(btn_id,btn_name);
        return;
    }
    const isConnect =  await Transbank.POS.isConnected;
   if (isConnect){
        btn_enable(btn_id,btn_name);
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectPort = await Transbank.POS.getPortStatus();
        if(isConnectPort.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){
                btn_enable(btn_id,btn_name);
                return;
            }
        }else{
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){ 
                btn_enable(btn_id,btn_name);
                return;
            }
        }
    }
    try{
        const details = await Transbank.POS.getDetails(true);
        if (details === true) {
            // console.log("- Lista de ventas: Emitida en le POS.");
            showAlerts("- Lista de ventas: Emitida en le POS.","alert-success","elementsAlertInfo");
            hidenConteinerAlert({Info:true});
            hidenContainerTable();
        }else {
            // console.log("- No se pude generar el detalle de las ventas.");
            showAlerts("- No se pudo emitir el detalle de las ventas en el POS.","alert-warning","elementsAlertInfo");
            hidenConteinerAlert({Info:true});
            hidenContainerTable();
        }
        btn_enable(btn_id,btn_name);
    } catch (error) {
        console.log("- Error Detalle POS Print: "+error);
        if(error.includes("Cannot read")){
            console.log(error);
        }else {
            showAlerts("- Error Detalle POS: "+error ,"alert-danger","elementsAlertInfo");    
            hidenConteinerAlert({Info:true});
            hidenContainerTable();
        }
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgent();
        console.log("finally function GetDetailsTransbankPrint");
        btn_enable(btn_id,btn_name);
    }
}
// generamos la venta sacando
async function TransbankSale(btn_id){
    /* 
    Evaluamos que los input no esten en null y el monto sea numerico
    Efecutamos la funcion de Transbank doSale(monto, ticket)
        retorna 
            Un objeto con la conclusion del POS (Aprobada, denegada, error)
            En casos de no tener comunicación 
                Timeout: si la respuesta del POS nunca llego  generamos una tabla con monto, ticket, hora y fecha
    */
    var monto;
    var ticket;
    var fecha;
    var hora;

    let btn_name = document.getElementById(btn_id).innerHTML;
    btn_disable(btn_id);

    //validamos que los inputs no esten vacios
    let SelectCom = document.getElementById("SelectCom");
    let montoPos = $("#montoPos").val();
    let ticketPos = $("#ticketPos").val();
    if(SelectCom.value === ""){
        alert("¡Seleccione un puerto!. Antes de ejecutar cualquier función.");
        btn_enable(btn_id,btn_name);
        return;
    }
    let isValuemonto = validateNumberInput(montoPos , "Monto");
    if (!isValuemonto){
        btn_enable(btn_id,btn_name);
        return;
    }
    if (ticketPos.length === 0){
        alert("Ingrese el Ticket.");
        btn_enable(btn_id,btn_name);
        return;
    }
    // guardo los datos en caso de error de comunicacion 
    monto = montoPos;
    ticket = ticketPos;

    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        btn_enable(btn_id,btn_name);
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){
                btn_enable(btn_id,btn_name);
                return;
            }
        }else{
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){ 
                btn_enable(btn_id,btn_name);
                return;
            }
        }
    }
    try {
        // Convertir a números
        montoPos = parseInt(montoPos);
        // datos en caso de falla
        const date = new Date()
        fecha= date.toLocaleDateString();
        hora= date.toLocaleTimeString();

        let result = await Transbank.POS.doSale(montoPos,ticketPos);
        if (result.responseCode === 0){
            hidenContainerTable({saleSuccess:false});
            deleteElementsTable("tableExitosa");
            setTableExitosa(result); 
            // Entregamos una alerta 
            showAlerts("¡¡Venta Completada Exitosamente!!.","alert-success","elementsAlertSale");
            hidenConteinerAlert({Sale: false});
        }else {
    
            hidenContainerTable({salaDanger:false});
            deleteElementsTable("tableFallida");
            setTableFallida(result);
            showAlerts("¡Fallo al intentar la venta!.","alert-danger","elementsAlertSale");
            hidenConteinerAlert({Sale: false});
        }
        btn_enable(btn_id,btn_name);
    } catch (error) {
        console.log("- Ejecutar Venta: "+error);
        if(error.includes("Timeout")){
            console.log(error);
            showAlerts("Verifique si la venta fue Aceptada en la tabla de Ventas.","alert-danger","elementsAlertSale");
            await deleteElementsTable('tableWarning');
            let noResponse = {"Monto":monto, "Ticket":ticket,"Fecha":fecha, "Hora":hora};
            hidenContainerTable({saleWarning:false});
            let table = document.getElementById("tableWarning");
            var thead = table.querySelector('thead');
            var state = thead.querySelector('tr');
            let data_key = Object.keys(noResponse);
            if (state === null){
                const row1 = document.createElement("tr");
                for (let i = 0; i <data_key.length; i++) {
                    const th = document.createElement("th");
                    th.setAttribute("scope", "col");
                    const textth = document.createTextNode(data_key[i]);
                    th.appendChild(textth);
                    row1.appendChild(th);
                    row1.className = "table-warning";
                }
                thead.appendChild(row1);
            }
            //body
            var tbody = table.querySelector('tbody');
            let row2 = document.createElement("tr");
            for (let x = 0; x <data_key.length; x++) {
                const td = document.createElement("td");
                const textNode = document.createTextNode(noResponse[data_key[x]]);
                td.appendChild(textNode);
                row2.className = "table-warning";
                row2.appendChild(td);
            }
            hidenConteinerAlert({Sale: false});
        }else if(error.includes("Cannot read")){
            console.log(error);

        }else {
            showAlerts("Error al ejecutar la venta: "+error+", Reintente la operación.","alert-warning","elementsAlertSale");
        }
        tbody.appendChild(row2);
        btn_enable(btn_id,btn_name);
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgent();
        console.log("finally function TransbankSale");
        btn_enable(btn_id,btn_name);
    }
}
//cerrar las ventas del dia y obtener todal desde el pos
async function CloseDayTransbank(btn_id){
    /*
    Funcion de Transbank closeDay()
        Emitira la boleta con todos los detalles del día 
        retorna la id terminal y el codigo del comercio 
    */
    let btn_name = document.getElementById(btn_id).innerHTML;
    btn_disable(btn_id);
    let SelectCom = document.getElementById("SelectCom");
    if(SelectCom.value === ""){
        alert("¡Seleccione un puerto!. Antes de ejecutar cualquier función.");
        btn_enable(btn_id,btn_name);
        return;
    }
    const isConnect =  await Transbank.POS.isConnected;
   if (isConnect){
        btn_enable(btn_id,btn_name);
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){
                btn_enable(btn_id,btn_name);
                return;
            }
        }else{
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){ 
                btn_enable(btn_id,btn_name);
                return;
            }
        }
    }
    try{
        const closeday = await Transbank.POS.closeDay();
        if (closeday != null){
            if (closeday.responseCode === 0){
                var msj = " ";
                let data_key = Object.keys(closeday);
                for (let x=0 ; x < data_key.length; x++){
                    if(data_key[x]== "commerceCode"){
                        msj += "Con código de comercio ="+closeday[data_key[x]]+","
                    }else if(data_key[x]== "terminalId"){
                        msj += "La Terminal ID ="+closeday[data_key[x]]+", "
                    }
                }
                showAlerts("Cierre de caja: "+msj+" Procede a Cerrar Caja.","alert-success","elementsAlertInfo");
                hidenConteinerAlert({Info: false});
                hidenContainerTable();

            }else if (closeday.responseCode === 1){
                showAlerts("Cierre de Caja fue Rechazado.","alert-warning","elementsAlertInfo");
                hidenConteinerAlert({Info: false});
                hidenContainerTable();

            }else {
                tablaErrorsResponse(parseInt(closeday.responseCode));
                hidenContainerTable();

            }
        }else {
            showAlerts("- Elementos no encontrados.","alert-danger","elementsAlertInfo");
            hidenConteinerAlert({Info: false});
        }
        btn_enable(btn_id,btn_name);
        
    } catch (error) {
        console.log("-Error Close day: "+error);
        if (error.includes("Cannot read properties of null (reading 'once')")){
            console.log(error);
        }else{
           showAlerts("- "+error,"alert-warning","elementsAlertInfo"); 
           hidenConteinerAlert({Info: false});
        }
        
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgent(); 
        console.log("fanllity funcion cierre de día") 
        btn_enable(btn_id,btn_name);

    }
}
// obtenemos la última venta 
async function LastSaleTransbank(btn_id) {
    /*
    Ejecutamos la Funcion de Transbank getLastSale();
        (todos los datos de la última venta que este en la memoria del POS. De paso emite su boleta)
        Retorna 
            un Objeto con los datos de la última venta 
    */
    let btn_name = document.getElementById(btn_id).innerHTML;
    btn_disable(btn_id);
    let SelectCom = document.getElementById("SelectCom");
    if(SelectCom.value === ""){
        alert("¡Seleccione un puerto!. Antes de ejecutar cualquier función.");
        btn_enable(btn_id,btn_name);
        return;
    }
    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        btn_enable(btn_id,btn_name);
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){
                btn_enable(btn_id,btn_name);
                return;
            }
        }else{
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){ 
                btn_enable(btn_id,btn_name);
                return;
            }
        }
    }
    try {
        let result2 = await Transbank.POS.getLastSale();
        console.log(result2,"soy la ultima venta");
        if (result2.responseCode === 11){
            showAlerts("- No existe venta para mostrar.", "alert-warning", "elementsAlertInfo");
            hidenConteinerAlert({Info: false});
            return;
        }

        hidenContainerTable({lastSaleSuccess:false});

        var table = document.getElementById("tableLastSale");
        //antes de cargar la tabla eliminamos los elementos antiguos.
        deleteElementsTable('tableLastSale'); 
       
        let data_key = Object.keys(result2);
        let data_value = result2;
        //head 
        var thead = table.querySelector('thead');
        var state = thead.querySelector('tr');
        if (state === null){
            console.log(data_value);
            var iskeySharesNumber = "sharesNumber" in data_value;
            console.log(iskeySharesNumber);
            const row1 = document.createElement("tr");
            for (let i = 0; i <data_key.length; i++) {
                const th = document.createElement("th");
                th.setAttribute("scope", "col");
                let bandera = false;
                let msj = "";
                if(data_key[i] === "functionCode"){
                    msj = "Código de función";
                    bandera = true;
                }else if(data_key[i] === "responseCode"){
                    msj = "código de respuesta";
                    bandera = true;
                }else if(data_key[i] === "commerceCode"){
                    msj = "código de comercio";
                    bandera = true;
                }else if(data_key[i] === "terminalId"){
                    msj = "identificador de terminal";
                    bandera = true;
                }else if(data_key[i] === "responseMessage"){
                    msj = "mensaje de respuesta";
                    bandera = true;
                }else if(data_key[i] === "successful"){
                    msj = "exitosa";
                    bandera = true;
                }else if(data_key[i] === "ticket"){
                    msj = "boleto";
                    bandera = true;
                }else if(data_key[i] === "amount"){
                    msj = "Monto";
                    bandera = true;
                }else if(data_key[i] === "authorizationCode"){
                    msj = "Código de Autorización";
                    bandera = true;
                }else if(data_key[i] === "realDate"){
                    msj = "Fecha";
                    bandera = true;
                }else if(data_key[i] === "employeeId"){
                    msj = "ID de empleado";
                    bandera = true;
                }else if(data_key[i] === "sharesNumber"){
                    msj = "Número de cuotas";
                    bandera = true;
                }else if(data_key[i] === "sharesAmount"){
                    msj = "Monto de la cuota";
                    bandera = true;
                }else if(data_key[i] === "last4Digits"){
                    msj = "Últimos 4 dígitos";
                    bandera = true;
                }else if(data_key[i] === "operationNumber"){
                    msj = "número de operación";
                    bandera = true;
                }else if(data_key[i] === "cardType"){
                    msj = "tipo de tarjeta";
                    bandera = true;
                }else if(data_key[i] === "accountingDate"){
                    msj = "Fecha de contabilidad";
                    bandera = true;
                }else if(data_key[i] === "cardBrand"){
                    msj = "Tarjeta";
                    bandera = true;
                }else if(data_key[i] === "commerceProviderCode"){
                    msj = "Código de proveedor";
                    bandera = true;
                }else if(data_key[i] === "accountNumber"){
                    msj = "número de cuenta";
                    bandera = true;
                }else if(data_key[i] === "realTime"){
                    msj = "Hora";
                    bandera = true;
                }
                if (bandera === true){
                    const textth = document.createTextNode(msj);
                    th.appendChild(textth);
                    row1.appendChild(th);
                    bandera = false;
                }
            }
            thead.appendChild(row1);
        }   
        //body 
        let tbody =  table.querySelector("tbody");
        let row2 = document.createElement("tr");
        for (let x = 0; x <data_key.length; x++) {
            const td = document.createElement("td");
            let bandera = false;
            let msj = "";
            if(data_key[x] === "functionCode"){
                bandera = true;
            }else if(data_key[x] === "responseCode"){
                bandera = true;
            }else if(data_key[x] === "commerceCode"){
                bandera = true;
            }else if(data_key[x] === "terminalId"){
                bandera = true;
            }else if(data_key[x] === "responseMessage"){
                bandera = true;
            }else if(data_key[x] === "successful"){
                bandera = true;
            }else if(data_key[x] === "ticket"){
                bandera = true;
            }else if(data_key[x] === "amount"){
                bandera = true;
            }else if(data_key[x] === "authorizationCode"){
                bandera = true;
            }else if(data_key[x] === "realDate"){
                bandera = true;
            }else if(data_key[x] === "employeeId"){
                bandera = true;
            }else if(data_key[x] === "sharesNumber"){
                bandera = true;
            }else if(data_key[x] === "sharesAmount"){
                bandera = true;
            }else if(data_key[x] === "last4Digits"){
                bandera = true;
            }else if(data_key[x] === "operationNumber"){
                bandera = true;
            }else if(data_key[x] === "cardType"){
                bandera = true;
            }else if(data_key[x] === "accountingDate"){
                bandera = true;
            }else if(data_key[x] === "cardBrand"){
                bandera = true;
            }else if(data_key[x] === "commerceProviderCode"){
                bandera = true;
            }else if(data_key[x] === "accountNumber"){
                bandera = true;
            }else if(data_key[x] === "realTime"){
                bandera = true;
            }
            if(bandera === true){
                let  data = "";
                if (data_key[x] === "cardBrand"){
                    data = tarjetas[data_value[data_key[x]]];
                } else if (data_key[x] === "cardType") {
                    // CR: Crédito  | DB: Débito
                    if (data_value[data_key[x]] === "CR"){
                        data = "Crédito";
                    }else{
                        data = "Débito";
                    }
                } else if (data_key[x] === "realDate") {
                    const fechaString = data_value[data_key[x]];
                    // Divide el string fecha en partes
                    const dia = fechaString.slice(0, 2);
                    const mes = fechaString.slice(2, 4);
                    const ano = fechaString.slice(4, 8);

                    // Devuelve el formato de fecha completo
                    data = `${dia}/${mes}/${ano}`;

                } else if (data_key[x] === "realTime") {
                    const numeroString = data_value[data_key[x]];
                    // Divide el string hora en partes de dos caracteres
                    const horas = numeroString.slice(0, 2);
                    const minutos = numeroString.slice(2, 4);
                    const segundos = numeroString.slice(4, 6);

                    // Devuelve el formato de hora completo
                    data = `${horas}:${minutos}:${segundos}`;
                }else if (data_key[x] === "accountingDate"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (data_value["cardType"] === "DB"){
                        data = data_value[data_key[x]];
                    } else {
                        data = "--";
                    }
                } else if (data_key[x] === "accountNumber"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (data_value["cardType"] === "DB"){
                        data = data_value[data_key[x]];
                    } else{
                        data = "--";
                    }
                }else if (data_key[x] === "sharesNumber"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (data_value["cardType"] === "CR"){
                        data = data_value[data_key[x]];
                    } else {
                        data = "--";
                    }
                } else if (data_key[x] === "sharesAmount"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (data_value["cardType"] === "CR"){
                        data = data_value[data_key[x]];
                    } else{
                        data = "--";
                    }
                }else {
                    data = data_value[data_key[x]];
                }
                const textNode = document.createTextNode(data);
                td.appendChild(textNode);
                row2.appendChild(td);
                bandera = false;
            }
        } 
        tbody.appendChild(row2);
        btn_enable(btn_id,btn_name);
        hidenConteinerAlert();
    } catch (error) {
        console.log("-  "+error);
        if (error.includes("Cannot read properties of null (reading 'once')")){
            console.log(error);
        }else{
            showAlerts(error,"alert-danger","elementsAlertInfo");
            hidenConteinerAlert({Info: false});
        }
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgent();
        console.log("finally function  LastSaleTransbank");
        btn_enable(btn_id,btn_name);
    }
}
//funcion de transbank uso pos 
async function getpoll(){
    /*
    Ejecutamos la Funcion de Transbank poll()
        retorna un bool
    */
    try{  
        let SelectCom = document.getElementById("SelectCom");
        if(SelectCom.value === ""){return;}      
        let portStutas = await ConnectAgentPortPoll();
        if(portStutas === true){
            const pollStatus =  await Transbank.POS.poll();
            if (pollStatus){
                console.log("Status Poll: ",pollStatus);
                await closePortTransbanck();
                await disconnectTransbankAgent()
            }
        }else{
            return;
        }
    }catch(error){
        console.log("- Error getPoll"+error);
    }finally{
        console.log("finally fuction getpoll");
    }
}
//Obtenemos todas las ventas 
async function transbankSaleDetails(btn_id){
    /*
    Ejecutamos la Funcion de Transbank getDetails(bool)
        En este Caso de uso bool = False
        Retornara un objeto con todas las ventas que tenga guardada en la memoria
    */
    let btn_name = document.getElementById(btn_id).innerHTML;
    btn_disable(btn_id);
    let SelectCom = document.getElementById("SelectCom");
    if(SelectCom.value === ""){
        alert("¡Seleccione un puerto!. Antes de ejecutar cualquier función.");
        btn_enable(btn_id,btn_name);
        return;
    }
    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        btn_enable(btn_id,btn_name);
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){
                btn_enable(btn_id,btn_name);
                return;
            }
        }else{
            const isPort = await ConnectTransbankPosOpenPort();
            if (!isPort){ 
                btn_enable(btn_id,btn_name);
                return;
            }
        }
    }
    try {
        let result2 = await Transbank.POS.getDetails(false);
        if (result2.length === 0){
            showAlerts("- No existen ventas para mostrar.", "alert-warning", "elementsAlertInfo")
            hidenConteinerAlert({Info: false});
            return;
        }
        hidenContainerTable({detailsSuccess:false});
        await tableDetailsSale(result2);
        hidenConteinerAlert();
        btn_enable(btn_id,btn_name);
    } catch (error) {
        console.log('Error Details : ', error);
        if (error.includes("Cannot read properties of null (reading 'once')")){
            console.log(error);
        }else{
            showAlerts(error,"alert-danger","elementsAlertInfo");
            hidenConteinerAlert({Info: false});
        }
        return;
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgent();
        await getpoll();
        btn_enable(btn_id,btn_name);
        console.log("finally function transbankSaleDetails");
    }
}
/*
    Funciones de tablas
*/
// Generamos la tabla del detalle de ventas 
async function tableDetailsSale(objetoDetails){
    try{
        const timedate =new Date();
        var table = document.getElementById("tableDetalle");
        var datetime = document.getElementById("subTime");
        datetime.innerHTML = "Última recarga: "+timedate.toLocaleTimeString();
        //antes de cargar la tabla eliminamos los elementos antiguos.
        deleteElementsTable('tableDetalle'); 
        for (let y = 0; y <objetoDetails.length; y++) {
            let data_key = Object.keys(objetoDetails[y]);
            let data_value = objetoDetails[y];
            if (data_value.length === 0){
                console.log("- No Existen Registros de Ventas para mostrar.");
                break
            }
            //head 
            var thead = table.querySelector('thead');
            var state = thead.querySelector('tr');
            if (state === null){
                var iskeySharesNumber = "sharesNumber" in data_value;
                const row1 = document.createElement("tr");
                for (let i = 0; i <data_key.length; i++) {
                    const th = document.createElement("th");
                    th.setAttribute("scope", "col");
                    let bandera = false;
                    let msj = "";
                    if(data_key[i] === "functionCode"){
                        msj = "Código de función";
                        bandera = true;
                    }else if(data_key[i] === "responseCode"){
                        msj = "código de respuesta";
                        bandera = true;
                    }else if(data_key[i] === "commerceCode"){
                        msj = "código de comercio";
                        bandera = true;
                    }else if(data_key[i] === "terminalId"){
                        msj = "identificador de terminal";
                        bandera = true;
                    }else if(data_key[i] === "responseMessage"){
                        msj = "mensaje de respuesta";
                        bandera = true;
                    }else if(data_key[i] === "successful"){
                        msj = "exitosa";
                        bandera = true;
                    }else if(data_key[i] === "ticket"){
                        msj = "boleto";
                        bandera = true;
                    }else if(data_key[i] === "amount"){
                        msj = "Monto";
                        bandera = true;
                    }else if(data_key[i] === "authorizationCode"){
                        msj = "Código de Autorización";
                        bandera = true;
                    }else if(data_key[i] === "realDate"){
                        msj = "Fecha";
                        bandera = true;
                    }else if(data_key[i] === "employeeId"){
                        msj = "ID de empleado";
                        bandera = true;
                    }else if(data_key[i] === "sharesNumber"){
                        msj = "Número de cuotas";
                        bandera = true;
                    }else if(data_key[i] === "sharesAmount"){
                        msj = "Monto de la cuota";
                        bandera = true;
                    }else if(data_key[i] === "last4Digits"){
                        msj = "Últimos 4 dígitos";
                        bandera = true;
                    }else if(data_key[i] === "operationNumber"){
                        msj = "número de operación";
                        bandera = true;
                    }else if(data_key[i] === "cardType"){
                        msj = "tipo de tarjeta";
                        bandera = true;
                    }else if(data_key[i] === "accountingDate"){
                        msj = "Fecha de contabilidad";
                        bandera = true;
                    }else if(data_key[i] === "cardBrand"){
                        msj = "Tarjeta";
                        bandera = true;
                    }else if(data_key[i] === "commerceProviderCode"){
                        msj = "Código de proveedor";
                        bandera = true;
                    }else if(data_key[i] === "accountNumber"){
                        msj = "número de cuenta";
                        bandera = true;
                    }else if(data_key[i] === "realTime"){
                        msj = "Hora";
                        bandera = true;
                    }
                    if (bandera === true){
                        const textth = document.createTextNode(msj);
                        th.appendChild(textth);
                        row1.appendChild(th);
                        bandera = false;
                    }
                }
                thead.appendChild(row1);
            }   
            //body 
            let tbody =  table.querySelector("tbody");
            let row2 = document.createElement("tr");
            for (let x = 0; x <data_key.length; x++) {
                const td = document.createElement("td");
                let bandera = false;
                if(data_key[x] === "functionCode"){
                    bandera = true;
                }else if(data_key[x] === "responseCode"){
                    bandera = true;
                }else if(data_key[x] === "commerceCode"){
                    bandera = true;
                }else if(data_key[x] === "terminalId"){
                    bandera = true;
                }else if(data_key[x] === "responseMessage"){
                    bandera = true;
                }else if(data_key[x] === "successful"){
                    bandera = true;
                }else if(data_key[x] === "ticket"){
                    bandera = true;
                }else if(data_key[x] === "amount"){
                    bandera = true;
                }else if(data_key[x] === "authorizationCode"){
                    bandera = true;
                }else if(data_key[x] === "realDate"){
                    bandera = true;
                }else if(data_key[x] === "employeeId"){
                    bandera = true;
                }else if(data_key[x] === "sharesNumber"){
                    bandera = true;
                }else if(data_key[x] === "sharesAmount"){
                    bandera = true;
                }else if(data_key[x] === "last4Digits"){
                    bandera = true;
                }else if(data_key[x] === "operationNumber"){
                    bandera = true;
                }else if(data_key[x] === "cardType"){
                    bandera = true;
                }else if(data_key[x] === "accountingDate"){
                    bandera = true;
                }else if(data_key[x] === "cardBrand"){
                    bandera = true;
                }else if(data_key[x] === "commerceProviderCode"){
                    bandera = true;
                }else if(data_key[x] === "accountNumber"){
                    bandera = true;
                }else if(data_key[x] === "realTime"){
                    bandera = true;
                }
                if(bandera === true){
                    let  data = "";
                    if (data_key[x] === "cardBrand"){
                        data = tarjetas[data_value[data_key[x]]];
                    } else if (data_key[x] === "cardType") {
                        // CR: Crédito  | DB: Débito
                        if (data_value[data_key[x]] === "CR"){
                            data = "Crédito";
                        }else{
                            data = "Débito";
                        }
                    } else if (data_key[x] === "realDate") {
                        const fechaString = data_value[data_key[x]];
                        // Divide el string en partes
                        const dia = fechaString.slice(0, 2);
                        const mes = fechaString.slice(2, 4);
                        const ano = fechaString.slice(4, 8);

                        // Devuelve el formato de fecha completo
                        data = `${dia}/${mes}/${ano}`;

                    } else if (data_key[x] === "realTime") {
                        const numeroString = data_value[data_key[x]];
                        // Divide el string en partes de dos caracteres
                        const horas = numeroString.slice(0, 2);
                        const minutos = numeroString.slice(2, 4);
                        const segundos = numeroString.slice(4, 6);

                        // Devuelve el formato de hora completo
                        data = `${horas}:${minutos}:${segundos}`;
                    }else if (data_key[x] === "accountingDate"){
                        //Se utiliza solo con ventas Débito (Opcional)
                        if (data_value["cardType"] === "DB"){
                            data = data_value[data_key[x]];
                        } else {
                            data = "--";
                        }
                    } else if (data_key[x] === "accountNumber"){
                        //Se utiliza solo con ventas Débito (Opcional)
                        if (data_value["cardType"] === "DB"){
                            data = data_value[data_key[x]];
                        } else{
                            data = "--";
                        }
                    }else if (data_key[x] === "sharesNumber"){
                        //Se utiliza solo con ventas Débito (Opcional)
                        if (data_value["cardType"] === "CR"){
                            data = data_value[data_key[x]];
                        } else {
                            data = "--";
                        }
                    } else if (data_key[x] === "sharesAmount"){
                        //Se utiliza solo con ventas Débito (Opcional)
                        if (data_value["cardType"] === "CR"){
                            data = data_value[data_key[x]];
                        } else{
                            data = "--";
                        }
                    }else {
                        data = data_value[data_key[x]];
                    }
                    const textNode = document.createTextNode(data);
                    td.appendChild(textNode);
                    row2.appendChild(td);
                    bandera = false;
                }
            } 
            tbody.appendChild(row2);
        }
    }catch (error){
        console.log("- Error Create table DetailsSale");
    }
}
// Imprimimos el error de la tabla en la consola
function tablaErrorsResponse(errorCode){
    let isCode = errorCode in responseCodesPos;
    let tableErrorRefund = [4,5,8,21];
    let tableErrorPOS = [2,3,14,16,24,26,27,65,73,75,82,94,];
    let tablaErrorSale =[1,6,7,10,12,13,17,20,60,61,62,67,68,70,72,74,76,77,88,93];
    let tableErrorLastSale = [11];
    if (isCode === true){
        if (errorCode === 26){
            LoadKeyTransbank();
            showAlerts("- Recargando LLaves , Reintente la operación.","alert-warning", "elementsAlertStatus");
            hidenConteinerAlert({Status:false});
        }
        if (tableErrorRefund.includes(errorCode)){
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertRefund");
            console.log("2");
            hidenConteinerAlert({Refund:false});

        } else if (tableErrorPOS.includes(errorCode)){
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertStatus");
            hidenConteinerAlert({Status:false});
            console.log("3");
        }else if (tablaErrorSale.includes(errorCode)){
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertSale");
            hidenConteinerAlert({Sale:false});
            console.log("4");
        }else if (tableErrorLastSale.includes(errorCode)){
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertInfo");
            hidenConteinerAlert({Info:false});
            console.log("5");
        }else {
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertStatus");
            hidenConteinerAlert({Status:false});
            console.log("6");
        }  
    }
}
// Generamos tabla de ventas exitosa
async function setTableExitosa(result) {
    try{
        let table = document.getElementById("tableExitosa");
        // var divTable = document.getElementById("elementTableSuccess");
        // divTable.style.display = "block";
        let data_key = Object.keys(result);
        let data_value = result;
        //head 
        var thead = table.querySelector('thead');
        var state = thead.querySelector('tr');
        if (state === null){
            console.log(data_value);
            const row1 = document.createElement("tr");
            for (let i = 0; i <data_key.length; i++) {
                const th = document.createElement("th");
                th.setAttribute("scope", "col");
                let bandera = false;
                let msj = "";
                if(data_key[i] === "functionCode"){
                    msj = "Código de función";
                    bandera = true;
                }else if(data_key[i] === "responseCode"){
                    msj = "código de respuesta";
                    bandera = true;
                }else if(data_key[i] === "commerceCode"){
                    msj = "código de comercio";
                    bandera = true;
                }else if(data_key[i] === "terminalId"){
                    msj = "identificador de terminal";
                    bandera = true;
                }else if(data_key[i] === "responseMessage"){
                    msj = "mensaje de respuesta";
                    bandera = true;
                }else if(data_key[i] === "successful"){
                    msj = "exitosa";
                    bandera = true;
                }else if(data_key[i] === "ticket"){
                    msj = "boleto";
                    bandera = true;
                }else if(data_key[i] === "amount"){
                    msj = "Monto";
                    bandera = true;
                }else if(data_key[i] === "authorizationCode"){
                    msj = "Código de Autorización";
                    bandera = true;
                }else if(data_key[i] === "realDate"){
                    msj = "Fecha";
                    bandera = true;
                }else if(data_key[i] === "employeeId"){
                    msj = "ID de empleado";
                    bandera = true;
                }else if(data_key[i] === "sharesNumber"){
                    msj = "Número de cuotas";
                    bandera = true;
                }else if(data_key[i] === "sharesAmount"){
                    msj = "Monto de la cuota";
                    bandera = true;
                }else if(data_key[i] === "last4Digits"){
                    msj = "Últimos 4 dígitos";
                    bandera = true;
                }else if(data_key[i] === "operationNumber"){
                    msj = "número de operación";
                    bandera = true;
                }else if(data_key[i] === "cardType"){
                    msj = "tipo de tarjeta";
                    bandera = true;
                }else if(data_key[i] === "accountingDate"){
                    msj = "Fecha de contabilidad";
                    bandera = true;
                }else if(data_key[i] === "cardBrand"){
                    msj = "Tarjeta";
                    bandera = true;
                }else if(data_key[i] === "commerceProviderCode"){
                    msj = "Código de proveedor";
                    bandera = true;
                }else if(data_key[i] === "accountNumber"){
                    msj = "Número de cuenta";
                    bandera = true;
                }else if(data_key[i] === "realTime"){
                    msj = "Hora";
                    bandera = true;
                }
                if (bandera === true){
                    const textth = document.createTextNode(msj);
                    th.appendChild(textth);
                    row1.appendChild(th);
                    row1.className = "table-success";
                    bandera = false;
                }
            }
            thead.appendChild(row1);
        }   
        //body
        let tbody =  table.querySelector("tbody");
        let row2 = document.createElement("tr");
        for (let x = 0; x <data_key.length; x++) {
            const td = document.createElement("td");
            let bandera = false;
            let msj = "";
            if(data_key[x] === "functionCode"){
                bandera = true;
            }else if(data_key[x] === "responseCode"){
                bandera = true;
            }else if(data_key[x] === "commerceCode"){
                bandera = true;
            }else if(data_key[x] === "terminalId"){
                bandera = true;
            }else if(data_key[x] === "responseMessage"){
                bandera = true;
            }else if(data_key[x] === "successful"){
                bandera = true;
            }else if(data_key[x] === "ticket"){
                bandera = true;
            }else if(data_key[x] === "amount"){
                bandera = true;
            }else if(data_key[x] === "authorizationCode"){
                bandera = true;
            }else if(data_key[x] === "realDate"){
                bandera = true;
            }else if(data_key[x] === "employeeId"){
                bandera = true;
            }else if(data_key[x] === "sharesNumber"){
                bandera = true;
            }else if(data_key[x] === "sharesAmount"){
                bandera = true;
            }else if(data_key[x] === "last4Digits"){
                bandera = true;
            }else if(data_key[x] === "operationNumber"){
                bandera = true;
            }else if(data_key[x] === "cardType"){
                bandera = true;
            }else if(data_key[x] === "accountingDate"){
                bandera = true;
            }else if(data_key[x] === "cardBrand"){
                bandera = true;
            }else if(data_key[x] === "commerceProviderCode"){
                bandera = true;
            }else if(data_key[x] === "accountNumber"){
                bandera = true;
            }else if(data_key[x] === "realTime"){
                bandera = true;
            }
            if(bandera === true){
                let  data = "";
                if (data_key[x] === "cardBrand"){
                    const iskey = data_value[data_key[x]] in tarjetas;
                    if (iskey === true){
                        data = tarjetas[data_value[data_key[x]]];
                    }else{
                        data = data_value[data_key[x]];
                    }
                } else if (data_key[x] === "cardType") {
                    // CR: Crédito  | DB: Débito
                    if (data_value[data_key[x]] === "CR"){
                        data = "Crédito";
                    }else{
                        data = "Débito";
                    }
                } else if (data_key[x] === "realDate") {
                    const fechaString = data_value[data_key[x]];
                    // Divide el string en partes
                    const dia = fechaString.slice(0, 2);
                    const mes = fechaString.slice(2, 4);
                    const ano = fechaString.slice(4, 8);

                    // Devuelve el formato de fecha completo
                    data = `${dia}/${mes}/${ano}`;

                } else if (data_key[x] === "realTime") {
                    const numeroString = data_value[data_key[x]];
                    // Divide el string en partes de dos caracteres
                    const horas = numeroString.slice(0, 2);
                    const minutos = numeroString.slice(2, 4);
                    const segundos = numeroString.slice(4, 6);

                    // Devuelve el formato de hora completo
                    data = `${horas}:${minutos}:${segundos}`;
                }else if (data_key[x] === "accountingDate"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (data_value["cardType"] === "DB"){
                        data = data_value[data_key[x]];
                        console.log(data_value[data_key[x]]);
                    } else {
                        data = "--";
                    }
                } else if (data_key[x] === "accountNumber"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (data_value["cardType"] === "DB"){
                        data = data_value[data_key[x]];
                    } else{
                        data = "--";
                    }
                }else if (data_key[x] === "sharesNumber"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (data_value["cardType"] === "CR"){
                        data = data_value[data_key[x]];
                    } else {
                        data = "--";
                    }
                } else if (data_key[x] === "sharesAmount"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (data_value["cardType"] === "CR"){
                        data = data_value[data_key[x]];
                    } else{
                        data = "--";
                    }
                }else {
                    data = data_value[data_key[x]];
                }
                const textNode = document.createTextNode(data);
                td.appendChild(textNode);
                row2.className = "table-success";
                row2.appendChild(td);
                bandera = false;
            }
        } 
        tbody.appendChild(row2);
    } catch (error){
        console.log('Error:', error);
        console.log("- Error Set Table Existosa: "+error);
        showAlerts("Error: "+error,"alert-danger","elementsAlertSale");
        
    }
}
// Generamos tabla de ventas fallidads
async function setTableFallida(result) {
    try{
        var table = document.getElementById("tableFallida");
        // var divTable = document.getElementById("elementTableDanger");
        // divTable.style.display = "block";
        let data_key = Object.keys(result);
        
        //head 
        var thead = table.querySelector('thead');
        var state = thead.querySelector('tr');
        if (state === null){
            const row1 = document.createElement("tr");
            for (let i = 0; i <data_key.length; i++) {
                const th = document.createElement("th");
                th.setAttribute("scope", "col");
                let bandera = false;
                let msj = "";
                if(data_key[i] === "functionCode"){
                    msj = "Código de función";
                    bandera = true;
                }else if(data_key[i] === "responseCode"){
                    msj = "código de respuesta";
                    bandera = true;
                }else if(data_key[i] === "commerceCode"){
                    msj = "código de comercio";
                    bandera = true;
                }else if(data_key[i] === "terminalId"){
                    msj = "identificador de terminal";
                    bandera = true;
                }else if(data_key[i] === "responseMessage"){
                    msj = "mensaje de respuesta";
                    bandera = true;
                }else if(data_key[i] === "successful"){
                    msj = "exitosa";
                    bandera = true;
                }else if(data_key[i] === "ticket"){
                    msj = "boleto";
                    bandera = true;
                }else if(data_key[i] === "amount"){
                    msj = "Monto";
                    bandera = true;
                }else if(data_key[i] === "authorizationCode"){
                    msj = "Código de Autorización";
                    bandera = true;
                }else if(data_key[i] === "realDate"){
                    msj = "Fecha Real";
                    bandera = true;
                }else if(data_key[i] === "employeeId"){
                    msj = "ID de empleado";
                    bandera = true;
                }
                if (bandera === true){
                    const textth = document.createTextNode(msj);
                    th.appendChild(textth);
                    row1.appendChild(th);
                    row1.className = "table-danger";
                    bandera = false;
                }
            }
            thead.appendChild(row1);
        }
        //body
        let tbody =  table.querySelector("tbody");
        const row2 = document.createElement("tr");
        for (let i = 0; i <data_key.length; i++) {
            const td = document.createElement("td");
            let bandera = false;
            if(data_key[i] === "functionCode"){
                bandera = true;
            }else if(data_key[i] === "responseCode"){
                bandera = true;
            }else if(data_key[i] === "commerceCode"){
                bandera = true;
            }else if(data_key[i] === "terminalId"){
                bandera = true;
            }else if(data_key[i] === "responseMessage"){
                bandera = true;
            }else if(data_key[i] === "successful"){
                bandera = true;
            }else if(data_key[i] === "ticket"){
                bandera = true;
            }else if(data_key[i] === "amount"){
                bandera = true;
            }else if(data_key[i] === "authorizationCode"){
                bandera = true;
            }else if(data_key[i] === "realDate"){
                bandera = true;
            }else if(data_key[i] === "employeeId"){
                bandera = true;
            }
            
            if(bandera === true){
                let data = ""; 
                if (result[data_key[i]] === "" || result[data_key[i]] === null){
                    data = "--"; 
                }else {
                    data = result[data_key[i]];
                }
                const textNode = document.createTextNode(data);
                td.appendChild(textNode);
                row2.className = "table-danger";
                row2.appendChild(td);
                bandera = false;
            }
        } 
        tbody.appendChild(row2);
    } catch (error){
        console.log('Error:', error);
        console.log("- Error Set Table Fallida: "+error);
        showAlerts("Error: "+error,"alert-danger","elementsAlertSale");

    }
}
//limpiamos la tabla correspondiente
async function deleteElementsTable(tableName){
    let table = document.getElementById(tableName);
    var tbody = table.querySelector('tbody');
    var state = tbody.querySelectorAll('tr')
    for(let i = 0 ; i < state.length; i++){
        state[i].remove();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    ConnectAgentChargeSelect();
});
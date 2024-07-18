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
async function restartAgent(){
    try{
       
        await ConnectAgent();
        await closePortTransbanck();
        await disconnectTransbankAgente();
        showAlerts("Restart Completado.","alert-success", "elementsAlertStatus");

    }catch (error){
        console.log("problema con el restart: "+error);
    }
}
function showAlerts(text, tipeAlert, idContainerAlerts) {

    var containerAlert = document.getElementById(idContainerAlerts);
    var listAlert = ["alert-success","alert-danger","alert-warning"];
    // hide all the visible alerts
    listAlert.forEach((alertclasshide) => {
        var allAlertshide = document.querySelectorAll("."+alertclasshide);
        var alertSelecthide = Array.from(allAlertshide)
        alertSelecthide.forEach((elementohide)=>{
            elementohide.style.display = "none";
            
        });
    });
    //select one alert for show focus
    listAlert.forEach((alertclass) => {
        var allAlerts = containerAlert.querySelectorAll("."+alertclass);
        var alertSelect = Array.from(allAlerts)
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
    const regex = /^[0-9]*$/;
    let isNum = regex.test(dato);
    if (dato.length === 0){
        alert("- Ingrese el "+salida+".");
        return false
    }
    if (isNum === false){
        alert("- Ingresar Solo Numeros en "+salida+".");
        return false
    }
    return true
}
/*
    Funciones de on and off
*/
// verificamos que el agente este desplegado y nos conectamos
async function ConnectAgent(){
    //Solo conectamos el agent preguntando si esta desplegado o no
    try{
        let isConnect = await Transbank.POS.isConnected;
        let response = await fetch("https://localhost:8090/");
        if (response){
            //console.log("online");
            //El Agente se encuentra desplegado
            if (isConnect != true){
                let connect = await Transbank.POS.connect();
                console.log("- Agente Conectado Correctamente."); 
            } else {
                // console.log("- Ya estas Conectado al Agente.");   
                showAlerts("- Ya estas Conectado al Agente.","alert-warning","elementsAlertStatus");
            }
        } 
    } catch(error){
        //console.log("Offline");
        //El agente no se encuentra despleagado
        // console.log("- El Agente no se encuentra Despeglado.");
        showAlerts("- El Agente no se encuentra Despeglado.","alert-danger","elementsAlertStatus");

    }    
}
async function ConnectAgentPortPoll() {
    try{
        let isConnect = await Transbank.POS.isConnected;
        try{
            let response = await fetch("https://localhost:8090/");
            if (response){
                if (isConnect != true){
                    let connect = await Transbank.POS.connect();
                    console.log("- Agente Conectado Correctamente."); 
                } else {
                    console.log("- Ya estas Conectado al Agente.");   
                }
            } 
        } catch(error){
            console.log("- El Agente no se encuentra Despeglado.");
            return false;
        }    
        const statusport = await Transbank.POS.getPortStatus();
        if(statusport.connected){ 
            await closePortTransbanck();
        }
        const getPort = await Transbank.POS.getPorts();
        if (getPort.length != 0 ){
            let valuePortCom;
            for(let i=0; i<getPort.length; i++){
                let data_key = Object.keys(getPort[i]); // Genera un array con las keys del diccionario
                let data_value = getPort[i];
                for ( let x=0 ; x < data_key.length; x++){
                    if(data_key[x] === "path"){
                        valuePortCom = data_value[data_key[x]];
                        break;
                    }
                }
            }
            let openPort = await Transbank.POS.openPort(valuePortCom); 
            if(openPort){
                console.log("Puerto conectado con POS");
                return true;
            } else{
                console.log("No se pudo Conectar con el POS");
                return false;
           }
        }
    }catch(error){
        console.log("ConnectPoll: ",error);
        if (error === "Another connect command was already sent and it is still waiting"){
            showAlerts("Problemas al Conectar, Se recomienda reiniciar el Agente.","alert-danger","elementsAlertStatus")
        }else if (error === "Could not open serial connection..."){
            showAlerts("Problemas al Conectar, Se recomienda reiniciar el Agente.","alert-danger","elementsAlertStatus")
        }
        await disconnectTransbankAgente();
        return false;

    }
    
}

// buscamos el puerto del pos y los conectamos 
async function ConnectTransbankPosOpenPort(){
    try{
        let isConnect = await Transbank.POS.isConnected;
        if (isConnect){
            const getPort = await Transbank.POS.getPorts();  
            // Transbank.POS.getPorts().then((getPort)=>{
                //select 
            if (getPort.length != 0 ){
                let valuePortCom;
                for(let i=0; i<getPort.length; i++){
                    let data_key = Object.keys(getPort[i]); // Genera un array con las keys del diccionario
                    let data_value = getPort[i];
                    for ( let x=0 ; x < data_key.length; x++){
                        if(data_key[x] === "path"){
                            valuePortCom = data_value[data_key[x]];
                            break;
                        }
                    }
                }
                let openPort = await Transbank.POS.openPort(valuePortCom);  
                // Transbank.POS.openPort(valuePortCom).then((openPort)=>{
                if (openPort){
                    console.log("- Conectado con el POS.");   
                    return true;
                }else {
                    console.log("- No se  pudo establecer concexión con el POS."); 
                    showAlerts("- No se  pudo establecer concexión con el POS.","alert-warning","elementsAlertStatus");
                    return false;
                }
                // });  
                
            } else {
                showAlerts("- No se encontro ni un POS Conectado.","alert-warning","elementsAlertStatus");
                await disconnectTransbankAgente();
                return false;
            }
            // });  
        }
    } catch (error){
        console.log("Conectar puerto: ",error);
        if (error === "Another connect command was already sent and it is still waiting"){
            showAlerts("Ya se encuentra un POS Conectado, Se recomienda reiniciar el Agente y usar el boton 'Restart Agent'.","alert-danger","elementsAlertStatus")
        }else {
            showAlerts("Problema en la comunicación, Reintente la operación","alert-danger","elementsAlertStatus");
        }
        await disconnectTransbankAgente();
        return false;
    }
}

// cerramos el puerto donde se conecto el POS
async function closePortTransbanck(){
    try{
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
                // console.log("- Problemas en la Comunicación con el POS.");
                console.log("- Problemas en la Comunicación con el POS.");
            }
        }else {
            // console.log("- No se encontro ningun POS conectado.");
            console.log("- No se encontro ningun POS conectado.");
        }
    }catch (error){
        // console.log(error);
        console.log("close port "+ error);
        showAlerts("- "+error,"alert-danger","elementsAlertStatus");
        return;
    }
}
// cerramos la conexion con el agente
async function disconnectTransbankAgente(){
    try{
        let isConnect = await Transbank.POS.isConnected;
        if(isConnect === true){
            const disconnect = await Transbank.POS.disconnect();
            if (disconnect != null){
                // console.log("- Desconectado del Agente Correctamente.");
                console.log("- Desconectado del Agente Correctamente.");
            } else {
                console.log("- Problemas en la Comunicación con el Agente.");
            }
        }else {
            // console.log("- No se encontro ningun Agente conectado.");
            console.log("- No se encontro ningun Agente conectado.");
        }
    } catch (error) {
        console.log("- salir agente "+error);
    }
}  

/*
    Funciones de Transbank POS
*/

// ejecutamos las demas funciones sin dejar que el usuario de conecte al agente y al pos
async function callFunctionTransbank(caseUse, id_btn){
    try{
        var nombre =  document.getElementById(id_btn).innerHTML;
        document.getElementById(id_btn).disabled = true;
        document.getElementById(id_btn).innerHTML="Enviando...";

        const isConnect = await Transbank.POS.isConnected;
        if (isConnect === false){
            await ConnectAgent();
            const isPosConnect = await Transbank.POS.getPortStatus();
            console.log(isPosConnect.connected);
            if (isPosConnect.connected === false){
                let isPort = await ConnectTransbankPosOpenPort();
                if (isPort === true){
                    //si la funcion se demora mucho bugea al agente 
                    // Agregar registros para cada caseUse específica
                    switch(caseUse) {
                        case 1:
                            await LastSaleTransbank(); //última venta
                            break;
                        case 2:
                            await CloseDayTransbank();//cierre de día
                            break;
                        case 3:
                            await GetDetailsTransbankPrint();//detalles de las ventas por el pos
                            break;
                        case 4:
                            await transbankSaleDetails();//detalles de las ventas en una tabla
                            break;
                        case 5:
                            await refundTransbank();//cancelar una venta
                            break;
                        case 6:
                            await TransbankVenta();//hacer una venta
                            break;
                        default:
                            console.log(`caseUse no válida: ${caseUse}`);
                    }
                    await closePortTransbanck();
                    await disconnectTransbankAgente();
                    if(caseUse === 4){
                        await getpoll(); // --> para que transbankSaleDetails salga de modo de espera;
                    }

                } 
            }else{
                console.log("- El POS se encuentra en uso.");
                showAlerts("- El POS se encuentra en uso.","alert-warning","elementsAlertStatus");
                await disconnectTransbankAgente();

            }
        } else{
            console.log("- El agente se encuentra en uso.");
            showAlerts("- El agente se encuentra en uso.","alert-warning","elementsAlertStatus");
        }
    }catch (error){
        console.log("Funcion principal "+error);
        await closePortTransbanck();
        await disconnectTransbankAgente();
    } finally {
        document.getElementById(id_btn).disabled = false;
        document.getElementById(id_btn).innerHTML = nombre;
    }
    
}
//anulacion de compra solo se puede con credito
async function refundTransbank(btn_id){
    var btn_name;
    btn_name = document.getElementById(btn_id).innerHTML;
    document.getElementById(btn_id).disabled = true;
    document.getElementById(btn_id).innerHTML = "Enviando..";

    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            await ConnectTransbankPosOpenPort();
        }else{
            await ConnectTransbankPosOpenPort();
        }
    }
    try{
        let numberOperationPos = $("#numeroOperation").val();
        let isValueOperation = validateNumberInput(numberOperationPos , "Nº de Operación");
        if (!isValueOperation){
            return
        }
        let refundPos = await Transbank.POS.refund(numberOperationPos);

        if (refundPos !=null){
            if(refundPos.responseCode === 0){
                showAlerts("- Anulación: Aceptada","alert-success","elementsAlertRefund");

                let divtableSale = document.getElementById("elementTableSuccess");
                let divtableSale2 = document.getElementById("elementTableDanger");
                let divtableRefund = document.getElementById("elementTableRefund");
                let divTableWarning = document.getElementById("elementTableWarning");       

                if (divtableSale.style.display === "block" || divtableSale2.style.display === "block" || divTableWarning.style.display === "block"){
                    divtableSale.style.display = "none";
                    divtableSale2.style.display = "none";
                    divTableWarning.style.display = "none";
                }
                divtableRefund.style.display = "block";
        
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
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    }catch(error){
        showAlerts("- "+error,"alert-warning","elementsAlertRefund");

    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgente();
        console.log("Salida de la funcion de ");
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    }
}








// Cargamos llaves al pos para que este sincronizado con transbank
async function loadKeyTransbank(btn_id){
    //Cabe destacar que por cada venta tambien se sincronizan 
    // las llaves por lo tanto el comando se puede utilizar en una apertura de caja y si se desea comprobar el estado de conexión 
    // con los servidores. 
    var btn_name;
    btn_name = document.getElementById(btn_id).innerHTML;
    document.getElementById(btn_id).disabled = true;
    document.getElementById(btn_id).innerHTML = "Enviando..";

    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            await ConnectTransbankPosOpenPort();
        }else{
            await ConnectTransbankPosOpenPort();
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
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    } catch (error) {
        console.log(error);
        console.log("-Error loadkey: "+error);
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgente();
        console.log("salida de la funcion refundTransbank");
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    }
}
// generamos el detales de ventas del día (se imprime en el pos)
async function GetDetailsTransbankPrint(btn_id){
    var btn_name;
    btn_name = document.getElementById(btn_id).innerHTML;
    document.getElementById(btn_id).disabled = true;
    document.getElementById(btn_id).innerHTML = "Enviando..";

    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            await ConnectTransbankPosOpenPort();
        }else{
            await ConnectTransbankPosOpenPort();
        }
    }
    try{
        //getDetails(True) =>  print POS
        //solo se puede pedir una vez despues de una acción 
        //Esto solo devuelve un Objeto vacío
        const details = await Transbank.POS.getDetails(true);

        if (details === true) {
            // console.log("- Lista de ventas: Emitida en le POS.");
            showAlerts("- Lista de ventas: Emitida en le POS.","alert-success","elementsAlertInfo");
        }else {
            // tablaErrorsResponse(parseInt(details.responseCode));
            // console.log("- No se pude generar el detalle de las ventas.");
            showAlerts("- No se pudo emitir el detalle de las ventas en el POS.","alert-warning","elementsAlertInfo");
        }
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    } catch (error) {
        console.log("- "+error);
        showAlerts("- Error Detalle POS: "+error ,"alert-danger","elementsAlertInfo");
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgente();
        console.log("Salida de la funcion de detailsprintpos");
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    }
}
// generamos la venta sacando los datos de los input correspondientes
async function TransbankVenta(btn_id){
    var btn_name;
    btn_name = document.getElementById(btn_id).innerHTML;
    document.getElementById(btn_id).disabled = true;
    document.getElementById(btn_id).innerHTML = "Enviando..";

    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            await ConnectTransbankPosOpenPort();
        }else{
            await ConnectTransbankPosOpenPort();
        }
    }
    var monto;
    var ticket;
    var fecha;
    var hora;

    try {   
        let montoPos = $("#montoPos").val();
        let ticketPos = $("#ticketPos").val();
        let isValuemonto = validateNumberInput(montoPos , "Monto");
        monto = montoPos;
        ticket = ticketPos;
        if (!isValuemonto) {
            return;
        }
        if (ticketPos.length === 0){
            alert("Ingrese el Ticket.")
            return;
        }
        // Convertir a números
        montoPos = parseInt(montoPos);
     
        // identificando tablas
        let divtableSuccess =  document.getElementById("elementTableSuccess");
        let divtableDanger =  document.getElementById("elementTableDanger");
        let divtableRefund =  document.getElementById("elementTableRefund");
        let divTableWarning = document.getElementById("elementTableWarning");       

        const date = new Date()
        fecha= date.toLocaleDateString();
        hora= date.toLocaleTimeString();
        let result = await Transbank.POS.doSale(montoPos,ticketPos);
        // await Transbank.POS.doSale(montoPos,ticketPos).then((result) => {
        
        if (result.responseCode === 0){
            //Consulta sobre si la tabla esta visible o no 
            if (divtableDanger.style.display === "block" || divtableRefund.style.display === "block" || divTableWarning.style.display === "block"){
                divtableDanger.style.display = "none";
                divtableRefund.style.display = "none";
                divTableWarning.style.display = "none";
            }
            deleteElementsTable("tableExitosa");
            setTableExitosa(result); // llamaos a crear los elementos
            // Entregamos una alerta 
            showAlerts("¡¡Venta Completada Exitosamente!!.","alert-success","elementsAlertSale");

        }else {
            if (divtableSuccess.style.display === "block"|| divtableRefund.style.display === "block"  || divTableWarning.style.display === "block"){
                divtableSuccess.style.display = "none";
                divTableWarning.style.display = "none";
                divtableRefund.style.display = "none";
            }
            deleteElementsTable("tableFallida");
            setTableFallida(result);
            // tablaErrorsResponse(parseInt(result.responseCode));
            // tablaErrorsResponse(parseInt(result.responseCode));
            // setTableFallida(result)
            showAlerts("¡Fallo al intentar la venta!.","alert-danger","elementsAlertSale");

        }
        // }).catch( (err) => {
        //     console.log('Ocurrió un error inesperado', err);
        // });
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    } catch (error) {
        console.log("- Ejecutar Venta: "+error);
        if(error.includes("Timeout")){
            console.log(error);
            showAlerts("Verifique si la venta fue Aceptada en la tabla de Ventas.","alert-danger","elementsAlertSale");
            await deleteElementsTable('tableWarning');

            noResponse = {
                "Monto":monto, 
                "Ticket":ticket,
                "Fecha":fecha, 
                "Hora":hora
            };
            let divTable = document.getElementById("elementTableWarning");       
            let divtableSuccess =  document.getElementById("elementTableSuccess");
            let divtableDanger =  document.getElementById("elementTableDanger");
            let divtableRefund =  document.getElementById("elementTableRefund");

            if (divtableSuccess.style.display === "block"|| divtableDanger.style.display === "block" || divtableRefund.style.display === "block"){
                divtableSuccess.style.display = "none";
                divtableDanger.style.display = "none";
                divtableRefund.style.display = "none";
            }
            divTable.style.display = "block";
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
            tbody.appendChild(row2);
            
        }else {
            showAlerts("Error al ejecutar la venta: "+error+", Reintente la operación.","alert-warning","elementsAlertSale");
        }
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgente();
        console.log("Salida de la funcion de transbankventa");
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    }
}
async function CloseDayTransbank(btn_id){
    var btn_name;
    btn_name = document.getElementById(btn_id).innerHTML;
    document.getElementById(btn_id).disabled = true;
    document.getElementById(btn_id).innerHTML = "Enviando..";

    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            await ConnectTransbankPosOpenPort();
        }else{
            await ConnectTransbankPosOpenPort();
        }
    }
    try{
        const closeday = await Transbank.POS.closeDay();
        console.log(closeday);
        if (closeday != null){
            if (closeday.responseCode === 0){
                var msj = " ";
                let data_key = Object.keys(closeday); // Genera un array con las keys del diccionario
                for (let x=0 ; x < data_key.length; x++){
                    if(data_key[x]== "commerceCode"){
                        msj += "Con código de comercio ="+closeday[data_key[x]]+","
                    }else if(data_key[x]== "terminalId"){
                        msj += "La Terminal ID ="+closeday[data_key[x]]+", "
                    }
                }
                showAlerts("Cierre de caja: "+msj+" Procede a Cerrar Caja.","alert-success","elementsAlertInfo");
            }else if (closeday.responseCode === 1){
                showAlerts("Cierre de Caja fue Rechazado.","alert-warning","elementsAlertInfo");
            }else {
                tablaErrorsResponse(parseInt(closeday.responseCode));
            }
        }else {
            showAlerts("- Elementos no encontrados.","alert-danger","elementsAlertInfo");
        }
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    } catch (error) {
        showAlerts("- "+error,"alert-warning","elementsAlertInfo");
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgente(); 
        console.log("Salida de la funcion cierre de día") 
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    }
}
// generamos tabla de ventas exitosa
async function setTableExitosa(result) {
    try{
        let table = document.getElementById("tableExitosa");
        var divTable = document.getElementById("elementTableSuccess");
        divTable.style.display = "block";
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
// generamos tabla de ventas fallidads
async function setTableFallida(result) {
    try{
        var table = document.getElementById("tableFallida");
        var divTable = document.getElementById("elementTableDanger");
        divTable.style.display = "block";
        let data_key = Object.keys(result);
        
        //head 
        console.log(table);
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
    console.log(state);
    for(let i = 0 ; i < state.length; i++){
        console.log(state[i]);
        state[i].remove();
    }
}
// obtenemos la última venta 
async function LastSaleTransbank(btn_id) {
    var btn_name;
    btn_name = document.getElementById(btn_id).innerHTML;
    document.getElementById(btn_id).disabled = true;
    document.getElementById(btn_id).innerHTML = "Enviando..";

    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            await ConnectTransbankPosOpenPort();
        }else{
            await ConnectTransbankPosOpenPort();
        }
    }
    try {
        let result2 = await Transbank.POS.getLastSale(false);
        console.log(result2,"soy la ultima venta");
        if (result2.responseCode === 11){
            showAlerts("- No existe venta para mostrar.", "alert-warning", "elementsAlertInfo");
            return
        }
        let divtabledetalle = document.getElementById("elementTableDetalle");
        let divtablelastsale = document.getElementById("elementTableLastSale");
        
        if (divtabledetalle.style.display === "block"){
            divtabledetalle.style.display = "none";
        }
        divtablelastsale.style.display = "block";

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
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    } catch (error) {
        console.log("-  "+error);
        showAlerts(error,"alert-danger","elementsAlertInfo");
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgente();
        console.log("salida de la función ");
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
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
        }
        if (tableErrorRefund.includes(errorCode)){
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertRefund");
            console.log("2");
        } else if (tableErrorPOS.includes(errorCode)){
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertStatus");
            console.log("3");
        }else if (tablaErrorSale.includes(errorCode)){
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertSale");
            console.log("4");
        }else if (tableErrorLastSale.includes(errorCode)){
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertInfo");
            console.log("5");
        }else {
            showAlerts(responseCodesPos[errorCode],"alert-warning", "elementsAlertStatus");
            console.log("6");
        }  
    }
}
async function tableDetailsSale(objetoDetails){
    try{
        const timedate =new Date();
        var table = document.getElementById("tableDetalle");
        var datetime = document.getElementById("subTime");
        datetime.innerHTML = "Última recarga: "+timedate.toLocaleTimeString();
        //antes de cargar la tabla eliminamos los elementos antiguos.
        deleteElementsTable('tableDetalle'); 
        for (let y = 0; y <objetoDetails.length; y++) {
            console.log("primer element: ",objetoDetails[y]);
            let data_key = Object.keys(objetoDetails[y]);
            let data_value = objetoDetails[y];
            if (data_value.length === 0){
                console.log("- No Existen Registros de Ventas para mostrar.");
                break
            }
            //head 

            let divtabledetalle = document.getElementById("elementTableDetalle");
            divtabledetalle.style.display = "block";
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
        }
    }catch (error){

    }
}
// esta funcion simpre dara error para que pueda terminar la ejecución el pos
// al momento de conectar el port esto tiene que lasar un error 
// solo en caso de que no lanze el error y pueda responder el poll nos deconectamos
async function getpoll(){
    try{        
        let portStutas = await ConnectAgentPortPoll();
        if(portStutas === true){
            const pollStatus =  await Transbank.POS.poll();
            if (pollStatus){
                console.log("Status Poll: ",pollStatus);
                await closePortTransbanck();
                await disconnectTransbankAgente()
            }
        }else{
            return;
        }
        
    }catch(error){
        console.log(error);
    }
}



async function transbankSaleDetails(btn_id){
    var btn_name;
    btn_name = document.getElementById(btn_id).innerHTML;
    document.getElementById(btn_id).disabled = true;
    document.getElementById(btn_id).innerHTML = "Enviando..";

    const isConnect =  await Transbank.POS.isConnected;
    if (isConnect){
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
        console.log("Agente en uso.");
        return;
    }else{
        await ConnectAgent();
        const isConnectP = await Transbank.POS.getPortStatus();
        if(isConnectP.connected){
            console.log("EL Puerto esta conectado. Reconectando");
            await closePortTransbanck();
            await ConnectTransbankPosOpenPort();
        }else{
            await ConnectTransbankPosOpenPort();
        }
    }
    try {
        let result2 = await Transbank.POS.getDetails(false);
        console.log(result2);
        if (result2.length === 0){
            showAlerts("- No existen ventas para mostrar.", "alert-warning", "elementsAlertInfo")
            return
        }
        await tableDetailsSale(result2);
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
    } catch (error) {
        console.log('Error:', error);
        showAlerts(error,"alert-danger","elementsAlertInfo");
        return;
    }finally{
        await closePortTransbanck();
        await disconnectTransbankAgente();
        let btn = document.getElementById(btn_id);
        btn.innerHTML= btn_name; 
        btn.disabled = false;
        await getpoll();
       
        console.log("salida de la funcion ");
    }
}
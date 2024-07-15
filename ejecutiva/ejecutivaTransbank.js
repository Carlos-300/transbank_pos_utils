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
    listAlert.forEach(alertclasshide => {
        var allAlertshide = document.querySelectorAll("."+alertclasshide);
        var alertSelecthide = Array.from(allAlertshide)
        alertSelecthide.forEach((elementohide)=>{
            elementohide.style.display = "none";
            
        });
    });
    //select one alert for show focus
    listAlert.forEach(alertclass => {
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


function callPrivate(){
    var isConnectPrivate = ConnectAgent();
    if(!isConnectPrivate){
        return
    }
    var isPortConnectPrivate = ConnectTransbankPosOpenPort();
    if(!isPortConnectPrivate){
        return
    }
    transbankVentasDetalle();

    closePortTransbanck();
    disconnectTransbankAgente();
}



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
            if (isPosConnect["connected"] === false){
                let isPort = await ConnectTransbankPosOpenPort();
                if (isPort === true){
                    //si la funcion se demora mucho bugea al agente 
                    // Agregar registros para cada caseUse específica
                    switch(caseUse) {
                        case 1:
                            await GetTotalsTransbank();//obtener total de las ventas
                            break;
                        case 2:
                            await LastSaleTransbank(); //última venta
                            break;
                        case 3:
                            await CloseDayTransbank();//cierre de día
                            break;
                        case 4:
                            await GetDetailsTransbankPrint();//detalles de las ventas por el pos
                            break;
                        case 5:
                            await transbankVentasDetalle();//detalles de las ventas en una tabla
                            break;
                        case 6:
                            await refundTransbank();//cancelar una venta
                            break;
                        case 7:
                            await TransbankVenta();//hacer una venta
                            break;
                        default:
                            console.log(`caseUse no válida: ${caseUse}`);
                    }
                    await closePortTransbanck();
                    await disconnectTransbankAgente();
                } 
            }else{
                console.log("- El POS se encuentra en uso.");
                showAlerts("- El POS se encuentra en uso.","alert-warning","elementsAlertStatus");
            }
        } else{
            console.log("- El agente se encuentra en uso.");
            showAlerts("- El agente se encuentra en uso.","alert-warning","elementsAlertStatus");
        }
    }catch (error){
        console.log("Funcion principal "+error);
        await closePortTransbanck();
        await disconnectTransbankAgente();
    } finally{
        document.getElementById(id_btn).disabled = false;
        document.getElementById(id_btn).innerHTML = nombre;
    }
    
}





// verificamos que el agente este desplegado y nos conectamos
function ConnectAgent(){
    //Solo conectamos el agent preguntando si esta desplegado o no
    try{
        var isConnectPrivate;
        let isConnect = Transbank.POS.isConnected;
        let response = fetch("https://localhost:8090/");
        if (response){
            //console.log("online");
            //El Agente se encuentra desplegado
            if (isConnect != true){
                let connect = Transbank.POS.connect();
                console.log("- Agente Conectado Correctamente."); 
                isConnectPrivate = true;
                return isConnectPrivate
            } else {
                // console.log("- Ya estas Conectado al Agente.");   
                showAlerts("- Ya estas Conectado al Agente.","alert-warning","elementsAlertStatus");
                isConnectPrivate = false;
                return isConnectPrivate
            }

        } 
    } catch(error){
        //console.log("Offline");
        //El agente no se encuentra despleagado
        // console.log("- El Agente no se encuentra Despeglado.");
        showAlerts("- El Agente no se encuentra Despeglado.","alert-danger","elementsAlertStatus");
        isConnectPrivate = false;
        return isConnectPrivate

    }    
}

// verificamos que el agente este desplegado y nos conectamos
async function ConnectAgentcall(){
    //Solo conectamos el agent preguntando si esta desplegado o no
    try{
        let isConnect = Transbank.POS.isConnected;
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

// buscamos el puerto del pos y los conectamos 
function ConnectTransbankPosOpenPort(){
    try{
        let isConnect = Transbank.POS.isConnected;
        if (isConnect){
            // const getPort = Transbank.POS.getPorts();  
            Transbank.POS.getPorts().then((getPort)=>{
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
                    // let openPort = Transbank.POS.openPort(valuePortCom);  
                    Transbank.POS.openPort(valuePortCom).then((openPort)=>{
                        if (openPort){
                            console.log("- Conectado con el POS.");   
                            return true
                        }else {
                            console.log("- No se  pudo establecer concexión con el POS."); 
                            showAlerts("- No se  pudo establecer concexión con el POS.","alert-warning","elementsAlertStatus");
                            return false
                        }
                    });  
                   
                } else {
                    showAlerts("- No se encontro ni un POS Conectado.","alert-warning","elementsAlertStatus");
                    disconnectTransbankAgente();
                    return false
                }
            });  
            
        }
    } catch (error){
        showAlerts(error,"alert-danger","elementsAlertStatus");
        console.log("puerto",error);
        if (error === "ACK has not been received in 2000 ms."){
            console.log("  - Renicie el agente y/o reconecte el POS." );
            console.log("  - Problema con la comunicación entre el agente y el dispositivo POS.");
        }
        return false
    }
}
// buscamos el puerto del pos y los conectamos 
async function ConnectTransbankPosOpenPortcall(){
    try{
        let isConnect = Transbank.POS.isConnected;
        if (isConnect){
            const getPort = await Transbank.POS.getPorts();  
            //select 
            if (getPort.length != 0 ){
                let valuePortCom;
                for(let i=0; i<getPort.length; i++){
                    let data_key = Object.keys(getPort[i]); // Genera un array con las keys del diccionario
                    let data_value = getPort[i];
                    for ( x=0 ; x < data_key.length; x++){
                        if(data_key[x] === "path"){
                            valuePortCom = data_value[data_key[x]];
                            break;
                        }
                    }
                }
                let openPort = await Transbank.POS.openPort(valuePortCom);  
                if (openPort){
                    console.log("- Conectado con el POS.");   
                    return true
                }else {
                    console.log("- No se  pudo establecer concexión con el POS."); 
                    showAlerts("- No se  pudo establecer concexión con el POS.","alert-warning","elementsAlertStatus");
                    return false
                }
            } else {
                showAlerts("- No se encontro ni un POS Conectado.","alert-warning","elementsAlertStatus");
                await disconnectTransbankAgente();
                return false
            }
        }
    } catch (error){
        showAlerts(error,"alert-danger","elementsAlertStatus");
        console.log("puerto",error);
        if (error === "ACK has not been received in 2000 ms."){
            console.log("  - Renicie el agente y/o reconecte el POS." );
            console.log("  - Problema con la comunicación entre el agente y el dispositivo POS.");
        }
        return false
    }
}
// cerramos la conexion con el agente
function disconnectTransbankAgente(){
    try{
        let isConnect = Transbank.POS.isConnected;
        if(isConnect === true){
            const disconnect =  Transbank.POS.disconnect();
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
// cerramos el puerto donde se conecto el POS
function closePortTransbanck(){
    try{
        let isPosConnect = Transbank.POS.getPortStatus();
        if (isPosConnect["connected"] === true){
            let closePort = Transbank.POS.closePort();
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
        showAlerts("- "+error,"alert-danger","elementsAlertStatu");
        
    }
}
async function refundTransbank(){
    try{
        let numberOperationPos = $("#numeroOperation").val();
        let isValueOperation = validateNumberInput(numberOperationPos , "Nº de Operación");
        if (!isValueOperation){
            return
        }
        let refundPos = await Transbank.POS.refund(numberOperationPos);

        if (refundPos !=null){
            if(refundPos.responseCode === 0){
                showAlerts("- Anulación: "+refundPos,"alert-success","elementsAlertRefund");
            }else{
                tablaErrorsResponse(parseInt(refundPos.responseCode));
                // showAlerts("- Anulacion Denegada ","alert-danger","elementsAlertRefund");
            }
        } else{
            showAlerts("- La anulción no se pudo llevar acabo.","alert-warning","elementsAlertRefund");
        }
    }catch(error){
        showAlerts("- "+error,"alert-warning","elementsAlertRefund");

    }
}
// Obtenemos una lista de puertos disponibles donde estan los pos
async function GetPortTransbank(){
    try {
        //solo necesita que este conectado al agente
        const ports = await Transbank.POS.getPorts();
        if (ports.length != 0){
            console.log("- Puertos encontrados: ");
            for ( i=0 ; i < ports.length; i++){
                var msj = "     ";
                var msj_port ="";
                let data_key = Object.keys(ports[i]); // Genera un array con las keys del diccionario
                var data_value = ports[i];
                msj += (i+1)+".-"
                for ( x=0 ; x < data_key.length; x++){
                    msj += data_key[x]+"="+data_value[data_key[x]]+", ";
                }
                console.log(msj,true);
            }
        } else {
            console.log("- No se encontraron puertos disponibles.");
        }
        
    } catch (error) {
        let msj = "- "+error;
        console.log(msj);
    }
}
// Cargamos llaves al pos para que este sincronizado con transbank
async function LoadKeyTransbank(){
    //Cabe destacar que por cada venta tambien se sincronizan 
    // las llaves por lo tanto el comando se puede utilizar en una apertura de caja y si se desea comprobar el estado de conexión 
    // con los servidores. 
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
        console.log(error);
        console.log("- "+error);
    }
}
// generamos el detales de ventas del día (se imprime en el pos)
async function GetDetailsTransbankPrint(){
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
    } catch (error) {
        console.log("- "+error);
        showAlerts("- Error Detalle POS: "+error ,"alert-danger","elementsAlertInfo");
    }
}


// generamos la venta sacando los datos de los input correspondientes
async function TransbankVenta() {
    try {   
        let montoPos = $("#montoPos").val();
        let ticketPos = $("#ticketPos").val();
        let isValuemonto = validateNumberInput(montoPos , "Monto");
        if (!isValuemonto) {
            return;
        }
        // Convertir a números
        montoPos = parseInt(montoPos);
        ticketPos = parseInt(ticketPos);
     
        // identificando tablas
        let divtableSuccess =  document.getElementById("elementTableSuccess");
        let divtableDanger =  document.getElementById("elementTableDanger");
       
        // let venta = await Transbank.POS.doSale(montoPos,ticketPos);
        await Transbank.POS.doSale(montoPos,ticketPos).then((result) => {
        
            if (result.responseCode === 0){
                //Consulta sobre si la tabla esta visible o no 
                if (divtableDanger.style.display === "block"){
                    divtableDanger.style.display = "none";
                }
                if(divtableSuccess.style.display === "block"){
                    //En caso de encontrar una tabla visible
                    deleteElementsTable("tableExitosa") // limpiamos el contenido y agregamos el elemento nuevo
                    setTableExitosa(result);
                }else {
                    setTableExitosa(result); // llamaos a crear los elementos
                }
                // Entregamos una alerta 
                showAlerts("¡¡Venta Completada Exitosamente!!.","alert-success","elementsAlertSale");

            }else {
                if (divtableSuccess.style.display === "block"){
                    divtableSuccess.style.display = "none";
                }
                if(divtableDanger.style.display === "block"){
                    deleteElementsTable("tableFallida")
                    setTableFallida(result);
                }else {
                    setTableFallida(result);
                }
                // tablaErrorsResponse(parseInt(result.responseCode));
                // tablaErrorsResponse(parseInt(result.responseCode));
                // setTableFallida(result)
                showAlerts("¡Fallo al intentar la venta!.","alert-danger","elementsAlertSale");


            }
        }).catch( (err) => {
            console.log('Ocurrió un error inesperado', err);
        });
    } catch (error) {
        console.log("- Ejecutar Venta: "+error);
        showAlerts("Error al ejecutar la venta: "+error,"alert-warning","elementsAlertSale");


    }
}

    
async function CloseDayTransbank(){
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
            }else {
                tablaErrorsResponse(parseInt(closeday.responseCode));
            }
            
        }else {
            showAlerts("- Elementos no encontrados.","alert-danger","elementsAlertInfo");

        }
    } catch (error) {
        showAlerts("- "+error,"alert-warning","elementsAlertInfo");
    }
}
// generamos tabla con las ventas del día a detalle
function transbankVentasDetalle(){
    try {
        // let result2 = Transbank.POS.getDetails(false);
        Transbank.POS.getDetails(false).then((result2)=>{
            console.log(result2);
            if (result2.length === 0){
                showAlerts("- No existen ventas para mostrar.", "alert-warning", "elementsAlertInfo")
                return
            }
            let divtabledetalle = document.getElementById("elementTableDetalle");
            let divtablelastsale = document.getElementById("elementTableLastSale");
            if (divtablelastsale.style.display === "block"){
                divtablelastsale.style.display = "none";
            }
            divtabledetalle.style.display = "block";
            console.log(result2);
            var table = document.getElementById("tableDetalle");
            //antes de cargar la tabla eliminamos los elementos antiguos.
            deleteElementsTable('tableDetalle'); 
            for (let y = 0; y <result2.length; y++) {
                console.log("primer element: ",result2[y]);
                let data_key = Object.keys(result2[y]);
                let data_value = result2[y];
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
        }).catch(error)(

        );
    } catch (error) {
        console.log('Error:', error);
        showAlerts(error,"alert-danger","elementsAlertInfo");
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
async function LastSaleTransbank() {
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
        
    } catch (error) {
        console.log("-  "+error);
        showAlerts(error,"alert-danger","elementsAlertInfo");
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

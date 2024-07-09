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

// funcion para agregar label al html en consola
async function printConsoleLog(texto,fecha_disable=false ){
    // funcion para escribir por pantalla los resultados
    let console_log =  document.getElementById("console_log");
    if(console_log.length == null){
        var contador = 0;
    }else {
        var contador = console_log.length;
    }
    if (fecha_disable){
        var textNode = document.createTextNode(texto);
    } else {
        var now = new Date();
        var textNode = document.createTextNode(now.toLocaleString()+" "+texto);
    }
    const label = document.createElement("label");
    const br = document.createElement("br");
    label.id = contador;
    label.appendChild(textNode);
    console_log.appendChild(br);
    console_log.appendChild(label);
    // var divOrder = $("#console_log > div").sort(function (a, b) {
    //     return $(a).data("id") > $(b).data("id");
    // });
    // $("#console_log").html(divOrder);
}
// verificamos que el agente este desplegado y nos conectamos
async function ConnectAgent(){
    //Solo conectamos el agent preguntando si esta desplegado o no
    try{
        let isConnect = Transbank.POS.isConnected;
        let response = await fetch("https://localhost:8090/");
        if (response){
            //console.log("online");
            //El Agente se encuentra desplegado
            if (isConnect != true){
                let connect = await Transbank.POS.connect();
                printConsoleLog("- Agente Conectado Correctamente."); 
                console.log("- Agente Conectado Correctamente.");
            } else {
                printConsoleLog("- Ya estas Conectado al Agente.");   
                console.log("- Ya estas Conectado al Agente.");
            }
        } 
    } catch(error){
        //console.log("Offline");
        //El agente no se encuentra despleagado
        printConsoleLog("- El Agente no se encuentra Despeglado.");
    
    }    
}
// buscamos el puerto del pos y los conectamos 
async function ConectarTransbankPosOpenPort(){
    // Solo conectamos el puerto si esta disponible.
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
                    printConsoleLog("- Conectado con el POS.");   
                    return true
                }else {
                    printConsoleLog("- No se  pudo establecer concexión con el POS."); 
                    return false
                }
            }
            
        }
    } catch (error){
        console.log("puerto",error);
        if (error === "ACK has not been received in 2000 ms."){
            printConsoleLog("  - Problema con la comunicación entre el agente y el dispositivo POS.", true);
            printConsoleLog("  - Renicie el agente y/o reconecte el POS.", true);
        }//else if (error === "Another connect command was already sent and it is still waiting"){
        //     // await ConnectAgent();
        //     // await closePortTransbanck();
        //     // await disconnectTransbankAgente();
        //     printConsoleLog("     - Reconectando y liberando puerto del agente.");
        //     // printConsoleLog("   Renicie el agente y desconecte el puerto", true);
        // }
        return false
    }
}
// cerramos la conexion con el agente
async function disconnectTransbankAgente(){
    try{
        let isConnect = Transbank.POS.isConnected;
        if(isConnect === true){
            const disconnect = await Transbank.POS.disconnect();
            if (disconnect != null){
                // printConsoleLog("- Desconectado del Agente Correctamente.");
                console.log("- Desconectado del Agente Correctamente.");
            } else {
                printConsoleLog("- Problemas en la Comunicación con el Agente.");
            }
        }else {
            // printConsoleLog("- No se encontro ningun Agente conectado.");
            console.log("- No se encontro ningun Agente conectado.");
        }
    } catch (error) {
        printConsoleLog("- salir agente "+error);
    }
}  
// cerramos el puerto donde se conecto el POS
async function closePortTransbanck(){
    try{
        let isPosConnect = await Transbank.POS.getPortStatus();
        if (isPosConnect["connected"] === true){
            let closePort = await Transbank.POS.closePort();
            if(closePort === true){
                printConsoleLog("- Desconectado del POS Correctamente.");
            }else {
                // printConsoleLog("- Problemas en la Comunicación con el POS.");
                console.log("- Problemas en la Comunicación con el POS.");
            }
        }else {
            // printConsoleLog("- No se encontro ningun POS conectado.");
            console.log("- No se encontro ningun POS conectado.");
        }
    }catch (error){
        // printConsoleLog(error);
        console.log("close port "+ error);
    }
}
// generamos una anulacion (solo se puede con credito)
async function refundTransbank(){
    try{
      
        let numberOperationPos = $("#numberOperation").val();
        let refundPos = await Transbank.POS.refund(numberOperationPos);
        if (refundPos !=null){
            if(refundPos.responseCode === 0){
                printConsoleLog("- Anulación: "+refundPos);
            }else{
                tablaErrorsResponse(refundPos.responseCode);
            }
        } else{
            printConsoleLog("La anulción no se pudo llevar acabo.");
        }
        
    }catch(error){
        printConsoleLog(error);
        await salidacatch();
    }
}
// Obtenemos una lista de puertos disponibles donde estan los pos
async function GetPortTransbank(){
    try {
        //solo necesita que este conectado al agente
        const ports = await Transbank.POS.getPorts();
        if (ports.length != 0){
            printConsoleLog("- Puertos encontrados: ");
            for ( i=0 ; i < ports.length; i++){
                var msj = "     ";
                var msj_port ="";
                let data_key = Object.keys(ports[i]); // Genera un array con las keys del diccionario
                var data_value = ports[i];
                msj += (i+1)+".-"
                for ( x=0 ; x < data_key.length; x++){
                    msj += data_key[x]+"="+data_value[data_key[x]]+", ";
                    if(data_key[x] === "COM"){
                        msj_port += data_value[data_key[x]];
                        let option = document.createElement("option"); 
                            option.value = msj_port;
                            option.text = msj_port;
                        select.add(option);
                    }
                }
                printConsoleLog(msj,true);
            }
        } else {
            printConsoleLog("- No se encontraron puertos disponibles.");
        }
        
    } catch (error) {
        let msj = "- "+error;
        printConsoleLog(msj);
        await salidacatch();
    }
}
// Cargamos llaves al pos para que este sincronizado con transbank
async function LoadKeyTransbank(){
    //Cabe destacar que por cada venta tambien se sincronizan 
    // las llaves por lo tanto el comando se puede utilizar en una apertura de caja y si se desea comprobar el estado de conexión 
    // con los servidores. 
    try {
        const loadKey = await Transbank.POS.loadKeys();
        console.log(loadKey);
        if (loadKey != null ){
            if (loadKey["responseCode"] === 0){
                var msj = "";
                console.log("gola ",loadKey["responseCode"]);
                let data_key = Object.keys(loadKey); // Genera un array con las keys del diccionario
                for ( x=0 ; x < data_key.length; x++){
                    if (data_key[x] === "commerceCode"){
                        msj += "Código de comercio: "+loadKey[data_key[x]]+", ";
                    } else if(data_key[x] === "terminalId"){
                        msj += "Terminal ID ="+loadKey[data_key[x]]+".";
                    }
                }
                let out = "- Llaves Cargadas Exitosamente: "+msj;
                printConsoleLog(out);
            }else {
                printConsoleLog("- No se pudo Cargar las llaves.");
                tablaErrorsResponse(parseInt(loadKey["responseCode"]));
            }
        } else {
            printConsoleLog("- No se pudo Cargar las llaves.");
        }
    } catch (error) {
        console.log(error);
        printConsoleLog("- "+error);
        await salidacatch();
    }
}
// funcion poll para ver si se pueden enviar comando al pos     
async function PollTransbank(){
    try{
        const get_poll = await Transbank.POS.poll();
        if (get_poll != null){
            if (get_poll === true){
                printConsoleLog("- Poll: POS Disponible.");
            } else if (get_poll === false) {
                printConsoleLog("- Poll: POS Ocupado."); 
            }
        } else {
            printConsoleLog("- No se pudo generar el poll.");
        }
    } catch (error) {
        printConsoleLog("- "+error);
        await salidacatch();
    }
} 
// obtenemos el total de ventas del día    
async function GetTotalsTransbank(){
    try{
        const Totals = await Transbank.POS.getTotals();
        if (Totals != null){
            printConsoleLog("- Total ventas obtenidos: ");
            var msj = "     ";
            let data_key = Object.keys(Totals); // Genera un array con las keys del diccionario
            for ( x=0 ; x < data_key.length; x++){
                if(data_key[x] === "txCount"){
                    msj +="Nº de Ventas = "+Totals[data_key[x]]+", ";
                }else if(data_key[x] === "txTotal"){
                    msj +="Monto total = "+Totals[data_key[x]]+", ";
                }else if(data_key[x] === "responseMessage"){
                    msj +="Estado  = "+Totals[data_key[x]]+", ";
                }
            }
            printConsoleLog(msj,true);
            
        } else {
            printConsoleLog("- No se pudo generar el Total.");
        }
    } catch (error) {
        printConsoleLog("- "+error);
        await salidacatch();
    }
}
// obtenemos la última venta 
async function LastSaleTransbank(){
    try{
       
        const lastSale = await Transbank.POS.getLastSale();
        if (lastSale["responseCode"] === 0){
            printConsoleLog("- Última venta: ");
            var msj = "     ";
            let data_key = Object.keys(lastSale); // Genera un array con las keys del diccionario
            for ( let x=0 ; x < data_key.length; x++){
                let data = "";
                if(data_key[x] === "commerceCode"){
                    msj += "código de comercio = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "terminalId"){
                    msj += "identificador de terminal = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "responseMessage"){
                    msj += "mensaje de respuesta = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "successful"){
                    msj += "exitosa = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "ticket"){
                    msj += "boleto = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "amount"){
                    msj += "Monto = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "authorizationCode"){
                    msj += "Código de Autorización = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "realDate"){
                    const fechaString = lastSale[data_key[x]];
                    // Divide el string en partes
                    const dia = fechaString.slice(0, 2);
                    const mes = fechaString.slice(2, 4);
                    const ano = fechaString.slice(4, 8);
                    // Devuelve el formato de fecha completo
                    data = `${dia}/${mes}/${ano}`;
                    msj += "Fecha = "+data+", ";
                }else if(data_key[x] === "employeeId"){
                    msj += "ID de empleado = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "sharesNumber"){
                    if (lastSale["cardType"] === "CR"){
                        data = lastSale[data_key[x]];
                    } else {
                        data = "--";
                    }
                    msj += "Número de cuotas = "+data+", ";
                }else if(data_key[x] === "sharesAmount"){
                    if (lastSale["cardType"] === "CR"){
                        data = lastSale[data_key[x]];
                    } else {
                        data = "--";
                    }
                    msj += "Monto de la cuota = "+data+", ";
                }else if(data_key[x] === "last4Digits"){
                    msj += "Últimos 4 dígitos = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "operationNumber"){
                    msj += "número de operación = "+lastSale[data_key[x]]+", ";
                }else if(data_key[x] === "cardType"){
                    // CR: Crédito  | DB: Débito
                    if (lastSale[data_key[x]] === "CR"){
                        msj += "tipo de tarjeta = Crédito, ";
                    }else{
                        msj += "tipo de tarjeta = Débito, ";
                    }
                }else if(data_key[x] === "accountingDate"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (lastSale["cardType"] === "DB"){
                        data = lastSale[data_key[x]];
                    } else {
                        data = "--";
                    }
                    msj += "Fecha de contabilidad = "+data+", ";
                }else if(data_key[x] === "cardBrand"){
                    const iskey = lastSale[data_key[x]] in tarjetas;
                    if (iskey === true){
                        data = tarjetas[lastSale[data_key[x]]];
                    }else{
                        data = lastSale[data_key[x]];
                    }
                    msj += "Tarjeta ="+data+", ";
                }else if(data_key[x] === "commerceProviderCode"){
                    msj += "Código de proveedor = "+lastSale[data_key[x]];
                }else if(data_key[x] === "accountNumber"){
                    //Se utiliza solo con ventas Débito (Opcional)
                    if (lastSale["cardType"] === "DB"){
                        data = lastSale[data_key[x]];
                    } else {
                        data = "--";
                    }
                    msj += "Número de cuenta = "+data +", ";
                }else if(data_key[x] === "realTime"){
                    const numeroString = lastSale[data_key[x]];
                    // Divide el string en partes de dos caracteres
                    const horas = numeroString.slice(0, 2);
                    const minutos = numeroString.slice(2, 4);
                    const segundos = numeroString.slice(4, 6);

                    // Devuelve el formato de hora completo
                    data = `${horas}:${minutos}:${segundos}`;
                    msj += "Hora = "+data+", ";
                }
            }
            printConsoleLog(msj,true);
        } else {
            printConsoleLog("- No se pudo encontrar la última venta.");
        }
        
    } catch (error) {
        printConsoleLog("- "+error);        
        await salidacatch();
    }
}
// cerramos día 
async function CloseDayTransbank(){
    try{
        const closeday = await Transbank.POS.closeDay();
        printConsoleLog("- Cierre de día: ");
        if (closeday != null){
            var msj = "     ";
            let data_key = Object.keys(closeday); // Genera un array con las keys del diccionario
            for (let x=0 ; x < data_key.length; x++){
                if(data_key[x]== "terminalId"){
                    msj += "La Terminal ID ="+closeday[data_key[x]]+", "
                }else if(data_key[x]== "commerceCode"){
                    msj += "Con código de comercio ="+closeday[data_key[x]]+", Procede a Cerrar Caja."
                }
            }
            printConsoleLog(msj,true);
        
        }else {
            printConsoleLog("- No se pudo generar el cierre del día.");
        }
    } catch (error) {
        printConsoleLog("- "+error);
        await salidacatch();
    }
}
// generamos el detalle de las ventas del día y lo imprimo en consola
async function GetDetailsTransbank(){
    try{
        //getDetails(False) => not print POS
        //solo se puede pedir una vez despues de una acción 
        //Si se realiza la impresión, la caja recibirá una lista vacía de transacciones.
        
        await Transbank.POS.getDetails(false).then((details) =>{
            if (details != null) {
                printConsoleLog("- Lista de ventas: ");
                for ( i=0 ; i < details.length; i++){
                    let msj = "     ";
                    let data_key = Object.keys(details[i]); // Genera un array con las keys del diccionario
                    var data_value = details[i];
                    msj += "Venta Nº-"+(i+1)+": "
                    for ( x=0 ; x < data_key.length; x++){
                        let data = "";
                        if(data_key[x] === "commerceCode"){
                            msj += "código de comercio = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "terminalId"){
                            msj += "identificador de terminal = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "responseMessage"){
                            msj += "mensaje de respuesta = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "successful"){
                            msj += "exitosa = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "ticket"){
                            msj += "boleto = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "amount"){
                            msj += "Monto = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "authorizationCode"){
                            msj += "Código de Autorización = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "realDate"){
                            const fechaString = data_value[data_key[x]]+", ";
                            // Divide el string en partes
                            const dia = fechaString.slice(0, 2);
                            const mes = fechaString.slice(2, 4);
                            const ano = fechaString.slice(4, 8);
                            // Devuelve el formato de fecha completo
                            data = `${dia}/${mes}/${ano}`;
                            msj += "Fecha = "+data+", ";
                        }else if(data_key[x] === "employeeId"){
                            msj += "ID de empleado = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "sharesNumber"){
                            if (data_value["cardType"] === "CR"){
                                let data = data_value[data_key[x]];
                            } else {
                                let data = "--";
                            }
                            msj += "Número de cuotas = "+data+", ";
                        }else if(data_key[x] === "sharesAmount"){
                            if (data_value["cardType"] === "CR"){
                                let data = data_value[data_key[x]];
                            } else {
                                let data = "--";
                            }
                            msj += "Monto de la cuota = "+data+", ";
                        }else if(data_key[x] === "last4Digits"){
                            msj += "Últimos 4 dígitos = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "operationNumber"){
                            msj += "número de operación = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "cardType"){
                            // CR: Crédito  | DB: Débito
                            if (data_value[data_key[x]] === "CR"){
                                msj += "tipo de tarjeta = Crédito, ";
                            }else{
                                msj += "tipo de tarjeta = Débito, ";
                            }
                        }else if(data_key[x] === "accountingDate"){
                            //Se utiliza solo con ventas Débito (Opcional)
                            if (data_value["cardType"] === "DB"){
                                let data = data_value[data_key[x]];
                            } else {
                                let data = "--";
                            }
                            msj += "Fecha de contabilidad = "+data+", ";
                        }else if(data_key[x] === "cardBrand"){
                            const iskey = data_value[data_key[x]] in tarjetas;
                            if (iskey === true){
                                let data = tarjetas[data_value[data_key[x]]];
                            }else{
                                let data = data_value[data_key[x]];
                            }
                            msj += "Tarjeta ="+data+", ";
                        }else if(data_key[x] === "commerceProviderCode"){
                            msj += "Código de proveedor = "+data_value[data_key[x]]+", ";
                        }else if(data_key[x] === "accountNumber"){
                            //Se utiliza solo con ventas Débito (Opcional)
                            if (data_value["cardType"] === "DB"){
                                let data = data_value[data_key[x]];
                            } else {
                                let data = "--";
                            }
                            msj += "Número de cuenta = "+data+", ";
                        }else if(data_key[x] === "realTime"){
                            const numeroString = data_value[data_key[x]];
                            // Divide el string en partes de dos caracteres
                            const horas = numeroString.slice(0, 2);
                            const minutos = numeroString.slice(2, 4);
                            const segundos = numeroString.slice(4, 6);

                            // Devuelve el formato de hora completo
                            let data = `${horas}:${minutos}:${segundos}`;
                            msj += "Hora = "+data+", ";
                        }
                    }
                    printConsoleLog(msj,true);
                }
                if (details.length === 0){
                    printConsoleLog("- No Existen Registros de Ventas para mostrar.");
                }
            
            }else {
                printConsoleLog("- No se pudo generar el detalle de las ventas.");
            }
        });
        
    } catch (error) {
        printConsoleLog("- "+error);
        await salidacatch();
    }
}
// generamos el detales de ventas del día (se imprime en el pos)
async function GetDetailsTransbankPrint(){
    try{
        //getDetails(True) =>  print POS
        //solo se puede pedir una vez despues de una acción 
        //Esto solo devuelve un Objeto vacío
        let details = await Transbank.POS.getDetails(true);
        if (details != null) {
            printConsoleLog("- Lista de ventas: Emitida en le POS.");
        }else {
            printConsoleLog("- No se pude generar el detalle de las ventas.");
        }
    } catch (error) {
        printConsoleLog("- "+error);
        await salidacatch();
    }
}

// generamos la venta sacando los datos de los input correspondientes
async function TransbankVenta() {
    try {   


        let montoPos = $("#montoPos").val();
        let ticketPos = $("#ticketPos").val();
        // Convertir a números
        montoPos = parseInt(montoPos);
        ticketPos = parseInt(ticketPos);

        // let venta = await Transbank.POS.doSale(montoPos,ticketPos);
        await Transbank.POS.doSale(montoPos,ticketPos).then((result) => {
            if (result.responseCode === 0){
                 setTableExitosa(result);
            }else {
                 tablaErrorsResponse(parseInt(result.responseCode));
                 setTableFallida(result)
            }
        }).catch( (err) => {
            console.log('Ocurrió un error inesperado', err);
        });
    } catch (error) {
        console.log('Error:', error);
        printConsoleLog("- Ejecutar Venta: "+error);
        await salidacatch();
    }
}
// generamos tabla con las ventas del día a detalle
async function transbankVentasDetalle() {
    try {
        let result2 = await Transbank.POS.getDetails(false);
        console.log(result2);
        var table = document.getElementById("table_venta_detalle");
        //antes de cargar la tabla eliminamos los elementos antiguos.
        deleteElementsTable('table_venta_detalle'); 
        for (let y = 0; y <result2.length; y++) {
            let data_key = Object.keys(result2[y]);
            let data_value = result2[y];
            if (data_value.length === 0){
                printConsoleLog("- No Existen Registros de Ventas para mostrar.");
                break
            }
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
        }
    } catch (error) {
        console.log('Error:', error);
        printConsoleLog("-  "+error);
    }
}
// generamos tabla de ventas exitosa
async function setTableExitosa(result) {
    try{
        let table = document.getElementById("table_venta_exitosa");
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
                row2.appendChild(td);
                bandera = false;
            }
        } 
        tbody.appendChild(row2);
    } catch (error){
        console.log('Error:', error);
        printConsoleLog("- Error Set Table Existosa: "+error);
        
    }
}
// generamos tabla de ventas fallidads
async function setTableFallida(result) {
    try{
        var table = document.getElementById("table_venta_fallida");
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
                row2.appendChild(td);
                bandera = false;
            }
        } 
        tbody.appendChild(row2);
    } catch (error){
        console.log('Error:', error);
        printConsoleLog("- Error Set Table Fallida: "+error);
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
// Imprimimos el error de la tabla en la consola
async function tablaErrorsResponse(errorCode){
    let isCode = errorCode in responseCodesPos;
    if (isCode === true){
        let msj ="";
        if (errorCode === 3){ // pedir verificar cable de red -> 3
            msj = "- Verifique el Cable de red del POS.";
        }else if (errorCode === 22){ // timepo de espera  -> 22
            msj = "- Tiempo de espera Máximo alcanzado.";
        }else if (errorCode === 25){// verifique la fechas -> 25
            msj = "- Verificar las Fechas.";
        }else if (errorCode === 26){// cargar las llaves ->26
            printConsoleLog(responseCodesPos[errorCode]);
            LoadKeyTransbank();
        }else if (errorCode === 27){ // solicitar actualizar el pos -> 27
            msj = "- Verificar si hay Actualizaciones en le POS.";
        }else {
            msj = responseCodesPos[errorCode];
        }
        printConsoleLog(msj);
    }
}

// ejecutamos las demas funciones sin dejar que el usuario de conecte al agente y al pos
async function llamadoDeAcciones(llamada, id_btn){
    try{
        var nombre =  document.getElementById(id_btn).innerHTML;
        document.getElementById(id_btn).disabled = true;
        document.getElementById(id_btn).innerHTML="Enviando...";

        const isConnect = await Transbank.POS.isConnected;
        if (isConnect === false){
            await ConnectAgent();
            const isPosConnect = await Transbank.POS.getPortStatus();
            if (isPosConnect["connected"] === false){
                let isPort = await ConectarTransbankPosOpenPort();
                if (isPort === true){
                    //si la funcion se demora mucho bugea al agente 
                    // Agregar registros para cada llamada específica
                    switch(llamada) {
                        case 1:
                            await GetPortTransbank();//lista de puertos
                            break;
                        case 2:
                            await LoadKeyTransbank();//carga de llaves
                            break;
                        case 3:
                            await PollTransbank(); //poll
                            break;
                        case 4:
                            await GetTotalsTransbank();//obtener total de las ventas
                            break;
                        case 5:
                            await LastSaleTransbank(); //última venta
                            break;
                        case 6:
                            await CloseDayTransbank();//cierre de día
                            break;
                        case 7:
                            await GetDetailsTransbank();//detalles de las ventas sin papel
                            break;
                        case 8:
                            await GetDetailsTransbankPrint();//detalles de las ventas por el pos
                            break;
                        case 9:
                            await transbankVentasDetalle();//detalles de las ventas en una tabla
                            break;
                        case 10:
                            await refundTransbank();//cancelar una venta
                            break;
                        case 11:
                            await TransbankVenta();//hacer una venta
                            break;
                        default:
                            printConsoleLog(`Llamada no válida: ${llamada}`);
                    }
                    await closePortTransbanck();
                    await disconnectTransbankAgente();
                } else {
                    await disconnectTransbankAgente();

                }
            }else{
                printConsoleLog("- El POS se encuentra en uso.");
                await disconnectTransbankAgente();
            }
        } else{
            printConsoleLog("- El agente se encuentra en uso.");
        }
    }catch (error){
        printConsoleLog("Funcion principal "+error);
        await closePortTransbanck();
        await disconnectTransbankAgente();
    } finally{
        document.getElementById(id_btn).disabled = false;
        document.getElementById(id_btn).innerHTML = nombre;
    }
    
}

async function salidacatch(){
    const isPosConnect = Transbank.POS.getPortStatus();
    if (isPosConnect["connected"] === true){
        await closePortTransbanck();
    }
    const isConnect = Transbank.POS.isConnected;
    if (isConnect === true  ){
        await disconnectTransbankAgente();
    }
}



function deshabilitar_btnEnviar(elemento){
    let nombre =  document.getElementById(elemento).innerHTML;
    setTimeout(function() {
    document.getElementById(elemento).disabled = true;
    document.getElementById(elemento).innerHTML="Enviando...";
    }, 3000);
    document.getElementById(elemento).innerHTML = nombre;
}
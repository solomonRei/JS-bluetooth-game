const button = document.getElementsByClassName('button')[0]

function processData(splitRows) {

    if (splitRows[0] == "1" || splitRows[0] === "0") {
        if ((splitRows[1] >= 0 && splitRows[1] <= 1024) && (splitRows[2] >= 0 && splitRows[2] <= 1024)) {
            console.log(splitRows);
            myAsyncFunction(splitRows)
            return splitRows;
        }
    }
    return false;
}

async function connectToBluetooth() {
    let device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }]
    });

    let server = await device.gatt.connect();
    let service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
    let characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

    return {device, server, service, characteristic};
}

async function getDataFromBluetoothModule(data, status=0) {
    try {
        // await data.characteristic.writeValue(new TextEncoder().encode("5"));
        await data.characteristic.startNotifications();

        if(status===1) {
            await data.characteristic.writeValue(new TextEncoder().encode("5"));
        }
        if(status===2) {
            await data.characteristic.writeValue(new TextEncoder().encode("6"));
        }


        const rows = [];
        data.characteristic.addEventListener('characteristicvaluechanged', event => {
            let data = new Uint8Array(event.target.value.buffer);
            let stringData = String.fromCharCode(...data);

            console.log(stringData);
            if (stringData.endsWith("%") && stringData.length >= 15) {
                let replacedRows = stringData.replace(/\r\n|\r|\n|\%/g, "");
                let splitRows = stringData.split(" ");
                if (splitRows.length === 5) {
                    const processedData = processData(splitRows)
                }
            } else {
                if (rows.length === 0) {
                    rows.push(stringData);
//              console.log('0: ', rows);
                } else if (rows.length === 1) {
                    rows.push(stringData);
//              console.log('1: ', rows);
                }
//          console.log(rows);
                if (rows.length === 2) {
                    let combinedRows = rows[0] + rows[1];
                    let replacedRows = combinedRows.replace(/\r\n|\r|\n|\%/g, "");
                    let splitRows = replacedRows.split(" ");


                    if (splitRows.length === 5) {
                        const processedData = processData(splitRows)
                    } else {
                        combinedRows = rows[1] + rows[0];
                        console.log('2:', combinedRows);
                        replacedRows = combinedRows.replace(/\r\n|\r|\n|\%/g, "");
                        splitRows = replacedRows.split(" ");

                        if (splitRows.length === 5) {
                            const processedData = processData(splitRows)
                        }
                    }

                    rows.length = 0;
                    // console.log('Array-len: ', rows.length)
                }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

let scripts = [];
let isButtonClicked = false;

async function loadScript(src) {
    if (scripts.includes(src)) {
        return;
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            scripts.push(src);
            resolve(src);
        };
        script.onerror = () => reject(new Error("Script load error for ${src}"));
        document.head.append(script);
    });
}


//   document.getElementById("myButton").addEventListener("click", function(){
//     isButtonClicked = true;
//     scripts = [];
//     myAsyncFunction();
//     isButtonClicked = false;
//   });

async function myAsyncFunction(param) {
    await loadScript('./js/code.js');
    updateVar(param)
}

async function sendDataToArduino() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }]
        });

        const server = await device.gatt.connect();
        let service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        let characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        console.log('Sending message');
        await characteristic.writeValue(new TextEncoder().encode("5"));
    } catch (error) {
        console.error(error);
    }
}

const connectButton = document.querySelector("#connectButton");
//   const sendButton = document.querySelector("#sendButton");
connectButton.style.display = "block";
var dataB;
connectButton.addEventListener("click", async () => {
    dataB = await connectToBluetooth();
    await getDataFromBluetoothModule(dataB)
});

// sendButton.addEventListener("click", async () => {
//     await getDataFromBluetoothModule(dataB, 2)
//   });



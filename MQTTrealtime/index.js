var ctx = document.getElementById("chart").getContext("2d");

var myChart;

var options = {
    responsive: true,
    scales: {
        yAxes: [ {
            ticks: {}
        } ]
    }
};

var datasets = [];

var mqttBroker = "192.168.0.55";

var mqttPort = 8083;

var clientId = "mqttClient" + parseInt(Math.random() * 100, 10);

var client;

var reconnectTimeout = 2e3;

var subscription = "/device/+/flx/+/+";

function mqttConnect() {
    client = new Paho.MQTT.Client(mqttBroker, mqttPort, "", clientId);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({
        onSuccess: onConnect
    });
}

function onConnect() {
    if (subscription !== undefined) {
        client.subscribe(subscription);
    }
}

function onConnectionLost(responseObj) {
    setTimeout(mqttConnect, reconnectTimeout);
    if (responseObj.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObj.errorMessage);
    }
}

function onMessageArrived(mqttMsg) {
    var topic = mqttMsg.destinationName.split("/");
    var type = topic[topic.length - 2];
    var phase = topic[topic.length - 1];
    var label = type + "_L" + phase;
    var payload = mqttMsg.payloadString;
    var idx;
    try {
        payload = JSON.parse(payload);
    } catch (error) {
        console.log("Error parsing JSON");
        return;
    }
    if (payload[2] === "mV") {
        for (var i = 0; i < payload[1].length; i++) {
            payload[1][i] /= 1e3;
        }
        payload[2] = "V";
    }
    var index = -1;
    for (idx = 0; idx < datasets.length; idx++) {
        if (datasets[idx].label === label) index = idx;
    }
    if (index === -1) {
        var red = Math.floor(Math.random() * 255);
        var green = Math.floor(Math.random() * 255);
        var blue = Math.floor(Math.random() * 255);
        dataset = {
            label: label,
            fill: false,
            borderColor: "rgba(" + red + "," + green + "," + blue + ",1)",
            data: payload[1]
        };
        datasets.push(dataset);
    } else {
        datasets[index].data = payload[1];
    }
    displayGraph(datasets);
}

function displayGraph(datasets) {
    if (myChart === undefined) {
        var labels = [];
        for (var i = 0; i < 32; i++) labels.push(i);
        data = {
            labels: labels,
            datasets: datasets
        };
        myChart = new Chart(ctx, {
            type: "line",
            data: data,
            options: options
        });
    }
    myChart.data.datasets = datasets;
    myChart.update();
}

mqttConnect();
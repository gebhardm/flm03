var ctx = document.getElementById("graph").getContext("2d");

var myChart;

var options = {
    responsive: true,
    scales: {
        yAxes: [ {
            ticks: {}
        } ]
    }
};

var mqttBroker = "192.168.0.55";

var mqttPort = 8083;

var clientId = "mqttClient" + parseInt(Math.random() * 100, 10);

var client;

var reconnectTimeout = 2e3;

function mqttConnect() {
    client = new Paho.MQTT.Client(mqttBroker, mqttPort, "", clientId);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({
        onSuccess: onConnect
    });
}

function onConnect() {
    client.subscribe("/device/+/flx/current/+");
}

function onConnectionLost(responseObj) {
    setTimeout(mqttConnect, reconnectTimeout);
    if (responseObj.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObj.errorMessage);
    }
}

function onMessageArrived(mqttMsg) {
    var msg = {};
    var payload, phase, topic;
    topic = mqttMsg.destinationName.split("/");
    phase = topic[topic.length - 1];
    payload = mqttMsg.payloadString;
    try {
        payload = JSON.parse(payload);
    } catch (error) {
        console.log("Error parsing JSON");
        return;
    }
    if (payload[2] === "mV") {
        var series = payload[1];
        for (var val in series) series[val] = series[val] / 1e3;
        payload[2] = "V";
    }
    msg = {
        phase: phase,
        data: payload[1]
    };
    displayGraph(msg);
}

function displayGraph(msg) {
    if (myChart === undefined) {
        data = {
            labels: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32 ],
            datasets: [ {
                label: "L1",
                fill: false,
                borderColor: "#f00",
                data: msg.data
            }, {
                label: "L2",
                fill: false,
                borderColor: "#0f0",
                data: msg.data
            }, {
                label: "L3",
                fill: false,
                borderColor: "#00f",
                data: msg.data
            } ]
        };
        myChart = new Chart(ctx, {
            type: "line",
            data: data,
            options: options
        });
    } else {
        myChart.data.datasets[msg.phase - 1].data = msg.data;
        myChart.update();
    }
}

mqttConnect();

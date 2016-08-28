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

var mqttBroker = "192.168.0.55";

var mqttPort = 8083;

var clientId = "mqttClient" + parseInt(Math.random() * 100, 10);

var client;

var reconnectTimeout = 2e3;

var subscription = "/device/+/flx/current/+";

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
                data: []
            }, {
                label: "L2",
                fill: false,
                borderColor: "#0f0",
                data: []
            }, {
                label: "L3",
                fill: false,
                borderColor: "#00f",
                data: []
            } ]
        };
        myChart = new Chart(ctx, {
            type: "line",
            data: data,
            options: options
        });
    }
    myChart.data.datasets[msg.phase - 1].data = msg.data;
    myChart.update();
}

function handleSel(sel) {
    if (subscription != sel.value && subscription !== undefined) {
        if (client !== undefined) {
            client.unsubscribe(subscription);
            client.subscribe(sel.value);
        }
    }
    subscription = sel.value;
}

mqttConnect();

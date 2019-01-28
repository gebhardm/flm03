/*
The MIT License (MIT)

Copyright (c) 2016 Markus Gebhard <markus.gebhard@web.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
"use strict";

var PanelCtrl = function($scope) {
    $scope.debug = false;
    $scope.alerts = [];
    $scope.sensors = [];
    $scope.message = "";
    $scope.msgCollapsed = false;
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    // FLM port configuration
    var flx;
    // FluksoKube config
    var kube;
    // initialize panel
    var client;
    var reconnectTimeout = 2e3;
    var broker = location.hostname;
    var port = 8083;
    var sensors = [];
    // connectivity
    function mqttConnect() {
        var wsID = "FLM" + parseInt(Math.random() * 100, 10);
        client = new Paho.MQTT.Client(broker, port, "", wsID);
        var options = {
            timeout: 3,
            onSuccess: onConnect,
            onFailure: function(message) {
                setTimeout(mqttConnect, reconnectTimeout);
            }
        };
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;
        client.connect(options);
    }
    function onConnect() {
        client.subscribe("/device/+/config/flx");
        client.subscribe("/device/+/config/kube");
        client.subscribe("/device/+/config/sensor");
        client.subscribe("/sensor/+/gauge");
        client.subscribe("/sensor/+/counter");
    }
    function onConnectionLost(responseObj) {
        setTimeout(mqttConnect, reconnectTimeout);
        if (responseObj.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObj.errorMessage);
        }
    }
    function onMessageArrived(mqttMsg) {
        var topic = mqttMsg.destinationName.split("/");
        if (topic[3] !== "query") var payload = mqttMsg.payloadString; else return;
        switch (topic[1]) {
          case "device":
            handle_device(topic, payload);
            break;

          case "sensor":
            handle_sensor(topic, payload);
            $scope.$apply(function() {
                $scope.sensors = sensors;
                $scope.message = mqttMsg.destinationName + ", " + payload;
            });
            break;

          default:
            break;
        }
    }
    function handle_device(topic, payload) {
        var config = JSON.parse(payload);
        switch (topic[4]) {
          case "flx":
            flx = config;
            break;

          case "kube":
            kube = config;
            break;

          case "sensor":
            for (var obj in config) {
                var cfg = config[obj];
                if (cfg.enable == "1") {
                    var sensorId = cfg.id;
                    var sensor = sensors.filter(function(s) {
                        return s.id == sensorId;
                    });
                    if (sensor[0] === undefined) {
                        sensor = {};
                        sensor.id = cfg.id;
                        if (cfg.port !== undefined) sensor.port = cfg.port[0];
                        if (cfg.type !== undefined) sensor.type = cfg.type;
                        if (cfg.subtype !== undefined) sensor.subtype = cfg.subtype;
                        sensors.push(sensor);
                        sensor = sensors[sensors.length - 1];
                    }
                    if (flx !== undefined) {
                        if (flx[cfg.port] !== undefined) {
                            if (cfg.subtype !== undefined) {
                                sensor.name = flx[cfg.port].name + " " + cfg.subtype;
                            } else {
                                sensor.name = flx[cfg.port].name;
                            }
                        }
                    }
                    if (kube !== undefined && cfg.kid !== undefined) {
                        sensor.name = kube[cfg.kid].name + " " + cfg.type;
                        sensor.kid = cfg.kid;
                    }
                }
            }
            break;
        }
    }
    function handle_sensor(topic, payload) {
        var msgType = topic[3];
        var sensorId = topic[2];
        var value = JSON.parse(payload);
        var sensor = {};
        var sIndex = sensors.filter(function(s) {
            return s.id == sensorId;
        });
        if (sIndex[0] === undefined) {
            sensor.id = sensorId;
            sensor.name = sensorId;
            sensors.push(sensor);
            sensor = sensors[sensors.length - 1];
        } else sensor = sIndex[0];
        switch (msgType) {
          case "gauge":
            if (value.length === undefined) {
                sensor.gaugevalue = value;
                sensor.gaugeunit = "";
                sensor.gaugetimestamp = "";
            } else {
                switch (value.length) {
                  case 1:
                    sensor.gaugevalue = value[0];
                    sensor.gaugeunit = "";
                    sensor.gaugetimestamp = "";
                    break;

                  case 2:
                    sensor.gaugevalue = value[0];
                    sensor.gaugeunit = value[1];
                    sensor.gaugetimestamp = "";
                    break;

                  case 3:
                    var date = new Date(value[0] * 1e3);
                    var now = new Date().getTime();
                    if (now / 1e3 - value[0] > 60) value[1] = 0;
                    sensor.gaugevalue = value[1];
                    sensor.gaugeunit = value[2];
                    sensor.gaugetimestamp = date.toLocaleString();
                    break;

                  default:
                    break;
                }
            }
            // round to three digits
            sensor.gaugevalue = Math.round(sensor.gaugevalue * 1e3) / 1e3;
            // create and fill an array of last n gauge values
            if (sensor.series === undefined) {
                sensor.series = new Array();
            }
            if (sensor.series.length == 60) sensor.series.shift();
            sensor.series.push(sensor.gaugevalue);
            break;

          case "counter":
            sensor.countertimestamp = new Date(value[0] * 1e3).toLocaleString();
            sensor.countervalue = Math.round(value[1] * 1e3) / 1e6;
            sensor.counterunit = "k" + value[2];
            break;

          default:
            break;
        }
        $("#sparkline" + sensor.id).sparkline(sensor.series, {
            type: "line",
            width: "200",
            height: "50",
            tooltipFormat: '<span class="text-info bg-info">{{x}}:{{y}}</span>'
        });
        if (sensor.countervalue === undefined) sensor.countervalue = "";
    }
    mqttConnect();
};

// the part of the AngularJS application that handles the panel
PanelCtrl.$inject = [ "$scope" ];

angular.module("flmUiApp").controller("PanelCtrl", PanelCtrl);
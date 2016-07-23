This document collects information on MQTT messages provided by the Fluksometer v03E; refer to [flukso.net](http://flukso.net).

Note: MQTT topics of FLM02 and FLM03 are INCOMPATIBLY different; thus, currently existing subscription functionality (at least that provided by me) is NOT working out-of-the-box; depending on my investigations I will decide on how to adapt.


# Device topics
Device topics of the Fluksometer start with ```/device/<device_id>/```.
## Configuration
The configuration topics ```/device/+/config/``` provides three distinct sub-topics, ```flx```, ```kube```, and ```sensor```. As payload a JSON object is sent that in the following is described in more detail.
### flx
The ```flx``` topic provides as payload the basic configuration of sensors attached to the Fluksometer. Eight properties give insight in the sensor configuration as set in the sensor configuration page, plus a ```main``` property. The sensor properties are an enumeration of the ports 1 to 7 with value an object setting the respective sensor parameters:

	"ENUM": {
		enable: 1|0,
		class: "ct"|"pulse"|"uart",
		name: "<sensor name>",
		shift: 0,
		current: 50|100|500,
		constant: <pulse constant>,
		uart_tx_invert: 0|1,
		dsmr: 4,
		uart_rx_invert: 0|1
	}
	
Note that value properties vary with the sensor class, for example the uart and dsmr is sent for the uart port only.

The "last" property is the ```main``` property, defining the LED mode and current clamp setup.

	main: {
		led_mode: 255,
		phase: "3p+n",
		theta: 130
	}
### kube
The ```kube``` topic contains information on the paired FluksoKubes. By default, without paired Kube, it contains only a ```main```-property:

    "main": {
        "encryption": 0,
        "max_nodes": 30,
        "pair_group": 212,
        "null_key": "0123456789abcdef0123456789abcdef",
        "cache": "/usr/share/kube",
        "collect_group": 192,
        "key": "<some_guid>"
    }
### sensor
The ```sensor``` topic contains the actual sensor configuration which enumerates to up to 128 different types of information plus configuration of tmpo, mqtt, and daemon. With just three current clamps attached, there are already 39 different types of values available. Non-assigned sensor data provides the sensor ``ìd```only.

	"ENUM": {
    	"type": "electricity",
    	"subtype": "pplus"|"pminus"|"q1"|"q2"|"q3"|"q4"|"vrms"|"irms"|"pf"|"vthd"|"ithd"|"alpha",
    	"id": "<sensor_id>",
    	"enable": 1,
    	"rid": 0,
    	"port": [
        	<port_number>
    	],
    	"data_type": "counter"|"gauge"
	},

	tmpo: {
		root: "/flukso/"
	},
	
	mqtt: {
		"bridge_restart_timeout": 30,
    	"bridge_address": "api.flukso.net",
    	"bridge_port": 8883,
    	"bridge_keepalive": 60
	},
	
	daemon": {
    	"cacert": "/etc/ssl/certs/flukso.ca.crt",
    	"upgrade_url": "http://www.flukso.net/files/upgrade/",
    	"wan_base_url": "https://api.flukso.net/"
	}

## Device sensor sampling
### flx
The "sensor sampling" topic ```/device/<device_id>/flx/+/+``` provides information on current and voltage sampled from the current clamps as a JSON array

	/device/<device_id>/flx/voltage/<sensor_ENUM> [[<timestamp>,500],[<comma separated list of 32 sampling values>],"mV"]
	/device/<device_id>/flx/current/<sensor_ENUM> [[<timestamp>,500],[<comma separated list of 32 sampling values>],"mA"]
	
This needs some further investigation, especially as it provides quite high traffic.

### flx/time
There is a ```/device/<device_id>/flx/time``` topic which seems to provide information on the reference between the base device's and the sensor board's time used for sampling.

	 {
	 	flm: {
	 		time:[<timestamp>,12369],
	 		update:false
	 	},
	 	flx:{
	 		time:[<timestamp>,0],
	 		update:false
	 	}
	 }

# Sensor topics
As with the Fluskometer version 2, there are also sensor gauge and counter topics provided by the FLM03.
## Gauges
The topics ```/sensor/<sensor_id>/gauge``` provides gauge values of the respective sensor in the "known" way, as a JSON array with timestamp, value, and unit; new are units "VAR", "V", and "A".

	/sensor/<sensor_id>/gauge [<timestamp>, <decimal value with three digits>, "<unit>"]


## Counters
In analogy to the gauges, the counter topic ```/sensor/<sensor_id>/counter``` delivers counter values of the respective sensor collected as "Wh" and "VARh".

	/sensor/<sensor_id>/counter [<timestamp>, <decimal vlaue with three digits>, "unit"]
	
## TMPO
For synchronizing readings with the Flukso website, the FLM publishes a ```tmpo``` topic, transferring readings as a gzipped payload

	/sensor/<sensor_id>/tmpo/<rid>/<level/<block_id>/gz <gzipped tmpo object>
	
Refer to the [TMPO retrieval info](https://github.com/gebhardm/energyhacks/tree/master/Flukso/tmpo) for further details.
# The Fluksometer Manual

Author: Bart Van Der Meerssche<br>
Markdown/additions/FLM03: Markus Gebhard

## Introduction

Let's kick off this manual with a short tour of a Fluksometer's externals. We will introduce each of the Fluksometer's ports, buttons and LEDs.

The present version of the Fluksometer is version 3E, which is the subject to this manual; for older versions please refer to the corresponding documentation.

- Version 3E, denoted as **FLM03E**, serves up to three analog current clamps, has three pulse inputs and a serial connector. It also includes a 868MHz transceiver serving the FluksoKubes.
- A specialty of the FLM03E is its dedicated AC power supply that also serves as source of mains voltage and phasing.

### Ports
The screw terminal contains fourteen inputs. A **port** on the screw terminal is defined as a **pair of adjacent inputs**. We have printed the port numbers on the side of the enclosure for easy reference, with the polarity denoted by \+ and \-. Ports \#1 to \#3 are analog ports that are tuned to accept Flukso split-core current clamps. Ports \#4 to \#6 can be used for detecting pulses. This includes support for, but is not limited to, the S0 interface (S0 is an open-collector interface standardized in DIN EN 62053-31) common to DIN-rail energy meters (for gas and water measurement you may also use a simple reed switch toggled by a magnet built into the meter; another alternative is [optical detection](#optical-sensors)). Finally, the port \#7 offers serial connection to a P1 data port, as it is provided by Benelux smart meters.

Note that the Flukso split-core current clamps provide a well-defined impedance ("inner resistance") which must fit to the sensor board's input setup; therefore it is not possible to attach "any kind of" current clamp. Also the clamps are used to determine the phasing of the respective current measured, thus require a dedicated speed of operation.

Note: There are new meters out in the wildlife that contain so called Cyble targets (little metal plate on a spinning wheel) which are inductively detected; currently the Fluksometer does not support this kind of measuring devices, if not provided as a pulse output as described (original detector or potentially also an [optical sensor](#optical-sensors)).

### Ethernet
The two ethernet ports, labeled with WAN and LAN, offer support for a 10baseT/100baseTx interface with auto-negotiation and auto MDI/MDI-X crossover detection. In factory setup the WAN port is meant to connect to the Internet, while the LAN port is meant to be connected to a local computer for configuration purposes.

### Power Jack
The center-positive power jack accepts an AC/DC voltage between 9V and 15V. The switching adapter should have a minimum rating of 500mA output current. Note: For voltage measurements the delivered power supply is mandatory.

### Pushbutton
The pushbutton has a triple function. Which function will be triggered depends on how long the button is pressed. Make sure the heartbeat LED is blinking before using the button.

Mode | Description
--- | ---
**Toggle reporting mode** | If you press the button for 2 to 5 seconds, the Fluksometer will toggle its reporting mode to the Flukso server from wifi to ethernet or vice-versa. A blinking wifi LED indicates the Fluksometer is in wifi mode. An always-off wifi LED means it's in ethernet mode.
**Restore networking defaults** | If you press the button between 10 and 30 seconds, the Fluksometer will restore its default network settings.
**Restore firmware** | Keep the button pressed for between 60 and 120 seconds to restore the Fluksometer's stock firmware and reboot. You will have to reconfigure all network and sensor settings. Connect to the local web interface after the heartbeat LED starts blinking again.

### LEDs
The Fluksometer has six red LEDs on the top of its enclosure. Together these LEDs provide us with an overview of the Fluksometer's internal functioning, the status of its network interfaces and its ability to communicate with the Flukso server. From left to right, these LEDs are:

LED | Description
--- | ---
**Wifi** | If the wifi interface is enabled, the wifi LED will blink. A fast blink rate (approx. twice per second) signals that no wifi connection can be established. A slow blink rate (once every three seconds) signifies that a wifi connection has been successfully set up.
**2x Ethernet** | The ethernet LEDs will be on when an ethernet link is established on the respective port. This can either be a 10baseT or 100baseTX link in full- or half-duplex mode.
**Globe** | After the Fluksometer has finished its boot sequence, the globe LED will be on when it can access the Flukso server. Every time the Fluksometer reports to the Flukso server, the LED will blink in case of a successful call. The globe LED will be turned off when the call is not completed successfully. A successful call has been made when either a 200 or 204 HTTP response code is returned by the Flukso server.
**Heartbeat** | The heartbeat LED is positioned right next to the globe LED. While the globe LED informs us about the status of the Fluksometer's external communication, the heartbeat LED allows us to monitor the Fluksometer's internal functioning. This LED will be on when the sensor board is running its firmware. From the moment the Flukso daemon is started during the boot sequence, it will start polling the sensor board every second for data. Each poll triggers a blink of this LED, thus mimicking a real heartbeat. Hence, a 'heartbeat' is an indication of a Fluksometer that has booted, a running Flukso daemon, a sensor board running its firmware and proper communication between the main board and sensor board.
The behavior of the heartbeat LED can be altered in the configuration.
**Power** | The power LED is directly connected to the internal 3.3V supply. A burning LED indicates that power has been applied to the device and the internal voltage regulators are working properly.

## Deploying
The following section will guide you through the installation steps that should lead to your Fluksometer's successful deployment.

### Networking
Out of the box, a Fluksometer will report to the Flukso server via the wifi interface. Please refer to [Wifi Mode](#wifi-mode) if you wish to use your Fluksometer in this reporting mode. As detailed in [Pushbutton](#pushbutton), the Fluksometer's pushbutton can be used to toggle the reporting mode to ethernet. The networking setup for this case is described in [Ethernet Mode](#ethernet-mode).

#### Wifi Mode
Power up your Fluksometer and wait until the heartbeat LED starts to blink. Connect your computer to the Fluksometer's LAN port with a direct cable; your computer will get an IP address by the FLM built-in DHCP service. If this is not the case, you may assign your computer a manual IP address in the range of *192.168.255.\**, for example 192.168.255.100. Don't use 192.168.255.1 as this is the default address of the Fluksometer.

Now surf to [http://192.168.255.1](http://192.168.255.1). Log into the Fluksometer with user *root* and default password *root*. Configure the **wifi page** with the proper SSID (wifi network name) and security key so that the Fluksometer gets connected with the internet via your local wifi network. After saving these settings, the globe LED on the Fluksometer should light up. To further test your configuration, try surfing to [http://www.flukso.net](http://www.flukso.net) while the ethernet cable is still connected to the Fluksometer.

Note: While saving settings doesn't take long, restarting the whole wifi and networking stack with its dependencies can take more than a minute to complete. Be patient.

#### Ethernet Mode
When the reporting mode is toggled to ethernet, the ethernet interface will be set as a DHCP client. The wifi interface will be disabled. Connect the Fluksometer's ethernet port to your network and find out which IP address it has been assigned by your DHCP server. Power up your Fluksometer and wait until the heartbeat LED starts to blink. The globe LED should now be on. Surf to the Fluksometer's ethernet IP address. No further network configuration steps should be required.

#### Assigning a Fixed IP address
In case you want to assign your Fluksometer a fixed IP address, do so by applying a fixed address in your network router respective DHCP server. Here usually a dedicated DHCP reservation entry has to be made, that maps the desired IP address to the Fluksometer's MAC address; consult your router manual on how to proceed for this purpose.

### Configuring Sensors
The sensor configuration will be synchronized with the Flukso server each time you save the sensor page. A synchronization can only be successful when the Fluksometer has internet connectivity.  You should therefore make sure the globe LED is lit before commencing this configuration step. If not, then goto section [Networking](#networking).

### Status
The status section lists a couple of parameters to help you verify that your Fluksometer is configured and operating correctly.

Attribute | Description
--- | ---
**System** | The system section provides some key information on the FLuksometer's setup. It tells the hardware version, installed firmware revision, and hostname respective its serial number. The Fluksometer's system time is presented in UTC. If this time setting is showing a Jan 1970 date, then your network firewall might be blocking NTP's UDP port 123.
**Network** | The network section tells the chosen communication mode. When generating the sensor page, the Fluksometer will try pinging the Flukso server and report the outcome in "Flukso.net ping test". A failed ping indicates a networking problem, so please consult section [Networking](#networking) before continuing the sensor configuration.
**Port** | On the port page you declare the electrical system corresponding to your countries' setup, the mode of the heartbeat LED and the actual sensor configuration. Saving the sensor page will trigger a synchronization action with the sensor board and the Flukso server. The "last" entry shows the last time a synchronization attempt was made. The status indicates the last synchronization attempt's outcome.
**Kube** | The Kube page lets you synchronize with FluksoKubes.
**Syslog** | The Syslog page shows the current syslog events published by the Fluksometer's system.
**Mqtt** | The MQTT page shows the currently published sensor readings of the Fluksometer.

#### MQTT
The Fluksometer provides a built-in [Mosquitto MQTT broker](http://mosquitto.org). Sensor readings are injected into the broker and can be read out by any MQTT client. Point the client to the FLM's IP address and select port 1883. Gauge (Watt) and counter (Wh) readings are published on `/sensor/<sensorid>/gauge` and `/sensor/<sensorid>/counter` topics respectively.

### Current Clamp Setup
Select the electrical system setting corresponding to the number of phases that apply for your current clamp setup. When selecting 3 phases, the three current clamp ports will present each sensor corresponding to the attached mains phase. In the 1 phase setup a single phase installation is assumed, thus all sensors are on the same phase.

### Sensors
As already indicated in the previous section, a sensor is a **logical** entity that can aggregate multiple **physical** screw terminal ports as defined in section [Ports](#ports). Since the screw terminal contains a maximum of seven ports, seven sensors per Fluksometer can physically be attached; internally the Fluksometer can handle up to 128 sensors, including the FluksoKubes.

A sensor is defined by a unique identifier. Sensors can be enabled or disabled individually. Leave sensors in a disabled state when not in use. An enabled sensor requires a name. This name will be used in the Flukso website's charts. It's important that you assign a distinct name for each enabled sensor associated with your account.

By convention, we use **main** for total household electricity consumption and **solar** for photo-voltaic production. When adding other users ("Fluksonians") to your chart on the Flukso website, the sensors will be the ones on display. A sensor can only contain ports of the same class. Ports that have different classes cannot be aggregated into a single sensor. We now introduce each of the three classes in turn:

#### Analog
Ports \#1, \#2 and \#3 are analog ports. They accept Flukso split-core current clamps of 50A, 100A, 250A and 500A. A three-phase setup requires all current clamps to be identical.

#### Pulse
Ports \#4 to \#6 on the screw terminal are pulse ports. They are mapped to sensors \#4 to \#6 respectively. A meter-constant defines the amount of flow represented by each pulse. For electricity, the unit is Wh per pulse while water and gas are specified in liter per pulse. Fractional meter constants are allowed down to 0.001.

Note: Most small energy meters define their meter-constant in imp/kWh. 1000, 2000 and 5000 imp/kWh values on the energy meter equal meter-constants of 1, 0.5 and 0.2 Wh/pulse on the Fluksometer respectively.

#### Serial/P1
The firmware contains a Dutch P1-port telegram parser. It converts the P1 port data to standard Flukso sensor readings. Hence, there's no difference in the dash or the API when accessing a sensor whose time-series data was generated by a current clamp, a DIN-rail kWh meter or a local smart meter port. The sensor associated with the smart meter will count backwards when power is injected into the grid.

#### Kube
With its built-in RFM12B wireless module you get the prerequisites to connect FluksoKubes, tiny autonomous sensor units that can be deployed all over your home to measure environmental values like temperature and humidity. As the RFM12B uses 868MHz transmission, this needs to be considered when placing the Fluksometer.

### Securing the Fluksometer
Disconnect all cables from the Fluksometer. Now find a suitable location near the fuse box to install the device. Mounting holes have been provisioned on the back of the Fluksometer. Alternatively, you can use a plastic cable tie or velcro.

### Attaching Current Clamps
For safety reasons, switch off the main electricity supply when installing the current clamps. Attach a clamp to each non-neutral line in the fuse box. Close the clamps firmly. You should hear a double click. The lip should lie flush with the clamp's body.

### Connecting Sensor Clamp Cables
Connect a cable from each current clamp to the Fluksometer's screw terminal. Use the red wire for positive polarity and the black one for negative polarity.

### Measuring Solar
It has shown that measuring Photo-Voltaic inverter output by current clamps results in a high "phantom load" due to large capacitors in the generation path (see explanation on [reactive power](https://en.wikipedia.org/wiki/AC_power#Reactive_power)). The FLM03E is capable to detect this "phantom load" respective "bad power factor", yet to avoid this "phantom load" you should consider using a pulse meter for solar supply measurement (assuming you have a 3 phase installation this is anyway the only solution). There are rather cheap single-phase DIN-rail pulse meters that suffice this requirement.

### Powering Up
Switch the main electricity supply back on. Activate the Fluksometer by inserting its power plug.

### Registering
Visit [www.flukso.net/user/register](http://www.flukso.net/user/register) and fill in the form to create your account. Once logged in, you can associate the Fluksometer with your account. Click on the **My account:Devices** tab and submit the Fluksometer's serial number. You should now see this Fluksometer added to the device list.

Point your browser to [www.flukso.net](http://www.flukso.net). A first reading should be visible on the hour chart within five minutes from powering up.

### Congratulations

You are now part of the Flukso community!



## Accessing the FLM via its local MQTT broker
As denoted above, each Fluksometer provides a built-in MQTT broker which transmits MQTT messages into the LAN.
To access these messages, you may use the local UI tab `mqtt` when accessing your Fluksometer from a browser `http://<local FLM IP address>/#/mqtt` (no login is required for this).

Alternatively install a MQTT client on your computer or tablet, for example [Mosquitto](http://mosquitto.org/download/).
Having done that, you have a MQTT client, for example `mosquitto_sub` from [mosquitto.org](http://mosquitto.org).
Call your FLM using the command line

    mosquitto_sub -h "your FLM's local IP address" -p 1883 -v -t /sensor/#

for example

    mosquitto_sub -h 192.168.0.22 -p 1883 -v -t /sensor/#

The \# denotes a wildcard that will show all your sensors' topics (`-t`), so `gauge` and `counter` on each sensor-ID, `-v` is used to show which sensor sent what data.

Another option is using a \+ to filter topics; for example `-t /sensor/+/gauge` delivers just the gauge messages of all attached sensors.

This can also programmatically be used to save FLM data to a local database or include it into a home automation network.

Note: As the built-in MQTT broker is not restricted to FLM only messages, you may use it also to exchange MQTT messages from other MQTT publishers. For this, publish MQTT messages to the respective FLM broker's IP-address, for example using `mosquitto_pub`. Refer to the corresponding documentation for details.

### FLM configuration data
The Fluksometer uses a special set of MQTT topics to publish its current configuration. On topics `/device/<device id>/config/+` all parameters are available that indicate specific sensor, system or kube settings. This may be used, for example, to show the actual sensor names instead of just their IDs as provided by the `gauge` and `counter` topics.

## TMPO
The Fluksometer stores its sensors' counter values in a specific built-in format, called **TMPO**. TMPO is a compact, platform-independent file format to store key-value-pairs of time series. Refer to the [Introducing TMPO slide deck](https://www.flukso.net/files/presentations/flukso.20140425.pdf) for further details.

## Debugging
Your Fluksometer at its base is an [openWRT](https://openwrt.org/) router, so it contains a basic, Linux-like operating system. By that it offers the capability to add additional software features, but also to do some software level debugging.
With the [local syslog tab](http://$your FLM IP$/#/syslog) (login required) you get a first glance, what is going on. Here on startup all started services are noted and during normal operation here senor data recognition and transmission is noted. This, for example, looks as following two lines:

    Mar 23 18:07:05 flukso-$flmid$ daemon.info fluksod[681]: processed pulse :1458756425:942856
    Mar 23 18:07:18 flukso-$flmid$ daemon.info fluksod[681]: POST https://api.flukso.net/sensor/$sensorid$: 200

If this does not provide sufficient information, then you have the choice to log into your Fluksometer also via Secure Shell (ssh).

    ssh root@<your FLM IP>

Default password is `root`, but may (and should) be changed using the command `passwd`.

Being a basic Linux environment, you have all the different commands at hand to check out, what is going on in your device. By `ps`, for example, you may list all running processes; by `df` you get a glance on the occupied space on your device's memory. Refer to the [openWRT documentation](http://wiki.openwrt.org/doc/start) for more options.

Note: IF no pulse is registered THEN no data is transferred to the Flukso server; if you are sure that there should be pulses registered, then especially ensure correct sensor connection (for example, correct polarity of current clamps and pulse inputs on terminals, good connection of the cables: use wire-end sleeves)

## Miscellaneous
This section contains some questions and answers collected from the [Flukso forum](https://www.flukso.net/forum).

### Accuracy of the current clamps
Accuracy of the current clamp measurements is primarily determined by the power factor and variations in line voltage; refer to [Wikipedia](https://en.wikipedia.org/wiki/AC_power#Apparent_power) for the physics behind this phenomenon. Total current equals the vector sum of the device currents and not the scalar sum. Hence a total clamp will give a slightly lower reading than the sum of the readings of, for example, two sub clamps measuring dedicated device lines.

Note that by sampling phase of current and voltage the FLM03E by principle of measurement can reach a very high accuracy.

### Adding further sensors
In the current setup of the Fluksometer it is not possible to add additional sensors, for example on temperature, which contribute to the provided dashes. Nevertheless, you may use a trick and supply analog readings to a clamp port (be aware of the correct impedance). As an alternative you may send MQTT messages to the Fluksometer's MQTT broker and use an external visualization solution subscribing to this or obtain a FluksoKube.

### Applications showing Fluksometer readings
There are some solutions that allow you to visualize Fluksometer readings also apart from the Flukso dash. Use your preferred search engine to find corresponding web content.

### Availability
While there are official distribution channels for the Fluksometer in Europe and Australia, the use is not restricted to these continents. By supplying full CE and FCC certification you may utilize a Fluksometer also in your country. Chose a proper clamp setup to meet your local requirements, for example for U.S. two phase systems corresponding 100A current clamps.

### Battery powering
With the feature to measure mains voltage and phase through its power supply, the option to power the Fluksometer by battery is not intended.

### Buffering data
The Fluksometer buffers its readings to be transmitted to the Flukso server as well as it stores its readings in an on-device "database". Refer to [TMPO](#tmpo) for more information.
If a connect to the Flukso server fails, the Fluksometer will retry its transmission so that no data gets lost.

### Compare data
The Fluksometer is named a "community meter". Thus, you may compare your data with that of other Fluksonians. Use the option to show other Fluksonians' readings in your dash by adding them to your settings in the [Flusko dash](https://www.flukso.net/dash).

### Compatibility with
...certain meters; well, as long as you get pulses from your meter, you are about to succeed to interface it with the Fluksometer's pulse ports. If you are not sure if your meter supplies pulses, ask your utility, consult the meter's specification or check with a compass, if a magnet is built in (on water and gas meters) to utilize a reed switch.

### Configuration/local FLM access via WiFi
By default you cannot access the local web pages via the wireless interface. The FLM firewall will block requests on port 80 on the wifi interface. You may change this by ssh'ing into the device via ethernet and then running two commands:

    prompt@localpc:~ $ ssh root@192.168.255.1 [default password: root]
    root@flukso-xxxxxx:~$ uci set firewall.@zone[1].input=ACCEPT
    root@flukso-xxxxxx:~$ uci commit

For the firewall to recognize the changes, you may need to restart it

    root@flukso-xxxxxx:~$ /etc/init.d/firewall restart

### Constants
The Fluksometer's metering constants need to meet your pulse meter output. Set them with respect to Wh represented per pulse. This is, for example for 2000 pulses per kWh equal to 1000 Wh / 2000 pulses = 0.5 Wh/pulse; 1 kWh / 1000 pulses = 1000 Wh / 1000 pulses = 1 Wh/pulse and so forth.

### Delay in visualization
The Fluksometer provides real-time readings only in the local area network; it sends its data to the Flukso server only once every 15 min. So you may experience a delay in the dash. If a connect is not possible then even longer.

### Different sensors
While the pulse input can be supplied with any [reed switch](https://en.wikipedia.org/wiki/Reed_switch) or [open-collector](https://en.wikipedia.org/wiki/Open_collector) interface, you may not use "any kind" of current clamp with the Fluksometer. By hardware the analog input is set up with a voltage divider that brings the "official" clamps' output voltage range and impedance into the necessary input range of the analog-to-digital converters. If you meet this setup, you may of course adapt to different sensors; do so by own risk only. (To quote inspector Sledge Hammer: "Trust me, I know what I am doing.")

### Flusko and ...
Mysql, OpenHAB, ... - there are plenty of different approaches you may use to work or integrate your Fluksometer readings with. Be curious and try it out yourself; use your [preferred search engine](#searching-fluksonet) to scan exsiting solutions.

### Failure
If your Fluksometer is not working as expected, follow Dogbert's tech advice "shut up and reboot"; if that does not cure your issue, then consult the system log and describe the error as precise as possible; someone in the forum may help. If not, Flukso headquarter will step in and will perform a remote debugging session.

### Github
The Fluksometer source code is open sourced on [Github](http://github.com/flukso) with respective forks and enhancements. There are very interesting approaches to encounter. For convenient utilization of the source code (and this documentation) install [Git](http://www.git-scm.com).

### Interfacing solar
Well, as depicted in [Measuring Solar](#measuring-solar), measuring solar power generation is best done using a pulse meter due to the fact that solar inverters in off-mode seem generally to have a pretty bad power factor, thus provide phantom readings through their built in capacitors.

### JSON
The Fluksometer transmits its readings via [MQTT topics](#mqtt)) and configuration information in a JSON ([JavaScript Object Notation](https://en.wikipedia.org/wiki/JSON)) format allowing easy programmatic use in nearly every programming environment (so not restricted to JavaScript). See the paragraph on [MQTT messages](#mqtt-messages) for more details.

### More inputs
Restricted by the hardware setup, the Fluksometer is capable to interface with up to three current clamps, up to three pulse meters, a Dutch P1 smart meter and several other devices through its built-in wireless interface. Integration of these inputs into the Flukso sensor storage and website are restricted to "officially supported" devices. But as all code is open source, you may help yourself, for example by utilizing additional sensors through [MQTT](#mqtt).

### MQTT messages
The Fluksometer continuously publishes counter and gauge readings via MQTT topics `/sensor/<sensorid>/counter` and `/sensor/<sensorid>/gauge` on its broker address `<flukso IP>:1883`.

The payload format of these messages consists of an array with elements *timestamp*, *value* and *unit*, for example `[1459065184,2149218,"Wh"]` and `[1459065180,157,"W"]`.

To obtain device configuration information there is a topic `/device/<device id>/config/sensor`. This provides an object with properties specifying a lot of different Fluksometer features, for example an enumeration of all sensors and information on set APIs. A sensor is represented as in following excerpt:

    "1": {
      "type": "electricity",
      "subtype": "pplus",
      "id": "<some guid>",
      "enable": 1,
      "rid": 0,
      "port": [
        1
      ],
      "data_type": "counter"
    }

Use an MQTT client, for example [mosquitto_sub](http://mosquitto.org/man/mosquitto_sub-1.html), to take a look at your own data.

To post its readings to the Flusko server, the Fluksometer also publishes [TMPO](#tmpo) content on topic `/sensor/<device id>/tmpo/+/+/+/gz`. Payload here is a gzipped object with counter values, for example

    /sensor/<sid>/tmpo/0/8/1422801920/gz
    { h:
       { cfg:
          { id: '<sid>',
            type: 'electricity',
            port: [Object],
            function: '<sensor name>',
            rid: 0,
            current: 50,
                data_type: 'counter',
            voltage: 230 },
         tail: [ 1422802131, 637842 ],
         vsn: 1,
         head: [ 1422801984, 637840 ] },
      t: [ 0, 66, 81 ],
      v: [ 0, 1, 1 ] }

### Optical Sensors
There are some [simple optical sensors](https://www.google.com/#q=tcrt5000) that you may utilize to interface with, for example, a gas or water meter. As long as such sensor provides an [open-collector](https://en.wikipedia.org/wiki/Open_collector) output, you are fine interfacing it with the FLM's pulse ports. Be aware of the required power supply to these sensors.

### Searching Flukso.net
The Flukso website by itself does not provide an integrated search function. Yet you are able to use any search engine for this purpose. Restrict your query to the flusko.net website by parameter "[site:flukso.net](https://www.google.com/?q=site:flukso.net+searchterm)" and dare to ask the right question...

### Wire length
For pulse input there should be no issue in using a (twisted pair) wire of several 10s of meters length; pulse detection is on falling edge, thus against ground potential "overriding" the FLM internal pull-up resistor. For analog/clamp input you may test yourself; the resistance of the wire should not be "significant" for this.

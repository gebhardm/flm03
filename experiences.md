# Experiences with the Fluksometer v3E

## Installation
If you are somehow familiar to this kind of tiny routers then the two network ports provide following behaviour:

* WAN is for the internet, and
* LAN is for the intranet connection.

There is a DHCP server active on the LAN side, thus plugging a PC in here provides it an IP address; this did not change to the FLM02, so you get one in the IPv4 range 192.168.255.x.

Now you can access the FLM03E at its "gateway" address http://192.168.255.1 - on a browser the "usual" login page occurs: Log in by user 'root', password 'root' and you are in somehow the same outline as with the FLM02.

On the now visible status page you get, as named, 'status' information.

Selecting the sensor tab, you may configure your sensors, seven in a row, first three for current clamps, three for pulse input and one uart.

Due to the new power supply providing the capability to measure line voltage there is no voltage configuration for the current clamps, just name their maximum current - 50 in my sample.

Now the tricky part: Syncing with the Flukso site. I did it in the way that I connected the WAN port to my existing intranet, gaining internet access through the modem/main router - the WAN port gets an IP address from this, detectable by "nmap"; PC attached for configuration on the LAN port, as described before. "nmap" also shows open ports on the WAN side are 1883 (MQTT) and 8083 (some TCP-UDP service) - by default no access to the FLM03E's http port 80 from here...

So I initially got my FLM03E up and running; next steps are actual port configuration with respect to an "intranet device" and some more investigation on new capabilities.

## New capabilities
### MQTT
The FLM03E provides new MQTT topics; it is very communicative on these leaving my connected RasPi with flmdisplay a bit breathless...

For first assessment of the MQTT capabilities of the FLM03E, please refer to [MQTT.md](https://github.com/gebhardm/flm03/blob/master/MQTT.md) - note that FLM02 and FLM03 are currently not directly compatible with this respect; it will require some more investigations before I am able to decide on how to adapt, for example my flmdisplay functionality.

### Access via cabled LAN
To get more convenient access (my FLM03E is connected via cable on its WAN port to the LAN), the firewall has to be [tweaked](https://github.com/flukso/flm02/wiki#configurationlocal-flm-access-via-wifi) like for the FLM02.

Now ip-port 80 with its web interface works without plugging a PC into the LAN port as well as logging in via SSH (ip-port 22); maybe reasonable to change the default password...
Now having a look at the built in visualization is just one SCP away ;-)

### Pulse Meter
For using one pulse meter on two FLMs in parallel you cannot just use two wires. To solve this issue, I made a "pulse doubler" feeding two optocoupler from one "open collector output". The idea should be clear from the schematics...
Now I can see my PV on both FLMs. A real tinkering weekend ;-)

### Phase Configuration
Interesting is the difference between clamp sensor settings "3p+n" and "1p".
For the FLM02 "1 phase" meant "each phase separate"; this is "not true" anymore for the FLM03. The FLM03 seems to always report on all clamps, so no "collection into one", when choosing "3p".

Here "1p" seems to be "measuring three different points on the same phase". In the configuration here you see a "shift" parameter that I assume to be the "phase shift", visible if running on a "real" three-phase environment. Corresponding to the detected phase shift then the readings look "strange" when compared to the FLM02 readings.

"3p+n" (we have a neutral return line) then shows "what is expected with respect to FLM02 comparison", even though readings differ in amount. What is more accurate would have to be measured with a Fluke.
Pulse detection works as expected, comparison shows practically no difference.
So I have to dig a bit deeper into the magic of "measuring AC" to really understand what is going on.

Bart answered on this: "Port configuration will trigger the phase matching algorithm. So it's crucial to install all current clamps prior to configuring the ports via the local UI. A non-trivial resistive load should be present on each phase as well during the configuration step for successful matching. Selection of the electrical system (1P, 3P-N = 3x230V, 3P+N = 3x380V) will influence matching. 1P indicates you only have a single phase available in the dwelling, so phase shift can only be 0 or 180 degrees."

# Interfacing with the FLM
To run two Fluksometers in parallel, for using the same pulse meter on both, a little hack is necessary, distributing one pulse input to two, isolated outputs.
This is actually an "open collector doubler". The constant current source is used to get supply power from any DC source available (here the 12V supply of the FLM02).

<img src="images/distribute_pulses.png" width=500px>

The input corresponds to that of the Fluksometer's pulse inputs. Here you connect your pulse source with GND as if it was the (-) input of the FLM; the pin on the current source's side is (+) respectively (you have a 50% chance to connect it correctly ;-)). On the output side the pin labeled Xn-1 corresponds to (-) and the Xn-2 to (+) of the FLM. Follow the arrow of the optocoupler's transistor - this acts as if it was the original pulse output of a meter. Please note, any general purpose optocouplers and NPN-transistors may be used. The whole thing can be easily built on a breadboard, so even prototyped on a prototyping board without any soldering. Nothing last longer than a temporary solution.

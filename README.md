homefront-relay
===============

A Node.js script that polls temperature sensors for data over Bluetooth serial connection and passes them to the Homefront server. As the Bluetooth connections started to mysteriously fail after some time if the Node app was kept on all the time, the current version just runs through all sensors and then exits. So, running with Forever is needed.

The Bluetooth modules need to be paired with the host machine for the communication to work and the corresponding MAC addresses entered to config.json.

The script also grabs the outside temperature from a weather service, in this case from the YLE weather page's API. In a way it is treated as just another sensor.  
<h1 align="center"><a href="https://homieiot.github.io"><img src="https://raw.githubusercontent.com/homieiot/convention-website/master/static/img/Homie-logo.svg" height="200"><br>The Homie Convention</a></h1>
<i align="center">A lightweight MQTT convention for the IoT</i>

## Motivation

The Homie convention strives to be a messageing convention that makes it easy to interconnect IoT devices. In such a way that devices will not need to know anything about other devices internal implementations, hardware, or connectivity.

The Homie convention is a **communication definition on top of MQTT** between IoT devices and controlling entities.

> [MQTT](http://mqtt.org) is a machine-to-machine (M2M)/"Internet of Things" connectivity protocol.
> It was designed as an extremely lightweight publish/subscribe messaging transport.

MQTT supports easy and unrestricted message-based communication.
However, MQTT doesn't define the structure and content of these messages and their relation.
An IoT device publishes data and provides interaction possibilities but a controlling entity will need to be specifically configured to be able to interface with the device.

The Homie convention defines a **standardized way** of how IoT devices and services announce themselves and their data on the communication channel.
The Homie convention is thereby a crucial aspect in the support of **automatic discovery, configuration and usage** of devices and services over the MQTT protocol.

Find the convention here: https://homieiot.github.io

---

## Guiding design principles

These principles should be taken into account when proposing changes to the conventuion.

### Separation of concerns
Many of todays HA applications, both commercial and free, take the approach of an all-in-one package (monolith). This creates closed eco systems and a duplication of work. The biggest challeng in IoT is connecting devices by writing driver-software to integrate them (because of the ever growing number of connected devices available). Each of the available monolithical HA applications duplicates this effort because of their integrated, tightly-coupled designs.

The Homie based stack consists of multiple layers and components;
* MQTT as the central communications bus
* Homie as a MQTT-topic convention to discover and interact with devices and controllers in a standardized way without knowing the device specifics
* Each device presents itself on this network, according to a well specified format

This provides a way to only write device interfaces/drivers once, whilst at the same time allows for app developers to build competing apps without having to do the entire infrastructure as well. Which will provide more choice for the users in how they interact with the system.

### Message bus 
Use an industry standard communications bus, no home grown protocols; MQTT.
There are many implementations available both free and commercial. 

### Easy for users
It should have a low entry barrier to use. The only central component required is an MQTT server. So set up an MQTT server, connect a device and a controller application and start controlling your devices

### Easy for developers
It should have a low entry barrier for developers. Set up an MQTT server and grab a Homie library and start coding.

### Resource constraints
Devices with very limited resources should still be able to use the Homie Convention (provided they are MQTT capable).
Controllers are assumed to have more resources available, to be able to build multiple device representations and control many devices simultaneously.

### No control logic
Homie does specify control logic for devices. It specifies the means by wich other devices or controllers can interact but does not have any logic by itself. Logic engines (if-this then-that) are separate and can be build on top of the convention.

### No GUI type specifications
Homie does not specify how a GUI should present a device. At most it provides metadata in the device/service descriptions for display etc. GUI's are seperate implementations and can be build on top of the convention.
The convention is considerate to specify devices descriptions in a way that will provide hints to a GUI 
See also [device state](#device-state) below

### Debugging and troubleshooting
It should be easy to debug applications, and get feedback from users what is happening in case of problems/support. This is implemented with simple basic types, transmitted in plain text over the MQTT topics.

---

## Device design

Some guidelines for designing Homie device interfaces


### Eventual consistency
An MQTT bus does not guarantee the order of delivery of messages. This might cause messages to arrive in an order that might be considered invalid. This is an eventual consistency problem, since over time, after all messages have been received, the state should be consistent again. Developers should take this into account.

### Device state
The Homie convention allows devices to specify an unambiguous state. This is not necessarily the same state as would be present in a GUI.

The typical example would be a dimmable light. In a GUI this is often represented as switch (on/off) and a slider (0-100%). Consider the brigtness to be at 0%, and then the user switches the light on. What will now happen? this is an example of an ambiguous state. To make it unambiguous the slider should be designed as 1-100%, taking out the 0% option, since that is perceived as "off".

So the Homie device can use the on/off and 1-100% settings to be unambiguous. However a GUI can choose how it maps those values and settings to a user interface.

# Meta

Version: **<!--VERSION-->1.0.0<!--VERSION-->**
Date: **<!--DATE-->10. Jul 2019<!--DATE-->**
Authors: **<!--AUTHORS-->[EPNW](https://epnw.eu)<!--AUTHORS-->**
License: **<!--LICENSE-->[CCA 4.0](https://homieiot.github.io/license)<!--LICENSE-->**

## Abstract
This extension defines how to add metadata and tags to devices, nodes and properties.

Tags are simple annotations that ever device, node oder property can have.
Metadata on the other hand are more complex. They allow the definition of multiple *mainkeys* and *mainvalues* for each device, node or property.
Each main-key-value-pair may have nested sub-key-value-pairs.
Having metadata might be useful for Homie controllers.
A concrete usecase is the openHAB controller, which relies on metadata and tags to make voice assistants like Amazons Alexa or the Google Assistant able to control it.
With this extension, properties are able to advertise how they want to be treated.

## Extension Identifier
The ID of this extension is `eu.epnw.meta`.

## Homie Version
This extension supports Homie `3.0.1` and `4.0`.

## Extension Datatypes
This extension defines no new datatypes.

## Extension Attributes

### Extension Attributes for any kind of Items

The following attributes are all **optional** and may be added to any kind of item (devices, nodes or properties).

| Topic                | Description                            | Payload type                         | Default value|
|----------------------|----------------------------------------|--------------------------------------|--------------|
| $tags                | List of *tags* for the item            | Comma (`,`) separated list of *tags* |              |
| $meta/$mainkey-count | The number of *mainkeys* this item has | Positive Integer                     | 0            |


Since *tags* are represented by a comma separated list, a limitation is that a tag itselfe MUST NOT contain a comma.

**Examples**
Assuming the base topic is *homie*, device ID is *super-car*, the node is *engine* and the property is *temperature* then:
```java
homie/super-car/engine/temperature/$meta/$key-count → "2"  
homie/super-car/engine/temperature/$tags → "Lighting,Switchable,Thermostat"
```

If *mainkey-count* is greater then 0, for each *mainkey* two **nested** attributes are **required**.
The *mainkey number* is the number of the *mainkey*. The first number is 0 and the greatest number is *mainkey-count*-1.
This indexing scheme is similar to array indexing in most programming languages. 

| Topic                  | Description                       | Payload type |
|------------------------|-----------------------------------|--------------|
| $meta/*mainkey number*/$key | The *mainkey*s name | String       |
| $meta/*mainkey number*/$value | The *mainvalue* for the *mainkey* | String       |

**Examples**
With respect to the previous example:
```java
homie/super-car/engine/temperature/$meta/0/$key → "homekit"
homie/super-car/engine/temperature/$meta/0/$value → "Fan.v2"
homie/super-car/engine/temperature/$meta/1/$key → "alexa"
homie/super-car/engine/temperature/$meta/1/$value → "Fan"
```

A *mainkey* can have an arbitrary number of *subkeys*. The count is defined by the **optional** attribute *subkey-count*, which, if given, MUST NOT be negative:

| Topic                         | Description                                | Payload type | Default value |
|-------------------------------|--------------------------------------------|--------------|---------------|
| $meta/*mainkey*/$subkey-count | The number of *subkeys* this *mainkey* has | Positive Integer      | 0             |

**Examples**
With respect to the previous example:
```java
homie/super-car/engine/temperature/$meta/1/$subkey-count → "2"
```

If *subkey-count* is greater then 0, for each *subkey* two **nested** attributes are **required**.
The *subkey number* is the number of the *subkey*. The first number is 0 and the greatest number is *subkey-count*-1.
This indexing scheme is similar to array indexing in most programming languages. 

| Topic                    | Description                          | Payload type |
|--------------------------|--------------------------------------|--------------|
| $meta/*mainkey number*/*subkey number*/$key   | The *subkey*s name     | String       |
| $meta/*mainkey number*/*subkey number*/$value | Value for the *subkey* | String       |


**Examples**
With respect to the previous example:
```java
homie/super-car/engine/temperature/$meta/1/0/$key → "type"
homie/super-car/engine/temperature/$meta/1/0/$value → "oscillating"
homie/super-car/engine/temperature/$meta/1/1/$key → "stepSpeed"
homie/super-car/engine/temperature/$meta/1/1/$value → "3"
```

### Device Attributes

This extension defines no other direct device attributes.

#### Nested Device Attributes

This extension defines one nested device attribute.

##### $eu.epnw.meta

The **$eu.epnw.meta** nesting attribute is **required**.

It defines **no optional** attributes and the following **required** nested attributes:

| Topic                         | Description                                                             | Payload type                            |
|-------------------------------|-------------------------------------------------------------------------|-----------------------------------------|
| $eu.epnw.meta/$version        | The version of this extension                                           | String with constant value: "1.0.0"     |
| $eu.epnw.meta/$homie-versions | The Homie versions this extension supports, separated by a comma (`,`)  | String with constant value: "3.0.1,4.0" |

**Examples**
Assuming the base topic is *homie* and device ID is *super-car* then:
```java
homie/super-car/$eu.epnw.meta/$version → "1.0.0"
homie/super-car/$eu.epnw.meta/$homie-versions → "3.0.1,4.0"
```
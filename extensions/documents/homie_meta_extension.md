# Meta

Version: **<!--VERSION-->1.1.0<!--VERSION-->**
Date: **<!--DATE-->12. Jul 2019<!--DATE-->**
Authors: **<!--AUTHORS-->[EPNW](https://epnw.eu)<!--AUTHORS-->**
License: **<!--LICENSE-->[CCA 4.0](https://homieiot.github.io/license)<!--LICENSE-->**

## Abstract
This extension defines how to add metadata and tags to devices, nodes and properties.

Tags are simple annotations that every device, node or property can have.
Metadata on the other hand are more complex. They allow the definition of multiple *mainkeys* and *mainvalues* for each device, node or property.
Each main-key-value-pair may have nested sub-key-value-pairs.
Having metadata might be useful for Homie controllers.
A concrete usecase is the openHAB controller, which relies on metadata and tags to make voice assistants like Amazons Alexa or the Google Assistant able to control it.
With this extension, properties are able to advertise how they want to be treated.

## Homie Version
This extension supports Homie `3.0.1` and `4.x`.

## Extension Identifier
The ID of this extension is `eu.epnw.meta`.
Therefore the **$extensions entry** is `eu.epnw.meta:1.1.0:[3.0.1;4.x]`.

## Extension Datatypes
This extension defines no new datatypes.

## Extension Attributes

### Extension Attributes for any kind of Items

The following attributes are all **optional** and may be added to any kind of item (devices, nodes or properties).

| Topic                | Description                 | Payload type               | Default value|
|----------------------|-----------------------------|----------------------------|--------------|
| $tags                | List of *tags* for the item | Comma (`,`) separated list |              |
| $meta/$mainkey-ids   | List of IDs for *mainkeys*  | Comma (`,`) separated list |              |

Since *tags* are represented by a comma separated list, a limitation is that a tag itself MUST NOT contain a comma.
The elements in the `$mainkey-ids` list are **not** the names of the keys.
Instead, these entries are just used for topic IDs.
Therefore, the entries have to be valid topic IDs (see [the Homie convention](https://homieiot.github.io/specification/#topic-ids))!

**Examples**
Assuming the base topic is *homie*, device ID is *super-car*, the node is *engine* and the property is *temperature* then:
```java
homie/super-car/engine/temperature/$meta/$mainkey-ids → "alexa,homekit"  
homie/super-car/engine/temperature/$tags → "Lighting,Switchable,Thermostat"
```

For each element in the `$mainkey-ids` list, two nested attributes are **required**:

| Topic                     | Description                       | Payload type |
|---------------------------|-----------------------------------|--------------|
| $meta/*mainkey id*/$key   | The *mainkey*s name               | String       |
| $meta/*mainkey id*/$value | The *mainvalue* for the *mainkey* | String       |

**Examples**
With respect to the previous example:
```java
homie/super-car/engine/temperature/$meta/alexa/$key → "HomeKit"
homie/super-car/engine/temperature/$meta/alexa/$value → "Fan.v2"
homie/super-car/engine/temperature/$meta/homekit/$key → "Alexa"
homie/super-car/engine/temperature/$meta/homekit/$value → "Fan"
```

Notice that in this example, the *mainkey ids* are *alexa* and *homekit*, but the actual key names are *Alexa* and *HomeKit*.

A *mainkey* can have an arbitrary number of *subkeys*.
Analogous to how *mainkeys* are advertised, each *mainkey* may have an **optional** list of *subkey ids*:

| Topic                         | Description                                | Payload type | Default value |
|-------------------------------|--------------------------------------------|--------------|---------------|
| $meta/*mainkey id*/$subkey-ids | List of IDs for *subkeys*  | Comma (`,`) separated list |              |

Again, elements in the `$subkey-ids` list are **not** the names of the keys, and have to be valid topic IDs.

**Examples**
With respect to the previous example:
```java
homie/super-car/engine/temperature/$meta/alexa/$subkey-ids → "type,step-speed"
```

For each element in the `$subkey-ids` list, two nested attributes are **required**:

| Topic                                 | Description                          | Payload type |
|---------------------------------------|--------------------------------------|--------------|
| $meta/*mainkey id*/*subkey id*/$key   | The *subkey*s name                   | String       |
| $meta/*mainkey id*/*subkey id*/$value | Value for the *subkey*               | String       |


**Examples**
With respect to the previous example:
```java
homie/super-car/engine/temperature/$meta/alexa/type/$key → "type"
homie/super-car/engine/temperature/$meta/alexa/type/$value → "oscillating"
homie/super-car/engine/temperature/$meta/alexa/step-speed/$key → "stepSpeed"
homie/super-car/engine/temperature/$meta/alexa/step-speed/$value → "3"
```

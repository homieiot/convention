# The Homie Extension Convention

Version: **<!--VERSION-->0.1.0<!--VERSION-->**
Date: **<!--DATE-->10. Jul 2019<!--DATE-->**
License: **<!--LICENSE-->[CCA 4.0](https://homieiot.github.io/license)<!--LICENSE-->**

## Abstract
This document specifies how to create an extension documents and defines the responsibilities of extensions.
For a template to define extensions take a look at the [extension template]().

## Licensing
Every extension must be published using a license.
The license can be chosen freely, even proprietary licenses are possible.
The recommended license is the [CCA 4.0](https://homieiot.github.io/license), since this is the license Homie itself uses.

## Extension Identifier
Every extension is identified by an unique ID and will be linked from this section.
The ID consists of the reverse domain name and a freely chosen suffix.
For example, an organization *example.org* wanting to add a feature *our-feature* would choose the extension ID *org.example.our-feature*.
The proper term *homie* is reserved and must not be used as the suffix or as part of the domain name.

## Extension Datatypes
An extension may define new datatypes and formats for them.
	
## New Attributes
An extension may add new attributes to devices, nodes and properties.
The attributes MUST start with a `$`. Attributes are always **retained**.
An attribute may have no value, but instead act as a root for more nested attributes.
This is necessary to distinguish a nesting attribute from a node (if the nesting attribute is added to a device) or from a property (if its added to a node).
In the following example *$certifications* is the **nesting** attribute, which serves as root for the **nested** *$european-union* and *$usa* attributes.
```java
homie/super-car/engine/$certifications/$european-union → "Euro 6b"
homie/super-car/engine/$certifications/$usa → "Tier 3"
```
**Nested** attributes may start with `$` but don't have to.
This means, that in the above example using *homie/super-car/engine/$certifications/usa* would have been a valid topic, too.
An extension document may decide which extension attributes are **required** and which are **optional**.
If they are optional, default values may be given. Additionally, given examples for each attribute are recommended.

## Mandatory Version Attributes
Each extension must have an $version attribute and and $homie-versions attribute.
An extension is added to a device by adding the extension ID to the [$extension](https://homieiot.github.io/specification/spec-core-develop/#device-attributes) attribute of the device.
Then the device needs to publish the version of the extension to
```java
base topic/device ID/$extension ID/$version
```
and a comma (`,`) separated list of the Homie versions the extension supports to
```java
base topic/device ID/$extension ID/$homie-versions
```
For example, if the version *"1.1"* of the extension is used, the base topic is *homie*, the device ID is *super-car* and the extension ID is *org.example.our-feature* the device needs to publish to
```java
homie/super-car/$org.example.our-feature/$version → "1.1"
```
Suppose further, that this extension in version *"1.1"* is compatible to *Homie 3.0.1* and *Homie 4.0* then
```java
homie/super-car/$org.example.our-feature/$homie-versions → "3.0.1,4.0"
```
Note, that as consequence of using the extension ID, this topics contain dots (`.`).
Using dots is normally not allowed for a topic ID according to [paragraph 2.1 of the Homie Convention](https://homieiot.github.io/specification/#topic-ids).
The mandatory version attributes are the only exception.
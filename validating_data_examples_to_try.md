# Trying out validating data with SHACL and ShEx from Dataspecer

This manual has been created after encountering some unstability with the online validators and so that you can try validating the data with the artifact generated in Dataspecer, this guide gives precise examples, providing data structures to try the validation on, along with generated validating schemas and provided data.
Online validators used for this tutorial
 - SHACL: [SHACL Playground from zazuko](https://shacl-playground.zazuko.com/)
 - ShEx: [ShEx2 - Simple Online Validator](http://shex.io/webapps/shex.js/doc/shex-simple.html)
If the validation with online validators does not work, there might be different issues at hand with the compatibility of the validators or the supplied data. SHACL and ShEx generators are being automatically tested for syntax and functionality with every Dataspecer iteration so there should not be any issue in the validating schemas themselves.

The first example data structure is this Person data structure, that has been renamed from its previous IRIs to something to better showcase the example. The datatypes to this data structure have been chosen to be different and to see the data type in different forms.

Data structure: https://tool.dataspecer.com/editor?data-specification=https%3A%2F%2Fofn.gov.cz%2Fdata-specification%2F1ef6ae8e-53f5-4ed0-9021-e122fed28be7&data-psm-schema=https%3A%2F%2Fofn.gov.cz%2Fschema%2F1707267359524-5100-047c-992c


# Trying out validating data with SHACL and ShEx from Dataspecer

This manual has been created after encountering some unstability with the online validators and so that you can try validating the data with the artifact generated in Dataspecer, this guide gives precise examples, providing data structures to try the validation on, along with generated validating schemas and provided data.
Online validators used for this tutorial
 - SHACL: [SHACL Playground from zazuko](https://shacl-playground.zazuko.com/)
 - ShEx: [ShEx2 - Simple Online Validator](http://shex.io/webapps/shex.js/doc/shex-simple.html)
If the validation with online validators does not work, there might be different issues at hand with the compatibility of the validators or the supplied data. SHACL and ShEx generators are being automatically tested for syntax and functionality with every Dataspecer iteration so there should not be any issue in the validating schemas themselves.

The first example data structure is this Person data structure, that has been renamed from its previous IRIs to something to better showcase the example. The datatypes to this data structure have been chosen to be different and to see the data type in different forms.

Data structure: https://tool.dataspecer.com/editor?data-specification=https%3A%2F%2Fofn.gov.cz%2Fdata-specification%2F1ef6ae8e-53f5-4ed0-9021-e122fed28be7&data-psm-schema=https%3A%2F%2Fofn.gov.cz%2Fschema%2F1707267359524-5100-047c-992c

![Dataspecer Person data specification](./packages/shacl/src/images/dataspecerPersonSpecification.png)

Generated SHACL schema:
```
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@base <https://myexample.com/>.

<aec2db2a67ade8d68945158048f1088apersonShape> a sh:NodeShape;
    sh:targetClass <https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba>;
    sh:class <https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba>;
    sh:nodeKind sh:IRI;
    sh:description "Fyzická osoba je člověkem, který je subjektem práva."@cs, "Natural Person is a human as a legal subject."@en;
    sh:name "Person"@cs, "Person"@en.
<e209592e03a01575611ca9e7ecc61035isStudentShape> a sh:PropertyShape;
    sh:description "Information whether subject is currently studying/has a status of a student"@cs, "Human First name"@en;
    sh:name "is Student"@en, "is Student"@cs;
    sh:minCount 1;
    sh:maxCount 1;
    sh:path <https://slovník.gov.cz/veřejný-sektor/pojem/křestní-jméno>.

<e209592e03a01575611ca9e7ecc61035isStudentShape> sh:datatype xsd:boolean.
<aec2db2a67ade8d68945158048f1088apersonShape> sh:property <e209592e03a01575611ca9e7ecc61035isStudentShape>.
<6b43c794b32fafd3abea73c44e217793surnameShape> a sh:PropertyShape;
    sh:description "Surname of a person"@cs, "Human Surname"@en;
    sh:name "Surname"@en, "Příjmení"@cs;
    sh:minCount 1;
    sh:path <https://slovník.gov.cz/veřejný-sektor/pojem/příjmení>;
    sh:datatype xsd:anyURI;
    sh:pattern "^[A-Z][a-z]*$".
<aec2db2a67ade8d68945158048f1088apersonShape> sh:property <6b43c794b32fafd3abea73c44e217793surnameShape>.
<e4b5012e40ff23016694d283210090a0ageShape> a sh:PropertyShape;
    sh:description "Age of the subject in years"@cs, "Age of the subject in years"@en;
    sh:name "Age"@en, "Právo"@cs;
    sh:minCount 1;
    sh:maxCount 1;
    sh:path <https://slovník.gov.cz/veřejný-sektor/pojem/právo>;
    sh:datatype xsd:integer.
<aec2db2a67ade8d68945158048f1088apersonShape> sh:property <e4b5012e40ff23016694d283210090a0ageShape>.
<8a2bb2d122a69acce8e4efc0cb766b54knowsShape> a sh:PropertyShape;
    sh:description "Other people the subject knows"@cs, "Other people the subject knows"@en;
    sh:name "Knows"@en, "Právní vztah"@cs;
    sh:path <https://slovník.gov.cz/veřejný-sektor/pojem/právní-vztah>;
    sh:nodeKind sh:IRI.
<aec2db2a67ade8d68945158048f1088apersonShape> sh:property <8a2bb2d122a69acce8e4efc0cb766b54knowsShape>.
```
Generated json-example:
```
{
  "@context": {
    "@version": 1.1,
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "id": "@id",
    "type": "@type",
    "Person": {
      "@id": "https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba",
      "@context": {
        "isStudent": {
          "@id": "https://slovník.gov.cz/veřejný-sektor/pojem/křestní-jméno",
          "@type": "xsd:boolean"
        },
        "surname": {
          "@id": "https://slovník.gov.cz/veřejný-sektor/pojem/příjmení",
          "@type": "xsd:anyURI"
        },
        "age": {
          "@id": "https://slovník.gov.cz/veřejný-sektor/pojem/právo",
          "@type": "xsd:integer"
        },
        "knows": {
          "@id": "https://slovník.gov.cz/veřejný-sektor/pojem/právní-vztah",
          "@container": "@set",
          "@type": "@id"
        }
      }
    }
  }
,
  "id": "http://jizagfbcfOyakrBRpfweozbqrYL.emYg7MdIXJBY5QJpBc2THkFJlLxTb.?g&awc=x&knuzjv=4la&",
  "type": [
    "adipisicing",
    "ea aute labore",
    "dolor",
    "Person"
  ],
  "isStudent": true,
  "surname": [
    "Hcmfl"
  ],
  "age": -7587224
}
```

If we input this data to SHACL validator, we see, that data is conformant. 

For an example on non-conformant data, let's try to delete the required attribute "isStudent". Now the data looks like this:

```

```

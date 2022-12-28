import {
    Column
} from "../csv-schema/csv-schema-model";
import {
    idColumnTitle,
    refColumnTitle,
    leftRefColTitle,
    rightRefColTitle,
    nameSeparator,
    TableUrlGenerator
} from "../csv-schema/csv-schema-model-adapter";
import {
    SparqlSelectQuery,
    SparqlNode,
    SparqlQNameNode,
    SparqlUriNode,
    SparqlVariableNode,
    SparqlTriple,
    SparqlPattern,
    SparqlOptionalPattern,
    SparqlElement
} from "@dataspecer/sparql-query";
import { RDF_TYPE_URI } from "@dataspecer/sparql-query";
import { csvwContext } from "../csv-schema/csvw-context";
import { assertFailed } from "@dataspecer/core/core";
import {
    StructureModel,
    StructureModelClass
} from "@dataspecer/core/structure-model/model";

class VariableGenerator {
    private num = 0;

    getNext(): SparqlVariableNode {
        this.num++;
        const varNode = new SparqlVariableNode();
        varNode.variableName = "v" + this.num.toString();
        return varNode;
    }
}

export function buildMultipleTableQueries(
    model: StructureModel
) : SparqlSelectQuery[] {
    const prefixes: Record<string, string> = {};
    const where = new SparqlPattern();
    where.elements = [];
    const selects: string[][] = [];
    const varGen = new VariableGenerator();
    const urlGen = new TableUrlGenerator();
    buildQueriesRecursive(prefixes, where, selects, model.roots[0].classes[0], varGen, urlGen);

    const queries: SparqlSelectQuery[] = [];
    for (const select of selects) {
        const query = new SparqlSelectQuery();
        query.prefixes = prefixes;
        query.select = select;
        query.where = where;
        queries.push(query);
    }
    return queries;
}

function buildQueriesRecursive(
    prefixes: Record<string, string>,
    wherePattern: SparqlPattern,
    selects: string[][],
    currentClass: StructureModelClass,
    varGen: VariableGenerator,
    urlGen: TableUrlGenerator
) : SparqlVariableNode {
    const currentSelect: string[] = [];
    selects.push(currentSelect);
    const tableUrlCom = makeTableUrlComment(urlGen);
    const subject = varGen.getNext();
    currentSelect.push(makeAs(subject.variableName, idColumnTitle));
    wherePattern.elements.push(makeTypeTriple(prefixes, subject, currentClass.cimIri));

    for (const property of currentClass.properties) {
        const dataType = property.dataTypes[0];
        const multipleValues = property.cardinalityMax === null || property.cardinalityMax > 1;
        const requiredValue = property.cardinalityMin > 0;
        if (dataType.isAssociation()) {
            const associatedClass = dataType.dataType;
            if (associatedClass.properties.length === 0) {
                const object = varGen.getNext();
                wherePattern.elements.push(propertyToElement(prefixes, subject, property.cimIri, object, requiredValue, property.isReverse));
                if (multipleValues) selects.push([ makeAs(subject.variableName, refColumnTitle), makeAs(object.variableName, property.technicalLabel), makeTableUrlComment(urlGen) ]);
                else currentSelect.push(makeAs(object.variableName, property.technicalLabel));
            }
            else {
                let targetPattern = wherePattern;
                if (!requiredValue) {
                    const opt = prepareOptional();
                    targetPattern = opt.optionalPattern;
                    wherePattern.elements.push(opt);
                }
                const propSubject = buildQueriesRecursive(prefixes, targetPattern, selects, associatedClass, varGen, urlGen);
                targetPattern.elements.push(propertyToElement(prefixes, subject, property.cimIri, propSubject, true, property.isReverse));
                if (multipleValues) selects.push([ makeAs(subject.variableName, leftRefColTitle), makeAs(propSubject.variableName, rightRefColTitle), makeTableUrlComment(urlGen) ]);
                else currentSelect.push(makeAs(propSubject.variableName, property.technicalLabel));
            }
        }
        else if (dataType.isAttribute()) {
            const object = varGen.getNext();
            wherePattern.elements.push(propertyToElement(prefixes, subject, property.cimIri, object, requiredValue));
            if (multipleValues) selects.push([ makeAs(subject.variableName, refColumnTitle), makeAs(object.variableName, property.technicalLabel), makeTableUrlComment(urlGen) ]);
            else currentSelect.push(makeAs(object.variableName, property.technicalLabel));
        }
        else assertFailed("Unexpected datatype!");
    }

    currentSelect.push(tableUrlCom);
    return subject;
}

function makeTypeTriple(
    prefixes: Record<string, string>,
    subject: SparqlNode,
    typeIri: string
) : SparqlTriple {
    const typeTriple = new SparqlTriple();
    typeTriple.subject = subject;
    const typePredicate = new SparqlUriNode();
    typePredicate.uri = RDF_TYPE_URI;
    typeTriple.predicate = typePredicate;
    typeTriple.object = nodeFromIri(typeIri, prefixes);
    return typeTriple;
}

function makeTableUrlComment(
    urlGen: TableUrlGenerator
) : string {
    return "# Table: " + urlGen.getNext().write();
}

function propertyToElement(
    prefixes: Record<string, string>,
    subject: SparqlNode,
    predIri: string,
    object: SparqlNode,
    required: boolean,
    reverse: boolean = false
) : SparqlElement {
    const triple = new SparqlTriple();
    if (reverse) {
        triple.subject = object;
        triple.object = subject;
    }
    else {
        triple.subject = subject;
        triple.object = object;
    }
    triple.predicate = nodeFromIri(predIri, prefixes);
    if (required) return triple;
    else return wrapInOptional(triple);
}

function makeAs(
    varName: string,
    alias: string
) : string {
    return "(?" + varName + " AS ?" + alias + ")";
}

export function buildSingleTableQuery(
    model: StructureModel
) : SparqlSelectQuery {
    const query = new SparqlSelectQuery();
    query.prefixes = {};
    query.select = [];
    query.where = new SparqlPattern();
    query.where.elements = [];
    const varGen = new VariableGenerator();
    buildSingleQueryRecursive(query.prefixes, query.select, query.where, model.roots[0].classes[0], varGen, "");
    return query;
}

function buildSingleQueryRecursive(
    prefixes: Record<string, string>,
    select: string[],
    where: SparqlPattern,
    currentClass: StructureModelClass,
    varGen: VariableGenerator,
    namePrefix: string
) : SparqlVariableNode {
    const subject = varGen.getNext();
    where.elements.push(makeTypeTriple(prefixes, subject, currentClass.cimIri));

    for (const property of currentClass.properties) {
        const dataType = property.dataTypes[0];
        const requiredValue = property.cardinalityMin > 0;
        if (dataType.isAssociation()) {
            const associatedClass = dataType.dataType;
            if (associatedClass.properties.length === 0) {
                const object = varGen.getNext();
                where.elements.push(propertyToElement(prefixes, subject, property.cimIri, object, requiredValue, property.isReverse));
                select.push(makeAs(object.variableName, namePrefix + property.technicalLabel));
            }
            else {
                let targetPattern = where;
                if (!requiredValue) {
                    const opt = prepareOptional();
                    targetPattern = opt.optionalPattern;
                    where.elements.push(opt);
                }
                const propSubject = buildSingleQueryRecursive(prefixes, select, targetPattern, associatedClass, varGen, namePrefix + property.technicalLabel + nameSeparator);
                targetPattern.elements.push(propertyToElement(prefixes, subject, property.cimIri, propSubject, true, property.isReverse));
            }
        }
        else if (dataType.isAttribute()) {
            const object = varGen.getNext();
            where.elements.push(propertyToElement(prefixes, subject, property.cimIri, object, requiredValue));
            select.push(makeAs(object.variableName, namePrefix + property.technicalLabel));
        }
        else assertFailed("Unexpected datatype!");
    }

    return subject;
}

function prepareOptional() : SparqlOptionalPattern {
    const opt = new SparqlOptionalPattern();
    opt.optionalPattern = new SparqlPattern();
    opt.optionalPattern.elements = [];
    return opt;
}

function wrapInOptional(
    element: SparqlElement
) : SparqlOptionalPattern {
    const opt = prepareOptional();
    opt.optionalPattern.elements.push(element);
    return opt;
}

/**
 * Creates an RDF triple node from an IRI and adds a necessary prefix to query.
 */
function nodeFromIri(
    iriString: string,
    queryPrefixes: Record<string, string>
) : SparqlQNameNode {
    const separatedIri = splitIri(iriString);
    const prefix = addPrefix(separatedIri.namespace, queryPrefixes);
    const node = new SparqlQNameNode();
    node.qname = [prefix, separatedIri.local];
    return node;
}

/**
 * Splits full absolute IRI into a namespace and a local part.
 */
export function splitIri(
    fullIri: string
) : { namespace: string, local: string} {
    let lastBreak = 0;
    for (let i = 0; i < fullIri.length; i++) {
        if (fullIri[i] === "/" || fullIri[i] === "#") lastBreak = i;
    }
    return { namespace: fullIri.slice(0, lastBreak + 1), local: fullIri.slice(lastBreak + 1) }
}

/**
 * Creates a prefix from a namespace IRI, adds the namespace into a query and returns the prefix.
 */
export function addPrefix(
    namespaceIri: string,
    queryPrefixes: Record<string, string>
) : string {
    // Check if the namespace is already present.
    for (const ns in queryPrefixes) {
        if (queryPrefixes[ns] === namespaceIri) return ns;
    }

    // Check if the namespace is well-known.
    for (const key in csvwContext["@context"]) {
        if (csvwContext["@context"][key] === namespaceIri) {
            queryPrefixes[key] = namespaceIri;
            return key;
        }
    }

    // Find max number of generic prefix.
    const genericPrefix = "ns";
    let max = 0;
    for (const ns in queryPrefixes) {
        if (ns.slice(0, genericPrefix.length) === genericPrefix) {
            let nsNumber = parseInt(ns.slice(genericPrefix.length));
            if (nsNumber > max) max = nsNumber;
        }
    }
    const newPrefix = genericPrefix + (max + 1).toString();
    queryPrefixes[newPrefix] = namespaceIri;
    return newPrefix;
}

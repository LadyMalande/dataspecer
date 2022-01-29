import {DataSpecification} from "@model-driven-data/core/data-specification/model/data-specification";
import {PlantUmlImageGenerator} from "../artifacts/plant-uml-image-generator";
import {BIKESHED} from "@model-driven-data/core/bikeshed";
import {BikeshedHtmlGenerator} from "../artifacts/bikeshed-html-generator";
import {DataSpecificationDocumentation} from "@model-driven-data/core/data-specification/model";
import {PlantUmlGenerator} from "@model-driven-data/core/plant-uml";
import {DataSpecificationSchema} from "@model-driven-data/core/data-specification/model/data-specification-schema";
import {JSON_SCHEMA} from "@model-driven-data/core/json-schema/json-schema-vocabulary";
import {XML_SCHEMA} from "@model-driven-data/core/xml-schema/xml-schema-vocabulary";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {DataSpecificationArtefact} from "@model-driven-data/core/data-specification/model/data-specification-artefact";
import {GeneratorOptions} from "./generator-options";

/**
 * This class is responsible for setting the artifacts definitions in
 * {@link DataSpecification}. This class should be highly configurable, allowing
 * to set various parameters for how the resulting generated object should look
 * like.
 */
export class ArtifactDefinitionConfigurator {
  private readonly dataSpecifications: DataSpecification[];
  private readonly store: CoreResourceReader;

  constructor(
    dataSpecifications: DataSpecification[],
    store: CoreResourceReader,
  ) {
    this.dataSpecifications = dataSpecifications;
    this.store = store;
  }

  /**
   * Sets {@link DataSpecification.artefacts} field for the given specification.
   * @param dataSpecificationIri Iri of the specification to set the artifacts for.
   * @param generatorOptions Defines which artifacts should be generated.
   */
  public async setConfigurationForSpecification(
    dataSpecificationIri: string,
    generatorOptions: GeneratorOptions,
  ): Promise<void> {
    const dataSpecification = this.dataSpecifications.find(
      dataSpecification => dataSpecification.iri === dataSpecificationIri,
    );

    if (dataSpecification === undefined) {
      throw new Error(`Data specification with IRI ${dataSpecificationIri} not found.`);
    }

    // unique name for the whole data specification
    const dataSpecificationName = dataSpecification.iri?.split('/').pop() as string ?? "data-specification"; // todo use real name

    // Generate schemas

    const currentSchemaArtefacts: DataSpecificationArtefact[] = [];
    for (const psmSchemaIri of dataSpecification.psms) {
      // unique name of current data structure (DPSM) in context of the data specification
      const name = psmSchemaIri.split('/').pop() as string; // todo use real name

      if (generatorOptions.requiredDataStructureSchemas[psmSchemaIri]?.includes("json")) {
        const jsonSchema = new DataSpecificationSchema();
        jsonSchema.iri = `${name}#jsonschema`;
        jsonSchema.outputPath = `${dataSpecificationName}/${name}/schema.json`;
        jsonSchema.publicUrl = jsonSchema.outputPath;
        jsonSchema.generator = JSON_SCHEMA.Generator;
        jsonSchema.psm = psmSchemaIri;

        currentSchemaArtefacts.push(jsonSchema);
      }

      if (generatorOptions.requiredDataStructureSchemas[psmSchemaIri]?.includes("xml")) {
        const xmlSchema = new DataSpecificationSchema();
        xmlSchema.iri = `${name}#xmlschema`;
        xmlSchema.outputPath = `${dataSpecificationName}/${name}/schema.xsd`;
        xmlSchema.publicUrl = xmlSchema.outputPath;
        xmlSchema.generator = XML_SCHEMA.Generator;
        xmlSchema.psm = psmSchemaIri;

        currentSchemaArtefacts.push(xmlSchema);
      }
    }

    // PlantUML source
    const plantUml = new DataSpecificationDocumentation();
    plantUml.outputPath = `${dataSpecificationName}/conceptualModel.plantuml`;
    plantUml.publicUrl = plantUml.outputPath;
    plantUml.generator = PlantUmlGenerator.IDENTIFIER;

    // PlantUml image
    const plantUmlImage = new DataSpecificationDocumentation();
    plantUmlImage.outputPath = `${dataSpecificationName}/conceptualModel.png`;
    plantUmlImage.publicUrl = plantUmlImage.outputPath;
    plantUmlImage.generator = PlantUmlImageGenerator.IDENTIFIER;

    // Bikeshed source
    const bikeshed = new DataSpecificationDocumentation();
    bikeshed.outputPath = `${dataSpecificationName}/documentation.bs`;
    bikeshed.publicUrl = bikeshed.outputPath;
    bikeshed.generator = BIKESHED.Generator;
    bikeshed.artefacts =
      currentSchemaArtefacts.map(artefact => artefact.iri as string);

    // Bikeshed HTML
    const bikeshedHtml = new DataSpecificationDocumentation();
    bikeshedHtml.outputPath = `${dataSpecificationName}/documentation.html`;
    bikeshedHtml.publicUrl = bikeshedHtml.outputPath;
    bikeshedHtml.generator = BikeshedHtmlGenerator.IDENTIFIER;
    bikeshedHtml.artefacts =
      currentSchemaArtefacts.map(artefact => artefact.iri as string);

    // Override the value
    dataSpecification.artefacts = [
      ...currentSchemaArtefacts,
      plantUml,
      plantUmlImage,
      bikeshed,
      bikeshedHtml,
    ];
  }
}

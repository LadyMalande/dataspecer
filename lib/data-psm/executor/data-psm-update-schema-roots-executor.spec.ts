import {CoreResourceReader, createCoreResource} from "../../core";
import {
  asDataPsmUpdateSchemaRoots,
} from "../operation";
import {
  executeDataPsmUpdateSchemaRoots,
} from "./data-psm-update-schema-roots-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Set data PSM class as a schema root.", async () => {
  const operation =
    asDataPsmUpdateSchemaRoots(createCoreResource());
  operation.dataPsmRoots = ["http://class"];

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmUpdateSchemaRoots(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": operation.dataPsmRoots,
      "dataPsmParts": ["http://class"],
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}

import React, {useCallback, useContext} from "react";
import AddIcon from "@mui/icons-material/Add";
import {Fab} from "@mui/material";
import {useToggle} from "../../use-toggle";
import {BackendConnectorContext, DataSpecificationsContext} from "../../app";
import {SetPimLabelAndDescription} from "../../shared/set-pim-label-and-description";
import {Resource} from "@model-driven-data/federated-observable-store/resource";
import {useFederatedObservableStore} from "@model-driven-data/federated-observable-store-react/store";
import {SpecificationEditDialog} from "../../components/specification-edit-dialog";
import {LanguageString} from "@model-driven-data/core/core";

export const CreateSpecification: React.FC = () => {
    const dialog = useToggle();

    const {
        dataSpecifications,
        setDataSpecifications,
        rootDataSpecificationIris,
        setRootDataSpecificationIris,
    } = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);
    const store = useFederatedObservableStore();
    const create = useCallback(async ({label}: {label?: LanguageString}) => {
        const dataSpecification = await backendConnector.createDataSpecification();
        const pim = dataSpecification.pim as string;

        // Wait for store to be initialized
        await new Promise<void>(resolve => {
            const subscriber = (iri: string, resource: Resource) => {
                if (resource.resource) {
                    store.removeSubscriber(pim, subscriber);
                    resolve();
                }
            }
            store.addSubscriber(pim, subscriber);

            setDataSpecifications({
                ...dataSpecifications,
                [dataSpecification.iri as string]: dataSpecification
            });
            setRootDataSpecificationIris([...rootDataSpecificationIris, dataSpecification.iri as string]);
        });

        if (label) {
            const op = new SetPimLabelAndDescription(pim, label, {});
            await store.executeComplexOperation(op);
        }
        dialog.close();
    }, [backendConnector, store, dialog, setDataSpecifications, dataSpecifications, setRootDataSpecificationIris, rootDataSpecificationIris]);

    return <>
        <Fab variant="extended" size="medium" color={"primary"} onClick={dialog.open}>
            <AddIcon sx={{mr: 1}}/>
            Create new
        </Fab>
        <SpecificationEditDialog
            isOpen={dialog.isOpen}
            close={dialog.close}
            mode="create"
            onSubmit={create}
        />
    </>
}

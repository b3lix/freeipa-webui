import React, { useState } from "react";
// PatternFly
import {
  TextContent,
  Text,
  TextVariants,
  Radio,
  Button,
} from "@patternfly/react-core";
// Layouts
import ModalWithFormLayout from "src/components/layouts/ModalWithFormLayout";
// Tables
import DeletedUsersTable from "src/components/tables/DeletedUsersTable";
// Redux
import { useAppDispatch } from "src/store/hooks";
import { removeUser as removeActiveUser } from "src/store/Identity/activeUsers-slice";
import { removeUser as removeStageUser } from "src/store/Identity/stageUsers-slice";
import { removeUser as removePreservedUser } from "src/store/Identity/preservedUsers-slice";
// RPC
import {
  Command,
  BatchRPCResponse,
  useBatchMutCommandMutation,
} from "src/services/rpc";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { SerializedError } from "@reduxjs/toolkit";
// Modals
import ErrorModal from "./ErrorModal";
import { ErrorData } from "src/utils/datatypes/globalDataTypes";

interface ButtonsData {
  updateIsDeleteButtonDisabled?: (value: boolean) => void;
  updateIsDeletion: (value: boolean) => void;
}

interface SelectedUsersData {
  selectedUsers: string[];
  updateSelectedUsers: (newSelectedUsers: string[]) => void;
}

export interface PropsToDeleteUsers {
  show: boolean;
  from: "active-users" | "stage-users" | "preserved-users";
  handleModalToggle: () => void;
  selectedUsersData: SelectedUsersData;
  buttonsData: ButtonsData;
  //  NOTE: 'onRefresh' is handled as { (User) => void | undefined } as a temporal solution
  //    until the C.L. is adapted in 'stage-' and 'preserved users' (otherwise
  //    the operation will fail for those components)
  onRefresh?: () => void;
  //  NOTE: 'onOpenAddModal' is handled as { () => void | undefined } as a temporal solution
  //    until the C.L. is adapted in 'stage-' and 'preserved users' (otherwise
  //    the operation will fail for those components)
  onOpenDeleteModal?: () => void;
  //  NOTE: 'onCloseAddModal' is handled as { () => void | undefined } as a temporal solution
  //    until the C.L. is adapted in 'stage-' and 'preserved users' (otherwise
  //    the operation will fail for those components)
  onCloseDeleteModal?: () => void;
}

const DeleteUsers = (props: PropsToDeleteUsers) => {
  // Set dispatch (Redux)
  const dispatch = useAppDispatch();

  // Define 'executeUserDelCommand' to add user data to IPA server
  const [executeUserDelCommand] = useBatchMutCommandMutation();

  // Radio buttons states
  const [isDeleteChecked, setIsDeleteChecked] = useState(true);

  // Only one radio button must be checked
  const manageRadioButtons = () => {
    setIsDeleteChecked(!isDeleteChecked);
  };

  // Generate page name (based on 'from' text)
  // E.g.: 'active-users' --> 'Active users'
  const getUserPageName = () => {
    const capitalizedName =
      props.from.charAt(0).toUpperCase() + props.from.slice(1);
    return capitalizedName.replace("-", " ");
  };

  // List of fields
  const fields = [
    {
      id: "question-text",
      pfComponent: (
        <TextContent>
          <Text component={TextVariants.p}>
            Are you sure you want to remove the selected entries from{" "}
            {getUserPageName()}?
          </Text>
        </TextContent>
      ),
    },
    {
      id: "deleted-users-table",
      pfComponent: (
        <DeletedUsersTable
          usersToDelete={props.selectedUsersData.selectedUsers}
          from={props.from}
        />
      ),
    },
    {
      id: "radio-buttons",
      pfComponent: (
        <>
          <TextContent>
            <Text component={TextVariants.p}>Remove mode</Text>
          </TextContent>
          <Radio
            id="radio-delete"
            label="Delete"
            name="radio-delete"
            isChecked={isDeleteChecked}
            onChange={manageRadioButtons}
          />
          <Radio
            id="radio-preserve"
            label="Preserve"
            name="radio-preserve"
            isChecked={!isDeleteChecked}
            onChange={manageRadioButtons}
          />
        </>
      ),
    },
  ];

  // Close modal
  const closeModal = () => {
    setIsDeleteChecked(true);
    props.handleModalToggle();
  };

  // Redux: Delete user
  const deleteUsersFromRedux = () => {
    props.selectedUsersData.selectedUsers.map((user) => {
      if (props.from === "active-users") {
        dispatch(removeActiveUser(user[0]));
      } else if (props.from === "stage-users") {
        dispatch(removeStageUser(user[0]));
      } else if (props.from === "preserved-users") {
        dispatch(removePreservedUser(user[0]));
      }
    });
  };

  // Handle API error data
  const [isModalErrorOpen, setIsModalErrorOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const closeAndCleanErrorParameters = () => {
    setIsModalErrorOpen(false);
    setErrorTitle("");
    setErrorMessage("");
  };

  const onCloseErrorModal = () => {
    closeAndCleanErrorParameters();
  };

  const errorModalActions = [
    <Button key="cancel" variant="link" onClick={onCloseErrorModal}>
      OK
    </Button>,
  ];

  const handleAPIError = (error: FetchBaseQueryError | SerializedError) => {
    if ("code" in error) {
      setErrorTitle("IPA error " + error.code + ": " + error.name);
      if (error.message !== undefined) {
        setErrorMessage(error.message);
      }
    } else if ("data" in error) {
      const errorData = error.data as ErrorData;
      const errorCode = errorData.code as string;
      const errorName = errorData.name as string;
      const errorMessage = errorData.error as string;

      setErrorTitle("IPA error " + errorCode + ": " + errorName);
      setErrorMessage(errorMessage);
    }
    setIsModalErrorOpen(true);
  };

  // Delete user
  const deleteUsersNew = (uidsToDelete: string[]) => {
    // Prepare users params
    const uidsToDeletePayload: Command[] = [];

    const deletionParams = { preserve: !isDeleteChecked };
    uidsToDelete.map((uid) => {
      const payloadItem = {
        method: "user_del",
        params: [[uid], deletionParams],
      } as Command;
      uidsToDeletePayload.push(payloadItem);
    });

    // [API call] Delete elements
    executeUserDelCommand(uidsToDeletePayload).then((response) => {
      if ("data" in response) {
        const data = response.data as BatchRPCResponse;
        const result = data.result;
        const error = data.error as FetchBaseQueryError | SerializedError;

        if (result) {
          if ("error" in result.results[0] && result.results[0].error) {
            const errorData = {
              code: result.results[0].error_code,
              name: result.results[0].error_name,
              error: result.results[0].error,
            } as ErrorData;

            const error = {
              status: "CUSTOM_ERROR",
              data: errorData,
            } as FetchBaseQueryError;

            // Handle error
            handleAPIError(error);
          } else {
            // Update data from Redux
            deleteUsersFromRedux();

            // Reset selected values
            props.selectedUsersData.updateSelectedUsers([]);

            // Disable 'Delete' button
            if (
              props.from === "active-users" &&
              props.buttonsData.updateIsDeleteButtonDisabled !== undefined
            ) {
              props.buttonsData.updateIsDeleteButtonDisabled(true);
            }
            props.buttonsData.updateIsDeletion(true);

            // Refresh data
            if (props.onRefresh !== undefined) {
              props.onRefresh();
            }

            closeModal();
          }
        } else if (error) {
          // Handle error
          handleAPIError(error);
        }
      }
    });
  };

  // Delete users (for components not adapted to communication layer)
  //  NOTE: This function will dissapear when all user types will be adapted to C.L.
  const deleteUsers = () => {
    deleteUsersFromRedux();

    props.selectedUsersData.updateSelectedUsers([]);
    if (
      props.from === "active-users" &&
      props.buttonsData.updateIsDeleteButtonDisabled !== undefined
    ) {
      props.buttonsData.updateIsDeleteButtonDisabled(true);
    }
    props.buttonsData.updateIsDeletion(true);
    closeModal();
  };

  // [Temporal solution] Defines which function is used to delete users
  const setDeleteFunction = () => {
    if (props.from === "active-users") {
      return deleteUsersNew(props.selectedUsersData.selectedUsers);
    } else {
      // 'stage' and 'preserved users'
      return deleteUsers();
    }
  };

  // Set the Modal and Action buttons for 'Delete' option
  const modalActionsDelete: JSX.Element[] = [
    <Button
      key="delete-users"
      variant="danger"
      onClick={setDeleteFunction}
      form="active-users-remove-users-modal"
    >
      Delete
    </Button>,
    <Button key="cancel-new-user" variant="link" onClick={closeModal}>
      Cancel
    </Button>,
  ];

  const modalDelete: JSX.Element = (
    <ModalWithFormLayout
      variantType="medium"
      modalPosition="top"
      offPosition="76px"
      title="Remove active users"
      formId="active-users-remove-users-modal"
      fields={fields}
      show={props.show}
      onClose={closeModal}
      actions={modalActionsDelete}
    />
  );

  // Preserve users
  // TODO: Remove this to adapt the general solution
  //   to all user pages when the C.L. is fully implemented
  const setPreserveFunction = () => {
    if (props.from === "active-users") {
      return deleteUsersNew(props.selectedUsersData.selectedUsers);
    } else {
      // User pages not adapted to communication layer
      return alert("This functionality will be provided soon!");
    }
  };

  // Set the Modal and Action buttons for 'Preserve' option
  const modalActionsPreserve: JSX.Element[] = [
    <Button
      key="preserve-users"
      variant="primary"
      onClick={setPreserveFunction}
      form="active-users-remove-users-modal"
    >
      Preserve
    </Button>,
    <Button key="cancel-new-user" variant="link" onClick={closeModal}>
      Cancel
    </Button>,
  ];

  const modalPreserve: JSX.Element = (
    <ModalWithFormLayout
      variantType="medium"
      modalPosition="top"
      offPosition="76px"
      title="Remove active users"
      formId="active-users-remove-users-modal"
      fields={fields}
      show={props.show}
      onClose={closeModal}
      actions={modalActionsPreserve}
    />
  );

  // Render 'DeleteUsers'
  return (
    <>
      {isDeleteChecked ? modalDelete : modalPreserve}
      {isModalErrorOpen && (
        <ErrorModal
          title={errorTitle}
          isOpen={isModalErrorOpen}
          onClose={onCloseErrorModal}
          actions={errorModalActions}
          errorMessage={errorMessage}
        />
      )}
    </>
  );
};

export default DeleteUsers;

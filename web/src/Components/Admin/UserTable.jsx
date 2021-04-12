import UserDialog from "./UserDialog";
import MTable from "./MTable";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function UserTable(props) {
  const { onDelete, onModify } = props;
  const [dialogData, setDialogData] = useState();
  const { t } = useTranslation();

  const showDialog = (e, rowData) => {
    setDialogData(rowData);
  };

  return (
    <div>
      <MTable
        onRowClick={showDialog}
        columns={[
          { title: t("username"), field: "username", type: "numeric" },
          // { title: t("idNum"), field: "idNum", type: "string" },
          { title: t("phone"), field: "phone", type: "string", emptyValue: t("null") },
          { title: t("isAdmin"), field: "isAdmin", type: "boolean" },
        ]}
        {...props}
      />
      <UserDialog
        open={!!dialogData}
        onClose={() => setDialogData(null)}
        rowData={dialogData}
        onDelete={onDelete}
        onModify={onModify}
      />
    </div>
  );
}

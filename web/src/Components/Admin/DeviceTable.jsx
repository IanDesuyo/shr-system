import DeviceDialog from "./DeviceDialog";
import MTable from "./MTable";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function DeviceTable(props) {
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
          { title: t("id"), field: "id", type: "numeric" },
          { title: t("uuid"), field: "uuid", type: "string" },
          { title: t("comment"), field: "comment", type: "string", emptyValue: t("null") },
        ]}
        {...props}
      />
      <DeviceDialog open={!!dialogData} onClose={() => setDialogData(null)} rowData={dialogData} onDelete={onDelete} onModify={onModify} />
    </div>
  );
}

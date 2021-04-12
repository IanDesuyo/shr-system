import RecordDialog from "./RecordDialog";
import MTable, { tableIcons } from "./MTable";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SearchTable(props) {
  const { onDelete } = props;
  const { t } = useTranslation();
  const [dialogData, setDialogData] = useState();

  const showDialog = (e, rowData) => {
    setDialogData(rowData);
  };

  return (
    <div>
      <MTable
        onRowClick={showDialog}
        columns={[
          {
            title: t("person"),
            field: "person.username",
            render: rowData => <p>{rowData.person.username || `${t("guest")}(${rowData.person.phone})`}</p>,
          },
          {
            title: `${t("temperature")}(${t("verified")})`,
            field: "temperature",
            type: "numeric",
            render: rowData => (
              <p>
                {`${rowData.temperature}°C`}
                {rowData.verifiedDevice ? <tableIcons.Check /> : <tableIcons.Clear />}
              </p>
            ),
          },
          { title: t("createdAt"), field: "createdAt", type: "datetime" },
          { title: t("leastUse"), field: "leastUse", type: "datetime", emptyValue: t("null") },
          { title: t("stayTime"), field: "stayTime", type: "numeric", emptyValue: t("null") },
        ]}
        {...props}
      />
      <RecordDialog open={!!dialogData} onClose={() => setDialogData(null)} rowData={dialogData} onDelete={onDelete} />
    </div>
  );
}

import { Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../Services/Auth";
import { Line } from "react-chartjs-2";
import { fetchByDate } from "../../Services/API";
import Snackbar from "../../Services/Snackbar";
import { useTranslation } from "react-i18next";
import Paper from "../../Components/Admin/StyledPaper";

function doResult(data, t) {
  let dataSet = { labels: [] };
  let users = [];
  let guests = [];

  for (var i = 0; i < 24; i++) {
    dataSet.labels[i] = `${i}:00`;
    users[i] = 0;
    guests[i] = 0;
  }

  data.forEach((val, index) => {
    let hour = new Date(val.leastUse).getHours();
    if (val.person.username) {
      users[hour] += 1;
    } else {
      guests[hour] += 1;
    }
  });

  dataSet.datasets = [
    {
      label: t("user"),
      data: users,
      fill: false,
      backgroundColor: "rgb(54, 162, 235)",
      borderColor: "rgb(54, 162, 235)",
    },
    {
      label: t("guest"),
      data: guests,
      fill: false,
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgb(255, 99, 132)",
    },
  ];
  return dataSet;
}

export default function Home() {
  const { token } = useAuth();
  const [data, setData] = useState();
  const { t } = useTranslation();

  const fetchToday = () => {
    let today = new Date();
    let start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    let end = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    fetchByDate(token, start, end)
      .then(res => setData(doResult(res.data, t)))
      .catch(err => Snackbar.error(t(err)));
  };

  useEffect(fetchToday, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Paper open={!data}>
        <Typography align="center" variant="h5">
          本日使用曲線圖
        </Typography>
        <Line
          data={data || {}}
          options={{
            legend: {
              labels: {
                fontColor: "white",
              },
            },
            scales: {
              yAxes: [
                {
                  ticks: { stepSize: 1 },
                },
              ],
            },
          }}
        />
      </Paper>
    </>
  );
}

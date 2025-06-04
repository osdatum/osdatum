import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import Home from "./Home";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const TideChart = () => {
  const [tideData, setTideData] = useState([]);

  useEffect(() => {
    // Contoh data pasut
    const sampleData = [
      { time: "00:00", height: 120 },
      { time: "06:00", height: 200 },
      { time: "12:00", height: 150 },
      { time: "18:00", height: 180 },
    ];
    setTideData(sampleData);
  }, []);

  const data = {
    labels: tideData.map((item) => item.time),
    datasets: [
      {
        label: "Tinggi Pasut (cm)",
        data: tideData.map((item) => item.height),
        borderColor: "#4A90E2",
        backgroundColor: "rgba(74, 144, 226, 0.2)",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Waktu",
        },
      },
      y: {
        title: {
          display: true,
          text: "Tinggi Pasut (cm)",
        },
      },
    },
  };

  return (
    <>
    <div className="chart pb-10">
      <div className="container mx-auto px-4">
        <div className="box items-center gap-20 pt-32">
          <div style={{ width: "100%", height: "400px" }}>
          <h1 className=" text-3xl/tight font-medium mb-7">Grafik Pasang Surut</h1>
          <Line data={data} options={options} />
          </div>
        </div>
      </div>
    </div>
    <Home />
    </>


  );
};

export default TideChart;
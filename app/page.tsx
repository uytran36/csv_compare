"use client";
import React, { useState, ChangeEvent, useRef } from "react";

export default function Home() {
  const [csvDataUp, setCsvDataUp] = useState<any[] | null>(null);
  const [csvDataDown, setCsvDataDown] = useState<any[] | null>(null);
  const [rowError, setRowError] = useState<any[] | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const handleFileUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    side: string
  ) => {
    const file = event.target.files?.[0];
    let rows: any[] = [];

    if (file) {
      rows = (await file.text()).split("\n").filter((row, i) => i !== 0);
      for (let i = 0; i <= rows.length; i++) {
        if (rows[i] === undefined) {
          continue;
        }
        let dataInRow = rows[i]
          .split(",")
          .filter(
            (row: any) =>
              row !== '""' && row !== undefined && row !== "" && row !== "\r"
          )
          .map((row: any) => row.replace(/(\r\n|\n|\r)/gm, ""));
        console.log(dataInRow);
        dataInRow.sort();

        rows[i] = dataInRow.join(",");
      }

      if (side === "up") {
        setCsvDataUp(rows.sort());
      } else {
        setCsvDataDown(rows.sort());
      }
    }
  };

  const compare = () => {
    if (JSON.stringify(csvDataUp) !== JSON.stringify(csvDataDown)) {
      let errorRows: any[] = [];
      csvDataUp?.forEach((row, index) => {
        if (row !== csvDataDown?.[index]) {
          errorRows.push(
            JSON.stringify(row) + JSON.stringify(csvDataDown?.[index])
          );
        }
      });
      setRowError(errorRows);
    } else {
      setRowError([]);
    }
  };

  const resetForm = () => {
    setCsvDataUp(null);
    setCsvDataDown(null);
    setRowError([]);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      <h1 className="text-4xl font-bold mb-10">CSV Compare Page</h1>
      <form ref={formRef} className="flex flex-col items-center justify-center">
        <input
          className="mb-4  border border-gray-300 rounded py-2 px-4"
          type="file"
          accept=".csv"
          onChange={(e) => handleFileUpload(e, "up")}
        />
        <input
          className="mb-4 border border-gray-300 rounded py-2 px-4"
          type="file"
          accept=".csv"
          onChange={(e) => handleFileUpload(e, "down")}
        />
        <div
          className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded my-4"
          onClick={compare}
        >
          Compare
        </div>
        <button
          className="bg-gray-500 hover:bg-gray-700 active:bg-gray-800 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={resetForm}
        >
          Reset
        </button>
      </form>
      {rowError !== null && rowError.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">
            {rowError?.map((row, index) => (
              <div key={index}>{row}</div>
            ))}
          </span>
        </div>
      )}
      {csvDataUp !== null && csvDataDown !== null && rowError?.length === 0 && (
        <div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">CSV files are the same</span>
          </div>
        </div>
      )}
    </div>
  );
}

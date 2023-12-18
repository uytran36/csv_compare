"use client";
import React, { useState, ChangeEvent, useRef } from "react";
import Papa from "papaparse";
import dayjs from "dayjs";
import { deepCompareObjects } from "../utils/deepCompare";

export default function Home() {
  const [dict, setDict] = useState<any[] | null>(null);
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [jsonData, setJsonData] = useState<string | null>(null);
  const [rowError, setRowError] = useState<any[] | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const handleFileUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0];
    let rows: any[] = [];

    if (file) {
      Papa.parse(file, {
        header: true,
        complete: function (results) {
          rows = results.data;
          if (type === "map") {
            setDict(rows);
          } else {
            setCsvData(rows);
          }
        },
      });
    }
  };

  const compare = () => {
    let mappedData: any[] = [];

    type DictEntry = { csv: string; json: string };
    const mapKeys = (obj: Record<string, any>, dict: DictEntry[]) => {
      const mappedObj: Record<string, any> = {};

      dict.forEach((entry) => {
        if (entry.csv in obj) {
          mappedObj[entry.json] = obj[entry.csv];
        }
      });
      return mappedObj;
    };

    csvData?.forEach((row) => {
      if (dict === null) return;
      const newRow = mapKeys(row, dict);
      mappedData.push(newRow);
    });

    // map value of each key when value is an empty string or null to emtpy string, with value is date format, convert it to format YYYY-MM-DD HH:mm:ss.SSS
    const mapJsonData = (obj: Record<string, any>) => {
      const mappedObj: Record<string, any> = {};
      const isValidDateFormat = (dateString: string): boolean => {
        const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        return regex.test(dateString);
      };

      const isValidFloat = (floatString: string): boolean => {
        const regex = /^\d+(\.\d+)?$/;
        return regex.test(floatString);
      };

      Object.keys(obj).forEach((key) => {
        if (obj[key] === "" || obj[key] === null) {
          mappedObj[key] = "";
        } else if (isValidDateFormat(obj[key])) {
          mappedObj[key] = dayjs(obj[key]).format("YYYY-MM-DD HH:mm:ss.SSS");
        } else if (isValidFloat(obj[key]) && obj[key].includes(".00")) {
          // remove .00 in float number
          mappedObj[key] = obj[key].replace(".00", "");
        } else {
          mappedObj[key] = obj[key];
        }
      });
      return mappedObj;
    };

    const mappedJsonData: any[] = [];
    JSON.parse(jsonData || "{}")?.data?.forEach((row: any) => {
      mappedJsonData.push(mapJsonData(row));
    });

    console.log(mappedData);
    console.log("-------------------");
    console.log(mappedJsonData);

    if (!!jsonData && !!csvData) {
      let errorRows: any[] = [];

      for (let i = 0; i < csvData.length; i++) {
        let isExist = false;
        for (let j = 0; j < mappedJsonData.length; j++) {
          if (deepCompareObjects(mappedData[i], mappedJsonData[j])) {
            isExist = true;
            continue;
          }
        }
        if (!isExist) {
          errorRows.push(JSON.stringify(mappedData[i]));
        }
      }
      setRowError(errorRows);
    } else {
      setRowError([]);
    }
  };

  const resetForm = () => {
    setCsvData(null);
    setJsonData(null);
    setDict(null);
    setRowError([]);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      <h1 className="text-4xl font-bold mb-10">CSV Compare Page</h1>
      <form ref={formRef} className="flex flex-col items-center justify-center">
        <div>
          <label className="mr-2">Map File</label>
          <input
            className="mb-4 border border-gray-300 rounded py-2 px-4"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e, "map")}
          />
        </div>
        <div>
          <label className="mr-2">Data File</label>
          <input
            className="mb-4  border border-gray-300 rounded py-2 px-4"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e, "data")}
          />
        </div>
        <textarea
          className="mb-4 w-[50.5rem] border bg-inherit border-gray-300 rounded py-2 px-4"
          placeholder="Data return in API"
          rows={10}
          onChange={(e) => setJsonData(e.target.value)}
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
      {csvData !== null &&
        rowError?.length === 0 &&
        dict !== null &&
        !!jsonData && (
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

import { useState } from "react";
import Papa from "papaparse";
import db from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const UploadCSV = () => {
  const [data, setData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
      },
    });
  };

  const uploadToFirestore = async () => {
    const pasutCollection = collection(db, "pasutData");
    for (const row of data) {
      await addDoc(pasutCollection, row);
    }
    alert("Data berhasil diunggah!");
  };

  return (
    <div className="About">
      <div className="container mx-auto px-4">
        <div className="box items-center">
          <h1 className='gap-20 pt-32 mb-7 font-semibold'>Upload This!</h1>
          <h1 className=''>ini halaman upload.</h1>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="bg-red-300 rounded-full hover:bg-red-500 transition-all py-2 px-4"/>
          <button onClick={uploadToFirestore} className="bg-amber-300 rounded-full hover:bg-amber-500 transition-all py-2 px-4">Unggah ke Firestore</button>
        </div>
      </div>
    </div>
  );
};

export default UploadCSV;

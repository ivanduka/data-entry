import React, {useEffect} from 'react';
import json from "./data/example.json"

function App() {
  useEffect(() => {
    console.log(json)
  })

  return (
    <div className="m-3">
      <div className="">{json.data.timelineName}</div>
      <div className="">123!</div>
    </div>
  );
}

export default App;

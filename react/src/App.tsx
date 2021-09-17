import React, { useEffect, useRef, useState } from "react";
import project1 from "./data/project1.json";
import project2 from "./data/project2.json";
import { Spinner, DropdownButton, Dropdown } from "react-bootstrap";

const run = (f: () => void) => {
  (async () => {
    f();
  })();
};

const useDidMountEffect = (
  func: () => void,
  deps: React.DependencyList | undefined
) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};

const wait = async (seconds: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), seconds * 1000));

const db: { [name: string]: ITimeline } = {
  "Project 1": project1,
  "Nova Gas Transmission Ltd. - West Path Delivery 2023": project2,
};

const loadProjectsList = () => {
  return Object.keys(db);
};

const loadProject = (name: string) => {
  return db[name];
};

interface ITimeline {
  timelineName: string;
  phases: {
    name: string;
    groups: {
      name: string;
      icon: string;
      events: {
        name: string;
        description: string;
        icon: string;
        dateStart: string;
        dateEnd: string | null;
        dateDue: boolean;
        links: {
          description: string;
          href: string;
        }[];
      }[];
    }[];
  }[];
}

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [projectsList, setProjectsList] = useState<string[]>([]);
  const [currProjName, setCurrProjName] = useState<string | null>(null);
  const [currProj, setCurrProj] = useState<ITimeline | null>(null);

  useEffect(
    () =>
      run(async () => {
        const projectsList = loadProjectsList();
        await wait(1);
        setProjectsList(projectsList);
      }),
    []
  );

  useDidMountEffect(() => {
    setLoading(false);
  }, [projectsList]);

  if (loading || !projectsList) {
    return (
      <div className="m-1">
        <Spinner animation="border" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const projectSelector = (
    <DropdownButton title={currProjName || "Choose a project"}>
      {projectsList.map((p) => (
        <Dropdown.Item key={p} as="button" onClick={() => setCurrProjName(p)}>
          {p}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );

  return <div className="container m-2">{projectSelector}</div>;
}

export default App;

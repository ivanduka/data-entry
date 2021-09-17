import React, { useEffect, useRef, useState } from "react";
import project1 from "./data/project1.json";
import project2 from "./data/project2.json";
import { Spinner, DropdownButton, Dropdown } from "react-bootstrap";
import { cloneDeep, isEqual } from "lodash-es";

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

const loadProjectsList = async () => {
  await wait(1);
  return Object.keys(db);
};

const loadProject = async (name: string) => {
  await wait(1);
  return cloneDeep(db[name]);
};

const saveProject = async (name: string, project: ITimeline) => {
  await wait(1);
  db[name] = cloneDeep(project);
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
  const [currProj, setCurrProj] = useState<ITimeline | null>(null);
  const [proto, setProto] = useState<ITimeline | null>(null);

  useEffect(
    () =>
      run(async () => {
        const projectsList = await loadProjectsList();
        setProjectsList(projectsList);
      }),
    []
  );

  useDidMountEffect(() => {
    setLoading(false);
  }, [projectsList, currProj]);

  const getProject = async (name: string) => {
    setLoading(true);
    const proj = await loadProject(name);
    setCurrProj(proj);
    setProto(cloneDeep(proj));
  };

  if (loading) {
    return (
      <div className="container m-2">
        <Spinner animation="border" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const projectSelector = projectsList && (
    <DropdownButton
      className="my-2"
      title={(currProj && currProj.timelineName) || "Choose a project"}
    >
      {projectsList.map((p) => (
        <Dropdown.Item key={p} as="button" onClick={() => getProject(p)}>
          {p}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );

  const projectInfo = currProj && <div>{currProj.phases.length}</div>;

  return (
    <div className="container m-2">
      <div>{projectSelector}</div>
      <div>{projectInfo}</div>
    </div>
  );
}

export default App;

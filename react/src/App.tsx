import React, { useEffect, useRef, useState } from "react";
import project1 from "./data/project1.json";
import project2 from "./data/project2.json";
import { Spinner, DropdownButton, Dropdown, Button } from "react-bootstrap";
import { cloneDeep, isEqual } from "lodash-es";

const run = (f: () => void) => {
  (async () => {
    f();
  })();
};

const useDidMountEffect = (func: () => void, deps: React.DependencyList | undefined) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};

const wait = async (seconds: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), seconds * 1000));

const db: ITimeline[] = [project1, project2];

const loadProjectsList = async () => {
  await wait(0.5);
  return db.map((project) => ({ name: project.name, id: project.id }));
};

const loadProject = async (id: number) => {
  await wait(0.5);
  const project = db.find((p) => p.id === id)!;
  return cloneDeep(project);
};

const saveProject = async (project: ITimeline) => {
  await wait(0.5);
  const index = db.findIndex((p) => p.id === project.id);
  db[index] = project;
};

interface ILink {
  description: string;
  href: string;
}

interface IEvent {
  name: string;
  description: string;
  icon: string;
  dateStart: string;
  dateEnd: string | null;
  dateDue: boolean;
  links: ILink[];
}

interface IGroup {
  name: string;
  icon: string;
  events: IEvent[];
}

interface IPhase {
  name: string;
  groups: IGroup[];
}

interface ITimeline {
  id: number;
  name: string;
  phases: IPhase[];
}

const bold = (label: string, value: string) => (
  <>
    <span className="font-bold">{label}</span>
    {value}
  </>
);

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [projectsList, setProjectsList] = useState<{ name: string; id: number }[]>([]);
  const [currProj, setCurrProj] = useState<ITimeline | null>(null);
  const [proto, setProto] = useState<ITimeline | null>(null);

  const getProjectsList = async () => {
    const projectsList = await loadProjectsList();
    setProjectsList(projectsList);
  };

  useEffect(() => run(getProjectsList), []);

  useDidMountEffect(() => {
    setLoading(false);
  }, [projectsList, currProj, proto]);

  const getProject = async (id: number) => {
    setLoading(true);
    const proj = await loadProject(id);
    setCurrProj(proj);
    setProto(cloneDeep(proj));
  };

  const removePhase = (phaseIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    cp.phases.splice(phaseIdx, 1);
    setCurrProj(cp);
  };

  const removeGroup = (phaseIdx: number, groupIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    cp.phases[phaseIdx].groups.splice(groupIdx, 1);
    setCurrProj(cp);
  };

  const removeEvent = (phaseIdx: number, groupIdx: number, eventIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    cp.phases[phaseIdx].groups[groupIdx].events.splice(eventIdx, 1);
    setCurrProj(cp);
  };

  const removeLink = (phaseIdx: number, groupIdx: number, eventIdx: number, linkIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    cp.phases[phaseIdx].groups[groupIdx].events[eventIdx].links.splice(linkIdx, 1);
    setCurrProj(cp);
  };

  const movePhase = (move: number, phaseIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    [cp.phases[phaseIdx], cp.phases[phaseIdx - move]] = [cp.phases[phaseIdx - move], cp.phases[phaseIdx]];
    setCurrProj(cp);
  };

  const moveGroup = (move: number, phaseIdx: number, groupIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    [cp.phases[phaseIdx].groups[groupIdx], cp.phases[phaseIdx].groups[groupIdx - move]] = [
      cp.phases[phaseIdx].groups[groupIdx - move],
      cp.phases[phaseIdx].groups[groupIdx],
    ];
    setCurrProj(cp);
  };

  const moveEvent = (move: number, phaseIdx: number, groupIdx: number, eventIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    [
      cp.phases[phaseIdx].groups[groupIdx].events[eventIdx],
      cp.phases[phaseIdx].groups[groupIdx].events[eventIdx - move],
    ] = [
      cp.phases[phaseIdx].groups[groupIdx].events[eventIdx - move],
      cp.phases[phaseIdx].groups[groupIdx].events[eventIdx],
    ];
    setCurrProj(cp);
  };

  const moveLink = (move: number, phaseIdx: number, groupIdx: number, eventIdx: number, linkIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    [
      cp.phases[phaseIdx].groups[groupIdx].events[eventIdx].links[linkIdx],
      cp.phases[phaseIdx].groups[groupIdx].events[eventIdx].links[linkIdx - move],
    ] = [
      cp.phases[phaseIdx].groups[groupIdx].events[eventIdx].links[linkIdx - move],
      cp.phases[phaseIdx].groups[groupIdx].events[eventIdx].links[linkIdx],
    ];
    setCurrProj(cp);
  };

  const linkPlaceholder: ILink = {
    description: "Enter the link label",
    href: "Enter the link URL",
  };

  const addLink = (phaseIdx: number, groupIdx: number, eventIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    cp.phases[phaseIdx].groups[groupIdx].events[eventIdx].links.push(cloneDeep(linkPlaceholder));
    setCurrProj(cp);
  };

  const eventPlaceholder: IEvent = {
    name: "Enter the event name",
    description: "Enter the event description",
    icon: "Enter the event icon URL",
    dateStart: "0001-01-01",
    dateEnd: null,
    dateDue: false,
    links: [],
  };

  const addEvent = (phaseIdx: number, groupIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    cp.phases[phaseIdx].groups[groupIdx].events.push(cloneDeep(eventPlaceholder));
    setCurrProj(cp);
  };

  const groupPlaceholder: IGroup = {
    name: "Enter the group name",
    icon: "Enter the group icon URL",
    events: [cloneDeep(eventPlaceholder)],
  };

  const addGroup = (phaseIdx: number) => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    cp.phases[phaseIdx].groups.push(cloneDeep(groupPlaceholder));
    setCurrProj(cp);
  };

  const phasePlaceholder: IPhase = {
    name: "Enter a phase name",
    groups: [cloneDeep(groupPlaceholder)],
  };

  const addPhase = () => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    cp.phases.push(cloneDeep(phasePlaceholder));
    setCurrProj(cp);
  };

  const editProject = () => {
    if (currProj === null) return;
    const cp = cloneDeep(currProj);
    cp.name = window.prompt("Enter the new project name", currProj.name) || currProj.name;
    setCurrProj(cp);
  };

  const editPhase = (phaseIdx: number) => {
    if (currProj === null) return;
    const name = currProj.phases[phaseIdx].name;
    const result = window.prompt("Enter the new project name", name) || name;
    const cp = cloneDeep(currProj);
    cp.phases[phaseIdx].name = result;
    setCurrProj(cp);
  };

  const commitChanges = async () => {
    if (currProj === null) return;
    setLoading(true);
    await saveProject(currProj);
    await getProjectsList();
    setProto(currProj);
  };

  if (loading) {
    return (
      <div className="container m-2 mx-auto flex justify-center justify-center">
        <Spinner animation="border" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const projectSelector = projectsList && (
    <div className="my-2 flex items-center">
      <DropdownButton className="inline" title={(currProj && currProj.name) || "Choose a project"}>
        {projectsList.map(({ id, name }) => (
          <Dropdown.Item key={id} as="button" onClick={() => getProject(id)}>
            {name}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      {!isEqual(currProj, proto) && (
        <Button className="ml-2" variant="secondary" size="sm" onClick={commitChanges}>
          Save changes to the current project
        </Button>
      )}
    </div>
  );

  const projectInfo = currProj && (
    <div>
      <div className="flex items-center my-4">
        <div className="font-bold">{currProj.name}</div>
        <Button className="ml-2" variant="primary" size="sm" onClick={() => editProject()}>
          Edit name
        </Button>
      </div>
      <div>
        {currProj.phases.map((phase, phaseIndex) => (
          <div className="border-24 border-2 border-black rounded-2 p-2 mb-16 bg-red-200" key={phase.name}>
            <div className="flex items-center mb-4">
              <div className="">{bold(phase.name, ` (phase ${phaseIndex + 1} of ${currProj.phases.length})`)}</div>
              <Button
                className="ml-2"
                variant="danger"
                size="sm"
                onClick={() => removePhase(phaseIndex)}
                disabled={currProj.phases.length === 1}
              >
                Remove
              </Button>
              <Button
                className="ml-2"
                variant="warning"
                size="sm"
                onClick={() => movePhase(+1, phaseIndex)}
                disabled={phaseIndex === 0}
              >
                Up
              </Button>
              <Button
                className="ml-2"
                variant="warning"
                size="sm"
                onClick={() => movePhase(-1, phaseIndex)}
                disabled={phaseIndex === currProj.phases.length - 1}
              >
                Down
              </Button>
              <Button className="ml-2" variant="primary" size="sm" onClick={() => editPhase(phaseIndex)}>
                Edit name
              </Button>
            </div>
            <div className="ml-6">
              {phase.groups.map((group, groupIndex) => (
                <div className="border-2 border-black rounded-2 p-2 mb-16 bg-blue-200" key={group.name}>
                  <div className="flex items-center mb-4">
                    <div className="">{bold(group.name, ` (group ${groupIndex + 1} of ${phase.groups.length})`)}</div>
                    <Button
                      className="ml-2"
                      variant="danger"
                      size="sm"
                      onClick={() => removeGroup(phaseIndex, groupIndex)}
                      disabled={currProj.phases[phaseIndex].groups.length === 1}
                    >
                      Remove
                    </Button>
                    <Button
                      className="ml-2"
                      variant="warning"
                      size="sm"
                      onClick={() => moveGroup(+1, phaseIndex, groupIndex)}
                      disabled={groupIndex === 0}
                    >
                      Up
                    </Button>
                    <Button
                      className="ml-2"
                      variant="warning"
                      size="sm"
                      onClick={() => moveGroup(-1, phaseIndex, groupIndex)}
                      disabled={groupIndex === currProj.phases[phaseIndex].groups.length - 1}
                    >
                      Down
                    </Button>
                  </div>

                  <div className="">{bold("Icon: ", group.icon)}</div>
                  <div className="ml-6 mt-3">
                    {group.events.map((event, eventIndex) => (
                      <div className="border-2 border-black rounded-2 p-2 mb-16 bg-green-200" key={event.name}>
                        <div className="flex items-center mb-4">
                          <div className="">
                            {bold(event.name, ` (event ${eventIndex + 1} of ${group.events.length})`)}
                          </div>
                          <Button
                            className="ml-2"
                            variant="danger"
                            size="sm"
                            onClick={() => removeEvent(phaseIndex, groupIndex, eventIndex)}
                            disabled={currProj.phases[phaseIndex].groups[groupIndex].events.length === 1}
                          >
                            Remove
                          </Button>
                          <Button
                            className="ml-2"
                            variant="warning"
                            size="sm"
                            onClick={() => moveEvent(+1, phaseIndex, groupIndex, eventIndex)}
                            disabled={eventIndex === 0}
                          >
                            Up
                          </Button>
                          <Button
                            className="ml-2"
                            variant="warning"
                            size="sm"
                            onClick={() => moveEvent(-1, phaseIndex, groupIndex, eventIndex)}
                            disabled={eventIndex === currProj.phases[phaseIndex].groups[groupIndex].events.length - 1}
                          >
                            Down
                          </Button>
                        </div>
                        <div className="">{bold("Description: ", event.description)}</div>
                        <div className="">{bold("Icon: ", event.icon)}</div>
                        <div className="">{bold("Start date: ", event.dateStart)}</div>
                        <div className="">{bold("End date: ", event.dateEnd || "none")}</div>
                        <div className="">{bold("Event due: ", event.dateDue ? "yes" : "no")}</div>
                        <div className="ml-6 mt-2">
                          {event.links.length === 0
                            ? "(no links added)"
                            : event.links.map((link, linkIndex) => (
                                <div className="border-2 border-black rounded-2 p-2 mb-2 bg-yellow-100" key={linkIndex}>
                                  <div className="flex items-center mb-4">
                                    <div className="">
                                      {bold(link.description, ` (link ${linkIndex + 1} of ${event.links.length})`)}{" "}
                                    </div>
                                    <Button
                                      className="ml-2"
                                      variant="danger"
                                      size="sm"
                                      onClick={() => removeLink(phaseIndex, groupIndex, eventIndex, linkIndex)}
                                    >
                                      Remove
                                    </Button>
                                    <Button
                                      className="ml-2"
                                      variant="warning"
                                      size="sm"
                                      onClick={() => moveLink(+1, phaseIndex, groupIndex, eventIndex, linkIndex)}
                                      disabled={linkIndex === 0}
                                    >
                                      Up
                                    </Button>
                                    <Button
                                      className="ml-2"
                                      variant="warning"
                                      size="sm"
                                      onClick={() => moveLink(-1, phaseIndex, groupIndex, eventIndex, linkIndex)}
                                      disabled={
                                        linkIndex ===
                                        currProj.phases[phaseIndex].groups[groupIndex].events[eventIndex].links.length -
                                          1
                                      }
                                    >
                                      Down
                                    </Button>
                                  </div>
                                  <div className="">{bold("URL: ", link.href)}</div>
                                </div>
                              ))}

                          <div className="my-2">
                            <Button
                              className=""
                              variant="success"
                              size="sm"
                              onClick={() => addLink(phaseIndex, groupIndex, eventIndex)}
                            >
                              Add Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="my-4">
                      <Button className="" variant="success" size="sm" onClick={() => addEvent(phaseIndex, groupIndex)}>
                        Add Event
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="my-4">
                <Button className="" variant="success" size="sm" onClick={() => addGroup(phaseIndex)}>
                  Add Group
                </Button>
              </div>
            </div>
          </div>
        ))}
        <div className="my-4">
          <Button className="" variant="success" size="sm" onClick={() => addPhase()}>
            Add Phase
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container m-2 mx-auto">
      <div>{projectSelector}</div>
      <div>{projectInfo}</div>
    </div>
  );
}

export default App;

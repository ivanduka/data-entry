import React, { useEffect, useRef, useState } from "react"
import project1 from "./data/project1.json"
import project2 from "./data/project2.json"
import { Spinner, DropdownButton, Dropdown, Button } from "react-bootstrap"
import { cloneDeep, isEqual } from "lodash-es"

const run = (f: () => void) => {
  ;(async () => {
    f()
  })()
}

const useDidMountEffect = (func: () => void, deps: React.DependencyList | undefined) => {
  const didMount = useRef(false)

  useEffect(() => {
    if (didMount.current) func()
    else didMount.current = true
  }, deps)
}

const wait = async (seconds: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), seconds * 1000))

const db: { [name: string]: ITimeline } = {
  "Project 1": project1,
  "Nova Gas Transmission Ltd. - West Path Delivery 2023": project2,
}

const loadProjectsList = async () => {
  await wait(0)
  return Object.keys(db)
}

const loadProject = async (name: string) => {
  await wait(0)
  return cloneDeep(db[name])
}

const saveProject = async (name: string, project: ITimeline) => {
  await wait(0)
  db[name] = cloneDeep(project)
}

interface ITimeline {
  timelineName: string
  phases: {
    name: string
    groups: {
      name: string
      icon: string
      events: {
        name: string
        description: string
        icon: string
        dateStart: string
        dateEnd: string | null
        dateDue: boolean
        links: {
          description: string
          href: string
        }[]
      }[]
    }[]
  }[]
}

const bold = (label: string, value: string) => (
  <>
    <span className="font-bold">{label}</span>
    {value}
  </>
)

function App() {
  const [loading, setLoading] = useState<boolean>(true)
  const [projectsList, setProjectsList] = useState<string[]>([])
  const [currProj, setCurrProj] = useState<ITimeline | null>(null)
  const [proto, setProto] = useState<ITimeline | null>(null)

  useEffect(
    () =>
      run(async () => {
        const projectsList = await loadProjectsList()
        setProjectsList(projectsList)
      }),
    [],
  )

  useDidMountEffect(() => {
    setLoading(false)
  }, [projectsList, currProj])

  const getProject = async (name: string) => {
    setLoading(true)
    const proj = await loadProject(name)
    setCurrProj(proj)
    setProto(cloneDeep(proj))
  }

  const removePhase = (phaseIdx: number) => {
    if (currProj === null) return
    const cp = cloneDeep(currProj)
    cp.phases.splice(phaseIdx, 1)
    setCurrProj(cp)
  }

  const removeGroup = (phaseIdx: number, groupIdx: number) => {
    if (currProj === null) return
    const cp = cloneDeep(currProj)
    cp.phases[phaseIdx].groups.splice(groupIdx, 1)
    setCurrProj(cp)
  }

  const removeEvent = (phaseIdx: number, groupIdx: number, eventIdx: number) => {
    if (currProj === null) return
    const cp = cloneDeep(currProj)
    cp.phases[phaseIdx].groups[groupIdx].events.splice(eventIdx, 1)
    setCurrProj(cp)
  }

  const removeLink = (phaseIdx: number, groupIdx: number, eventIdx: number, linkIdx: number) => {
    if (currProj === null) return
    const cp = cloneDeep(currProj)
    cp.phases[phaseIdx].groups[groupIdx].events[eventIdx].links.splice(linkIdx, 1)
    setCurrProj(cp)
  }

  if (loading) {
    return (
      <div className="container m-2 mx-auto flex justify-center justify-center">
        <Spinner animation="border" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  const projectSelector = projectsList && (
    <DropdownButton className="my-2" title={(currProj && currProj.timelineName) || "Choose a project"}>
      {projectsList.map((p) => (
        <Dropdown.Item key={p} as="button" onClick={() => getProject(p)}>
          {p}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  )

  const projectInfo = currProj && (
    <div>
      <div className="mb-2">{bold("Project: ", currProj.timelineName)}</div>
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
                        </div>
                        <div className="">{bold("Description: ", event.description)}</div>
                        <div className="">{bold("Icon: ", event.icon)}</div>
                        <div className="">{bold("Start date: ", event.dateStart)}</div>
                        <div className="">{bold("End date: ", event.dateEnd || "none")}</div>
                        <div className="">{bold("Event due: ", event.dateDue ? "yes" : "no")}</div>
                        <div className="ml-6 mt-2">
                          {event.links.map((link, linkIndex) => (
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
                              </div>

                              <div className="">{bold("URL: ", link.href)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="container m-2 mx-auto">
      <div>{projectSelector}</div>
      <div>{projectInfo}</div>
    </div>
  )
}

export default App

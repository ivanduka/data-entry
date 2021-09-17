import React, { useEffect, useRef, useState } from "react"
import project1 from "./data/project1.json"
import project2 from "./data/project2.json"
import { Spinner, DropdownButton, Dropdown } from "react-bootstrap"
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
  await wait(1)
  return Object.keys(db)
}

const loadProject = async (name: string) => {
  await wait(1)
  return cloneDeep(db[name])
}

const saveProject = async (name: string, project: ITimeline) => {
  await wait(1)
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
          <div className="border-24 border-2 border-black rounded-2 p-2 mb-16 bg-red-200">
            <div className="font-bold mb-2">
              Phase {phaseIndex + 1} of {currProj.phases.length}
            </div>
            <div className="">{bold("Name: ", phase.name)}</div>
            <div className="ml-6 mt-8">
              {phase.groups.map((group, groupIndex) => (
                <div className="border-2 border-black rounded-2 p-2 mb-16 bg-blue-200">
                  <div className="font-bold mb-2">
                    Group {groupIndex + 1} of {phase.groups.length}
                  </div>
                  <div className="">{bold("Name: ", group.name)}</div>
                  <div className="">{bold("Icon: ", group.icon)}</div>
                  <div className="ml-6 mt-8">
                    {group.events.map((event, eventIndex) => (
                      <div className="border-2 border-black rounded-2 p-2 mb-16 bg-green-200">
                        <div className="font-bold mb-3">
                          Event {eventIndex + 1} of {group.events.length}
                        </div>
                        <div className="">{bold("Name: ", event.name)}</div>
                        <div className="">{bold("Description: ", event.description)}</div>
                        <div className="">{bold("Icon: ", event.icon)}</div>
                        <div className="">{bold("Start date: ", event.dateStart)}</div>
                        <div className="">{bold("End date: ", event.dateEnd || "none")}</div>
                        <div className="">{bold("Event due: ", event.dateDue ? "yes" : "no")}</div>
                        <div className="ml-6 mt-2">
                          {event.links.map((link, linkIndex) => (
                            <div className="border-2 border-black rounded-2 p-2 mb-2 bg-yellow-100">
                              <div className="font-bold mb-2">
                                Link {linkIndex + 1} of {event.links.length}
                              </div>
                              <div className="">{bold("Label: ", link.description)} </div>
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

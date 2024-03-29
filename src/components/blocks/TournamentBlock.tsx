import { Badge, Table } from "@mantine/core"
import { doc } from "firebase/firestore"
import React from "react"
import { useFirestore } from "../../configuration"
import { useCachedDocumentData } from "../../hooks"
import Block from "./Block"

interface Props {
  pointModifier?: Record<string, number>
  inline?: boolean
  title?: string
}

const TournamentBlock: React.FC<Props> = ({ pointModifier, inline, title }) => {
  const firestore = useFirestore()
  pointModifier = pointModifier ?? {}
  const [info] = useCachedDocumentData(doc(firestore, "/tournament/info"))

  return (
    <Block
      title={title ?? "Tournament"}
      logo="fa-solid fa-ranking-star"
      inline={inline}
    >
      <Table>
        <thead>
          <tr>
            <th>
              <i
                className="fa-solid fa-user-group"
                style={{ marginRight: 5 }}
              />
              Team
            </th>
            <th>
              <i className="fa-solid fa-trophy" style={{ marginRight: 5 }} />
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {info?.teams?.map &&
            info.teams
              .sort(
                (a: any, b: any) =>
                  b.points +
                  (pointModifier![b.name] ?? 0) -
                  a.points -
                  (pointModifier![a.name] ?? 0)
              )
              .map((team: any, index: number) => (
                <tr key={index}>
                  <td>
                    <img
                      src={`/images/teams/${team.name.toLowerCase()}.png`}
                      width={40}
                      style={{ marginRight: 10 }}
                    />
                    <div
                      style={{
                        display: "inline-flex",
                        flexDirection: "column",
                        verticalAlign: "middle",
                        maxWidth: 170,
                      }}
                    >
                      <b style={{ display: "inline" }}>{team.name}</b>
                      <span style={{ fontSize: 12 }}>{team.members}</span>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          (pointModifier![team.name] ?? 0) !== 0
                            ? "space-between"
                            : "center",
                      }}
                    >
                      {team?.points + (pointModifier![team.name] ?? 0)}
                      {(pointModifier![team.name] ?? 0) !== 0 && (
                        <Badge
                          color="green"
                          variant="filled"
                          ml="auto"
                          leftSection={<i className="fa-solid fa-plus" />}
                        >
                          {pointModifier![team.name]}
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </Table>
    </Block>
  )
}

export default TournamentBlock

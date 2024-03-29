import { Badge, Button, Loader, NumberInput, Slider } from "@mantine/core"
import { useColorScheme } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import React, { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import Particles from "react-tsparticles"
import { loadFull } from "tsparticles"
import { useAPIs, useAdmin } from "../../hooks"
import { confetti } from "../../particles"
import * as pyscript from "../../pyscript"
import { getLocalStorage, getRank, toPlacing } from "../../utilities"
import LogViewer from "../LogViewer"

const PlayPauseButton = () => {
  const [playing, setPlaying] = useState(false)

  return (
    <Button
      style={{ flex: "none", color: playing ? "black" : "white" }}
      my="xs"
      radius="20px"
      w={100}
      onClick={() => {
        // @ts-ignore
        if (!window.playing) {
          const audio = new Audio("/sounds/main.mp3")
          audio.volume = getLocalStorage("Volume", 0)
          audio.loop = true
          audio.play()

          // @ts-ignore
          window.playing = true
          // @ts-ignore
          window.audio = audio
        }
        setPlaying((p) => !p)
      }}
      leftIcon={
        playing ? (
          <i className="fa-solid fa-pause" />
        ) : (
          <i className="fa-solid fa-play" />
        )
      }
      color={playing ? "yellow.4" : "green"}
      id="playpause"
    >
      {playing ? "Pause" : "Play"}
    </Button>
  )
}

const Simulation = () => {
  const admin = useAdmin()
  const [apis, loading] = useAPIs()
  let { map, playerapis } = useParams()
  const location = useLocation()
  const [winner, setWinner] = useState<string>()
  const navigate = useNavigate()
  const colorScheme = useColorScheme()
  const showcaseMode = location.search.includes("showcase=true")

  useEffect(() => {
    // @ts-ignore
    window.showWinner = (winner: string) => {
      if (admin) {
        setWinner(winner)
        // @ts-ignore
        if (window.audio) {
          // @ts-ignore
          window.audio.pause()
        }
        setTimeout(() => {
          const audio = new Audio("/sounds/nyoooom.mp3")
          audio.volume = getLocalStorage("Volume", 0)
          audio.play()
        }, 700)
      } else {
        notifications.show({
          title: `${winner} won!`,
          message: "They finished in 1st place!",
          color: "green",
          icon: <i className="fa-solid fa-crown" />,
        })
      }
    }
  }, [])

  map = map?.split("&")[0].replaceAll("-", " ")
  playerapis = playerapis?.split("&")[0]

  const playerNames = playerapis?.split("-") ?? []

  const players = playerNames.map((api) => (api === "None" ? "" : apis[api]))

  useEffect(() => {
    if (!loading && players && playerapis) {
      pyscript.run(
        `initialize_simulation("${map}", ${JSON.stringify(
          players
        )}, ${JSON.stringify(playerapis?.split("-"))}, "${location.search}")`
      )
    }
  }, [loading])

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine)
  }, [])

  const newRank =
    getRank(
      getLocalStorage("Cached tournament/info"),
      winner!,
      getLocalStorage("Point Modifier")
    ) + 1
  const oldRank =
    getRank(getLocalStorage("Cached tournament/info"), winner!, {}) + 1

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        paddingTop: 10,
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "#000000cc" : "#ffffffcc",
          zIndex: winner === undefined ? -1 : 16,
          opacity: winner === undefined ? 0 : 1,
          transition: "1000ms ease-in-out",
        }}
      >
        <img
          src={`/images/teams/${winner?.toLowerCase()}-side.png`}
          height={100}
          style={{
            transform:
              winner === undefined ? "translateX(-90vw)" : "translateX(70vw)",
            transition: "1400ms cubic-bezier(0.8, 0, 1, 1)",
          }}
        />
        <h1 style={{ fontSize: "8vmin", margin: 0 }}>
          Congratulations, {winner}!
        </h1>
        <h2 style={{ fontSize: "6vmin", margin: 0 }}>
          {
            getLocalStorage("Cached tournament/info")?.teams?.find(
              (t: any) => t.name === winner
            )?.members
          }
        </h2>
        <h2
          style={{
            fontSize: "4.5vmin",
            margin: 0,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
          }}
        >
          Now ranked {toPlacing(newRank)}!
          {newRank < oldRank && (
            <Badge color="green" ml="xs" size="xl">
              <i className="fa-solid fa-arrow-up" style={{ marginRight: 5 }} />
              {oldRank - newRank}
            </Badge>
          )}
        </h2>
        <img
          src={`/images/teams/${winner?.toLowerCase()}.png`}
          style={{
            height: winner === undefined ? 200 : 400,
            maxHeight: "40%",
            transition: "1000ms ease-in-out",
          }}
        />
        <Button
          mt="md"
          color="green"
          leftIcon={<i className="fa-solid fa-play" />}
          onClick={() => navigate("/round")}
        >
          Continue Round
        </Button>
        <Particles init={particlesInit} options={confetti} />
      </div>

      {loading && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Fetching APIs...</p>
          <Loader />
        </div>
      )}
      {!loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            maxHeight: "100%",
          }}
        >
          <div style={{ flexGrow: 1, textAlign: "center" }}>
            {!location.search.includes("background=true") && (
              <>
                <div style={{ textAlign: "center", flexGrow: 1 }}>
                  {showcaseMode || (
                    <>
                      <NumberInput
                        id="breakpoint"
                        label="Breakpoint"
                        min={0}
                        icon={<i className="fa-solid fa-stopwatch" />}
                        display="inline-block"
                        maw="35%"
                        mr="xs"
                      />
                      <Button
                        style={{ flex: "none" }}
                        my="xs"
                        w={100}
                        leftIcon={<i className="fa-solid fa-wand-magic" />}
                        color={"grape"}
                        id="step"
                        mr="xs"
                        radius="20px"
                      >
                        Step
                      </Button>
                    </>
                  )}
                  <PlayPauseButton />
                </div>
                <p style={{ margin: 0 }}>Playback Speed</p>
                <Slider
                  style={{ flex: "none" }}
                  mb={30}
                  w={500}
                  maw="85%"
                  min={-2}
                  defaultValue={0}
                  marks={[
                    { value: -2, label: "1/4" },
                    { value: -1, label: "1/2" },
                    { value: 0, label: "1" },
                    { value: 1, label: "2" },
                    { value: 2, label: "4" },
                    { value: 3, label: "8" },
                    { value: 4, label: "16" },
                    { value: 5, label: "32" },
                    { value: 6, label: "64" },
                  ]}
                  max={6}
                  step={0.05}
                  mx="auto"
                  id="timescale"
                  label={(n) => Math.round(Math.pow(2, n) * 100) / 100}
                />
              </>
            )}
            <div
              id="loader"
              style={{
                width: "100%",
                height: "70%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p id="loadingText">Initializing simulator...</p>
              <Loader />
            </div>
            <canvas id="simulation" style={{ borderRadius: 10 }} />
          </div>

          {!showcaseMode && (
            <div
              style={{
                flex: "none",
                width: 400,
                padding: 10,
                maxHeight: "90%",
              }}
            >
              <LogViewer playerNames={playerNames} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Simulation

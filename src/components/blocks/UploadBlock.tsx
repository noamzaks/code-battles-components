import { Autocomplete, Button } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { doc, setDoc } from "firebase/firestore"
import React, { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthentication, useFirestore } from "../../configuration"
import { useAPIs, useUserAPIs } from "../../hooks"
import Block from "./Block"

const UploadBlock = () => {
  const firestore = useFirestore()
  const authentication = useAuthentication()

  const [apis] = useAPIs()
  const [userAPIs] = useUserAPIs()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  return (
    <Block title="APIs" logo="fa-solid fa-code-merge">
      <Autocomplete
        label="Name"
        icon={<i className="fa-solid fa-tag" />}
        value={name}
        onChange={setName}
        data={Object.keys(apis)}
      />
      {!(apis && userAPIs && apis[name] && !userAPIs[name]) && (
        <Button
          // variant="white"
          mt="xs"
          leftIcon={<i className="fa-solid fa-upload" />}
          fullWidth
          loading={loading}
          onClick={() => {
            ref.current?.click()
          }}
        >
          Upload
        </Button>
      )}
      <input
        type="file"
        style={{ display: "none" }}
        ref={ref}
        onChange={(e) => {
          const file = (e.currentTarget.files ?? [])[0]
          if (file) {
            setLoading(true)
            const reader = new FileReader()
            reader.onload = (e) => {
              const result = e.target?.result as string
              userAPIs[name] = result
              setDoc(
                doc(firestore, `/apis/${authentication?.currentUser?.uid}`),
                userAPIs,
                { merge: true }
              )
                .then(() => {
                  notifications.show({
                    title: "Upload successful!",
                    message: `Your '${name}' API has been uploaded succesfully!`,
                    color: "green",
                    icon: <i className="fa-solid fa-check" />,
                  })
                  setLoading(false)
                })
                .catch(() => setLoading(false))
            }
            reader.onerror = () => setLoading(false)
            reader.readAsText(file)
            e.currentTarget.value = ""
          }
        }}
      />

      {apis && apis[name] && (
        <>
          <Button
            variant="white"
            mt="xs"
            leftIcon={<i className="fa-solid fa-eye" />}
            fullWidth
            onClick={() => navigate("/view/" + name)}
          >
            View
          </Button>
          <Button
            mt="xs"
            color="red"
            leftIcon={<i className="fa-solid fa-trash" />}
            fullWidth
            onClick={() => {
              if (name) {
                delete userAPIs[name]
                setDoc(
                  doc(firestore, `/apis/${authentication?.currentUser?.uid}`),
                  userAPIs
                ).then(() => {
                  setName("")
                  notifications.show({
                    title: "Deletion successful!",
                    message: `Your '${name}' API has been succesfully deleted!`,
                    color: "green",
                    icon: <i className="fa-solid fa-check" />,
                  })
                })
              }
            }}
          >
            Delete
          </Button>
        </>
      )}
    </Block>
  )
}

export default UploadBlock